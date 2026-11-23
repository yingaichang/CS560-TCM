const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { createRequire } = require('node:module')
const { spawnSync } = require('node:child_process')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'checkin-encounter-'))
const databaseUrl = 'file:' + path.join(temporary, 'isolated.db').split(path.sep).join('/')
const clients = []
let stage = 'schema initialization'

function isolatedPrisma() {
  const file = path.join(root, 'node_modules/.prisma/client/index.js')
  const baseRequire = createRequire(file)
  const runtime = baseRequire('@prisma/client/runtime/library.js')
  const module = { exports: {} }
  const customRequire = name => name === '@prisma/client/runtime/library.js' ? {
    ...runtime,
    warnEnvConflicts: () => {},
    getPrismaClient: config => runtime.getPrismaClient({
      ...config,
      relativeEnvPaths: { rootEnvPath: null, schemaEnvPath: null },
    }),
  } : baseRequire(name)
  new Function('require', 'module', 'exports', '__dirname', '__filename', fs.readFileSync(file, 'utf8'))(
    customRequire, module, module.exports, path.dirname(file), file,
  )
  const generated = module.exports
  class TestPrismaClient extends generated.PrismaClient {
    constructor() { super({ datasourceUrl: databaseUrl, log: [] }) }
  }
  return { ...generated, PrismaClient: TestPrismaClient }
}

async function main() {
  fs.copyFileSync(path.join(root, 'prisma/schema.prisma'), path.join(temporary, 'schema.prisma'))
  fs.writeFileSync(path.join(temporary, 'isolated.db'), '')
  const initialized = spawnSync(process.execPath, [
    path.join(root, 'node_modules/prisma/build/index.js'),
    'db', 'push', '--schema', path.join(temporary, 'schema.prisma'), '--skip-generate',
  ], {
    cwd: temporary,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    encoding: 'utf8',
    timeout: 90000,
    windowsHide: true,
  })
  if (initialized.status !== 0) throw new Error('Temporary schema initialization failed')

  const client = isolatedPrisma()
  const prisma = new client.PrismaClient()
  clients.push(prisma)
  class RoutePrismaClient extends client.PrismaClient {
    constructor() { super(); clients.push(this) }
  }

  const cache = new Map()
  const safeConsole = { log() {}, error() {}, warn() {} }
  function load(relative) {
    if (cache.has(relative)) return cache.get(relative).exports
    const file = path.join(root, relative)
    const module = { exports: {} }
    cache.set(relative, module)
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText
    const customRequire = name => {
      if (name === '@prisma/client') return { ...client, PrismaClient: RoutePrismaClient }
      if (name === '@/lib/prisma') return { prisma }
      if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts')
      return require(name)
    }
    new Function('require', 'module', 'exports', 'process', 'console', output)(
      customRequire, module, module.exports,
      { env: { NODE_ENV: 'test' } }, safeConsole,
    )
    return module.exports
  }

  const { POST } = load('src/app/api/kiosk/checkin/route.ts')
  const { NextRequest } = require('next/server')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const patient = await prisma.patient.create({
    data: { patientId: 'SYN-CHECKIN-001', firstName: 'Synthetic', lastName: 'Patient' },
  })

  async function createAppointment(phone, doctorId, patientId) {
    return prisma.appointment.create({
      data: {
        name: 'Synthetic Check-in Test',
        email: 'checkin@example.test',
        phone,
        doctorId,
        date: today,
        appointmentTime: '09:00',
        service: 'synthetic-service',
        patientId,
        verifiedForCheckinAt: new Date(),
      },
    })
  }

  async function checkIn(appointmentId) {
    return POST(new NextRequest('http://127.0.0.1/api/kiosk/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkinToken: appointmentId }),
    }))
  }

  stage = 'linked check-in creates one pending encounter'
  const linkedAppointment = await createAppointment('5550100201', 'synthetic-doctor-linked', patient.id)
  const linkedResponse = await checkIn(linkedAppointment.id)
  assert.equal(linkedResponse.status, 200)
  const encounter = await prisma.encounter.findUnique({ where: { appointmentId: linkedAppointment.id } })
  assert.ok(encounter)
  assert.equal(encounter.patientId, patient.id)
  assert.equal(encounter.providerId, null)
  assert.equal(encounter.status, 'checked_in')
  assert.equal(await prisma.encounter.count({ where: { appointmentId: linkedAppointment.id } }), 1)
  assert.equal(await prisma.auditLog.count({ where: { resourceId: linkedAppointment.id, action: 'check_in' } }), 1)
  assert.equal(await prisma.auditLog.count({ where: { resourceId: encounter.id, action: 'create' } }), 1)

  stage = 'repeat check-in does not duplicate encounter'
  const duplicateResponse = await checkIn(linkedAppointment.id)
  assert.equal(duplicateResponse.status, 410)
  assert.equal(await prisma.encounter.count({ where: { appointmentId: linkedAppointment.id } }), 1)

  stage = 'unlinked check-in does not invent a patient encounter'
  const unlinkedAppointment = await createAppointment('5550100202', 'synthetic-doctor-unlinked', undefined)
  const unlinkedResponse = await checkIn(unlinkedAppointment.id)
  assert.equal(unlinkedResponse.status, 200)
  assert.equal(await prisma.encounter.count({ where: { appointmentId: unlinkedAppointment.id } }), 0)
  assert.equal(await prisma.auditLog.count({ where: { resourceId: unlinkedAppointment.id, action: 'check_in' } }), 1)

  stage = 'audit chain'
  assert.equal(await load('src/lib/auditLog.ts').verifyAuditChain(), true)
  console.log('PASS: isolated SQLite verifies linked check-in creates one unassigned encounter with audit, repeated requests do not duplicate it, and unlinked appointments create no encounter.')
}

main().catch(error => {
  console.error('Check-in encounter test failed at safe stage: ' + stage + '. Diagnostic contents withheld.')
  process.exitCode = 1
}).finally(async () => {
  await Promise.all(clients.map(client => client.$disconnect().catch(() => {})))
  const absolute = path.resolve(temporary)
  if (!absolute.startsWith(path.resolve(os.tmpdir()) + path.sep + 'checkin-encounter-')) {
    throw new Error('Unexpected temporary test directory')
  }
  fs.rmSync(absolute, { recursive: true, force: true })
})
