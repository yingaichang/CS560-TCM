const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const http = require('node:http')
const { createRequire } = require('node:module')
const { spawnSync } = require('node:child_process')
const ts = require('typescript')
const esbuild = require('esbuild')
const { chromium, expect } = require('@playwright/test')
const { writeReport } = require('./write-kiosk-test-report.cjs')

const root = path.resolve(__dirname, '..')
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'kiosk-connection-'))
const databaseUrl = 'file:' + path.join(temporary, 'isolated.db').split(path.sep).join('/')
let stage = 'initialization'
let prisma, browser, server
const clients = []

// Load the generated client with environment-file loading disabled. Every client
// receives the explicit temporary datasource; the normal project client is unused.
function isolatedPrisma() {
  const file = path.join(root, 'node_modules/.prisma/client/index.js')
  const baseRequire = createRequire(file)
  const runtime = baseRequire('@prisma/client/runtime/library.js')
  const module = { exports: {} }
  const customRequire = name => name === '@prisma/client/runtime/library.js' ? {
    ...runtime, warnEnvConflicts: () => {},
    getPrismaClient: config => runtime.getPrismaClient({ ...config, relativeEnvPaths: { rootEnvPath: null, schemaEnvPath: null } }),
  } : baseRequire(name)
  new Function('require', 'module', 'exports', '__dirname', '__filename', fs.readFileSync(file, 'utf8'))(customRequire, module, module.exports, path.dirname(file), file)
  const generated = module.exports
  class TestPrismaClient extends generated.PrismaClient {
    constructor() { super({ datasourceUrl: databaseUrl, log: [] }) }
  }
  return { ...generated, PrismaClient: TestPrismaClient }
}

async function main() {
  stage = 'temporary database schema'
  console.log('Starting isolated kiosk database and browser checks.')
  fs.copyFileSync(path.join(root, 'prisma/schema.prisma'), path.join(temporary, 'schema.prisma'))
  fs.writeFileSync(path.join(temporary, 'isolated.db'), '')
  const initialized = spawnSync(process.execPath, [path.join(root, 'node_modules/prisma/build/index.js'), 'db', 'push', '--schema', path.join(temporary, 'schema.prisma'), '--skip-generate'], {
    cwd: temporary, env: { ...process.env, DATABASE_URL: databaseUrl }, encoding: 'utf8', timeout: 90000, windowsHide: true,
  })
  if (initialized.status !== 0) {
    const diagnostic = String(initialized.stdout || '') + String(initialized.stderr || '')
    const categories = ['EPERM','EACCES','ENOENT','certificate','fetch','download','validation','URL','unknown option','timeout','SQLite'].filter(value => diagnostic.includes(value))
    const safeLines = diagnostic.split('\n').filter(line => /error|failed|denied|locked|cannot|unable/i.test(line)).map(line => line.replace(/file:[^\s\"]+/g, '[temporary database]').replace(/[A-Z]:[\\/][^\n]+/g, '[temporary path]')).slice(0, 4)
    console.log('Temporary schema check:', JSON.stringify({ status: initialized.status, errorCode: initialized.error?.code ?? null, categories, safeLines }))
    throw new Error('Temporary schema initialization failed')
  }
  const client = isolatedPrisma()
  prisma = new client.PrismaClient()
  clients.push(prisma)
  class RoutePrismaClient extends client.PrismaClient { constructor() { super(); clients.push(this) } }
  const cache = new Map()
  const deliveries = new Map()
  let rejectDelivery = false
  let baseUrl
  const safeConsole = { log() {}, error() {}, warn() {} }
  function load(relative) {
    if (cache.has(relative)) return cache.get(relative).exports
    const file = path.join(root, relative)
    const module = { exports: {} }
    cache.set(relative, module)
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText
    const customRequire = name => {
      if (name === '@prisma/client') return { ...client, PrismaClient: RoutePrismaClient }
      if (name === '@/lib/prisma') return { prisma }
      if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts')
      return require(name)
    }
    new Function('require', 'module', 'exports', 'process', 'console', output)(customRequire, module, module.exports, { env: { NODE_ENV: 'test', SMS_PROVIDER_WEBHOOK_URL: baseUrl + '/delivery' } }, safeConsole)
    return module.exports
  }
  stage = 'screen bundle'
  console.log('Temporary database ready; bundling the existing kiosk screen.')
  const bundle = await esbuild.build({
    stdin: { contents: "import React from 'react'; import { createRoot } from 'react-dom/client'; import Kiosk from './src/app/kiosk/page'; createRoot(document.getElementById('root')).render(<Kiosk />);", loader: 'tsx', resolveDir: root },
    tsconfig: path.join(root, 'tsconfig.json'), bundle: true, write: false, format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"development"' }, logLevel: 'silent',
  })
  const requests = []
  const handlers = new Map()
  server = http.createServer(async (request, response) => {
    try {
      const route = new URL(request.url, baseUrl).pathname
      if (route === '/kiosk') { response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end('<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><div id="root"></div><script src="/screen.js"></script></html>'); return }
      if (route === '/screen.js') { response.setHeader('Content-Type', 'application/javascript'); response.end(bundle.outputFiles[0].text); return }
      const parts = []
      for await (const part of request) parts.push(part)
      const body = Buffer.concat(parts).toString()
      if (route === '/delivery') {
        if (rejectDelivery) { response.statusCode = 503; response.end(); return }
        const payload = JSON.parse(body)
        deliveries.set(payload.to, payload.code)
        response.end('{}'); return
      }
      if (!['/api/kiosk/lookup', '/api/kiosk/verify', '/api/kiosk/checkin'].includes(route) || request.method !== 'POST') { response.statusCode = 404; response.end(); return }
      if (!handlers.has(route)) handlers.set(route, load('src/app' + route + '/route.ts').POST)
      const { NextRequest } = require('next/server')
      const result = await handlers.get(route)(new NextRequest(baseUrl + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }))
      requests.push({ path: route, method: 'POST', status: result.status })
      response.statusCode = result.status
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.end(await result.text())
    } catch { response.statusCode = 500; response.end('{"message":"測試服務暫時無法處理。"}') }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  baseUrl = 'http://127.0.0.1:' + server.address().port
  const date = new Date(); date.setHours(0, 0, 0, 0)
  async function appointment(phone, time, patientId) {
    return prisma.appointment.create({ data: { name: 'Synthetic Kiosk Test', email: 'kiosk@example.test', phone, doctorId: 'synthetic-doctor', date, appointmentTime: time, service: 'synthetic-service', patientId } })
  }
  const patient = await prisma.patient.create({
    data: { patientId: 'SYN-KIOSK-001', firstName: 'Synthetic', lastName: 'Patient' },
  })
  const successful = await appointment('5550100101', '09:00', patient.id)
  const incorrect = await appointment('5550100102', '10:00')
  const rejected = await appointment('5550100103', '11:00')
  stage = 'isolated browser launch'
  console.log('Loopback test services ready; opening an isolated browser.')
  const available = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', chromium.executablePath()].find(file => fs.existsSync(file))
  assert.ok(available, 'An installed test browser is required')
  browser = await chromium.launch({ executablePath: available, headless: true, args: ['--disable-background-networking'] })
  const page = await browser.newPage()
  await page.route('**/*', route => new URL(route.request().url()).origin === baseUrl ? route.continue() : route.abort())
  async function digits(value) { for (const digit of value) await page.getByRole('button', { name: digit, exact: true }).click() }
  async function lookup(phone) {
    await page.goto(baseUrl + '/kiosk')
    await page.getByRole('button', { name: '輸入手機號碼', exact: false }).click()
    await digits(phone)
    const received = page.waitForResponse(response => response.url() === baseUrl + '/api/kiosk/lookup')
    await page.getByRole('button', { name: '查詢', exact: true }).click()
    return received
  }
  stage = 'success screen to service and persisted check-in'
  console.log('Testing successful screen-to-service check-in.')
  let offset = requests.length
  assert.equal((await lookup(successful.phone)).status(), 200)
  await expect(page.getByText('請輸入 6 碼驗證碼', { exact: true })).toBeVisible()
  await digits(deliveries.get(successful.phone))
  let received = page.waitForResponse(response => response.url() === baseUrl + '/api/kiosk/verify')
  await page.getByRole('button', { name: '驗證', exact: true }).click()
  assert.equal((await received).status(), 200)
  await expect(page.getByText('預約編號', { exact: true })).toBeVisible()
  received = page.waitForResponse(response => response.url() === baseUrl + '/api/kiosk/checkin')
  await page.getByRole('button', { name: '確認報到', exact: true }).click()
  assert.equal((await received).status(), 200)
  await expect(page.getByText('報到成功', { exact: true })).toBeVisible()
  const saved = await prisma.appointment.findUniqueOrThrow({ where: { id: successful.id } })
  assert.equal(saved.checkedIn, true)
  assert.equal(saved.status, 'checked_in')
  assert.ok(saved.checkedInAt)
  assert.equal(saved.verifiedForCheckinAt, null)
  assert.equal(await prisma.auditLog.count({ where: { resourceId: successful.id, action: 'check_in' } }), 1)
  const encounter = await prisma.encounter.findUnique({ where: { appointmentId: successful.id } })
  assert.ok(encounter, 'A linked check-in must create exactly one encounter')
  assert.equal(encounter.patientId, patient.id)
  assert.equal(encounter.providerId, null, 'Kiosk check-in must not invent a provider assignment')
  assert.equal(encounter.status, 'checked_in')
  assert.equal(await prisma.encounter.count({ where: { appointmentId: successful.id } }), 1)
  assert.equal(await prisma.auditLog.count({ where: { resourceId: encounter.id, action: 'create' } }), 1)
  const successRequests = requests.slice(offset)
  assert.deepEqual(successRequests.map(item => item.path), ['/api/kiosk/lookup', '/api/kiosk/verify', '/api/kiosk/checkin'])
  await expect(page.getByRole('button', { name: '輸入手機號碼', exact: false })).toBeVisible({ timeout: 6000 })
  stage = 'wrong-code rejection returns to screen'
  offset = requests.length
  assert.equal((await lookup(incorrect.phone)).status(), 200)
  const correct = deliveries.get(incorrect.phone)
  const wrong = correct === '000000' ? '111111' : '000000'
  await digits(wrong)
  received = page.waitForResponse(response => response.url() === baseUrl + '/api/kiosk/verify')
  await page.getByRole('button', { name: '驗證', exact: true }).click()
  assert.equal((await received).status(), 401)
  await expect(page.getByText('驗證碼不正確，請再試一次。', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '確認報到', exact: true })).toHaveCount(0)
  const denied = await prisma.appointment.findUniqueOrThrow({ where: { id: incorrect.id } })
  assert.equal(denied.checkedIn, false)
  assert.equal(denied.verificationAttempts, 1)
  assert.equal(await prisma.auditLog.count({ where: { resourceId: incorrect.id, action: 'verification_failed' } }), 1)
  const failureRequests = requests.slice(offset)
  assert.ok(!failureRequests.some(item => item.path === '/api/kiosk/checkin'))
  stage = 'delivery rejection fails closed on screen'
  rejectDelivery = true
  offset = requests.length
  assert.equal((await lookup(rejected.phone)).status(), 503)
  await expect(page.getByText('驗證簡訊暫時無法傳送，請稍後再試或洽櫃檯協助。', { exact: true })).toBeVisible()
  await expect(page.getByText('請輸入 6 碼驗證碼', { exact: true })).toHaveCount(0)
  const notDelivered = await prisma.appointment.findUniqueOrThrow({ where: { id: rejected.id } })
  assert.equal(notDelivered.checkedIn, false)
  assert.equal(notDelivered.verificationCode, null)
  assert.equal(notDelivered.verificationCodeExpiresAt, null)
  const deliveryRequests = requests.slice(offset)
  stage = 'audit-chain integrity'
  assert.equal(await load('src/lib/auditLog.ts').verifyAuditChain(), true)
  const report = {
    at: new Date().toISOString(), result: 'passed', command: 'node scripts/test-kiosk-connection.cjs',
    scope: '以實際畫面、三個既有 POST 處理函式、暫存 SQLite 與本機簡訊替身通過成功報到、錯碼拒絕及簡訊拒收的瀏覽器整合測試，並核對儲存狀態與稽核；未驗證 Next 中介層、正式部署、真實簡訊或掃描設備。',
    components: ['kiosk', 'kioskApi', 'clinicalWrite', 'sms'], connections: ['kiosk-request', 'kiosk-save', 'kiosk-sms', 'kiosk-audit', 'checkin-encounter'],
    cases: [
      { name: '成功報到', result: 'passed', requests: successRequests, screen: '顯示報到成功後返回首頁', savedCheckin: true, encounterCreatedOnce: true, auditVerified: true },
      { name: '錯誤驗證碼', result: 'passed', requests: failureRequests, screen: '顯示錯碼提示，未進入確認報到', savedCheckin: false, auditVerified: true },
      { name: '簡訊替身拒收', result: 'passed', requests: deliveryRequests, screen: '顯示安全錯誤，未宣稱已傳送', challengeInvalidated: true },
    ],
  }
  writeReport(root, report)
  console.log('PASS: real screen -> existing handlers -> isolated SQLite; linked check-in creates one unassigned encounter, success 200/200/200, wrong code 401, delivery rejection 503. Screen results, saved state, audit events, and audit-chain integrity verified. No production data or real SMS used.')
  await Promise.all(clients.map(client => client.$disconnect()))
}

main().catch(error => {
  // Do not leave an older pass presented as the latest attempt after a failure.
  writeReport(root, {
    at: new Date().toISOString(), result: 'failed', command: 'node scripts/test-kiosk-connection.cjs',
    scope: '最近一次本機隔離報到測試未通過；診斷內容不公開。',
    components: ['kiosk', 'kioskApi', 'clinicalWrite', 'sms'],
    connections: ['kiosk-request', 'kiosk-save', 'kiosk-sms', 'kiosk-audit', 'checkin-encounter'], cases: [],
  })
  if (stage === 'screen bundle') console.log('Bundle check:', JSON.stringify({ code: error.code ?? null, categories: ['EACCES','EPERM','EPIPE','resolve','stopped','spawn'].filter(value => String(error.message).includes(value)), compilerMessages: error.errors?.map(item => item.text.replace(/[A-Z]:[\\/][^\n]+/g, '[source path]')).slice(0, 3) ?? [] }))
  console.error('Kiosk integration check failed at safe stage: ' + stage + '. Sensitive diagnostic contents withheld.'); process.exitCode = 1
}).finally(async () => {
  await browser?.close().catch(() => {})
  if (server) await new Promise(resolve => server.close(resolve))
  await Promise.all(clients.map(client => client.$disconnect().catch(() => {})))
  const absolute = path.resolve(temporary)
  if (!absolute.startsWith(path.resolve(os.tmpdir()) + path.sep + 'kiosk-connection-')) throw new Error('Unexpected temporary test directory')
  fs.rmSync(absolute, { recursive: true, force: true })
})
