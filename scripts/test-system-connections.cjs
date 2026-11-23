const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const { EventEmitter } = require('node:events')
function load(file, overrides) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText
  const target = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => Object.hasOwn(overrides, name) ? overrides[name] : require(name), target, target.exports)
  return target.exports
}
const keys = ['DATABASE_URL','CLERK_SECRET_KEY','NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY','SMTP_HOST','SMTP_USER','SMTP_PASS','SMTP_PORT','SMTP_SECURE','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','CLERK_WEBHOOK_SIGNING_SECRET','SMS_PROVIDER_WEBHOOK_URL','DEPLOYMENT_TARGET','SITE_BUILD_REVISION']
const before = Object.fromEntries(keys.map(key => [key, process.env[key]]))
async function fixture(options = {}) {
  for (const key of keys) delete process.env[key]
  Object.assign(process.env, { DATABASE_URL: 'postgresql://synthetic.invalid/test', CLERK_SECRET_KEY: 'synthetic', NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'synthetic', SMTP_HOST: 'synthetic.invalid', SMTP_USER: 'synthetic', SMTP_PASS: 'PRIVATE_CANARY', STRIPE_SECRET_KEY: 'synthetic', DEPLOYMENT_TARGET: 'ubuntu', SITE_BUILD_REVISION: 'a'.repeat(40) + '-config' })
  let requests = 0
  const queries = []
  const originalFetch = global.fetch
  global.fetch = async url => {
    requests++
    const homepage = '/_next/static/chunks/app/page-abc.js'
    return {
      status: options.stripeDenied && url.includes('stripe.com') ? 401 : 200,
      arrayBuffer: async () => Buffer.from('PRIVATE_CANARY'),
      text: async () => options.routingMismatch && url.includes('https://cse03') ? 'old deployment' : homepage,
    }
  }
  try {
    const service = load('src/lib/systemConnections.ts', {
      'server-only': {},
      'node:http': { request: (options, callback) => {
        assert.equal(options.headers.Host, 'cse03.tcmusa.ai', 'Internal Caddy requests must preserve the public Host')
        const request = new EventEmitter()
        request.setTimeout = () => {}
        request.destroy = error => request.emit('error', error)
        request.end = () => queueMicrotask(() => {
          const response = new EventEmitter()
          response.statusCode = 200
          response.setEncoding = () => {}
          callback(response)
          response.emit('data', '/_next/static/chunks/app/page-abc.js')
          response.emit('end')
        })
        return request
      } },
      'node:fs/promises': { readFile: async file => file.endsWith('deployment-status.json')
        ? JSON.stringify({ target: 'ubuntu', result: 'passed', revision: (options.staleRevision ? 'b' : 'a').repeat(40) })
        : 'model User {\n id String\n email String\n}' },
      '@/lib/prisma': { prisma: {
        $queryRaw: async pieces => { const sql = pieces.join(''); queries.push(sql); return sql.includes('information_schema') ? [{ table_name: 'User', column_name: 'id' }, { table_name: 'User', column_name: 'email' }] : [{ value: 1 }] },
      } },
      nodemailer: { createTransport: () => ({ verify: async () => { if (options.smtpDenied) throw Object.assign(new Error('PRIVATE_CANARY'), { code: 'EAUTH' }) }, close() {} }) },
    })
    const report = await service.getSystemConnections()
    assert.deepEqual(await service.getSystemConnections(), report)
    assert.ok(requests <= 4, 'Thirty-second cache must avoid repeating external probes')
    assert.ok(queries.every(sql => /^SELECT/.test(sql)), 'Health checks must be read-only')
    assert.ok(!JSON.stringify(report).includes('PRIVATE_CANARY'), 'Raw credentials/errors/bodies must never enter status metadata')
    return report
  } finally { global.fetch = originalFetch }
}
async function main() {
  const healthy = await fixture()
  const check = (report, id) => report.checks.find(item => item.id === id)
  for (const id of ['database','schema','identity','mail','stripe','ubuntu','publicDomain']) assert.equal(check(healthy,id).status,'connected',id)
  for (const id of ['stripeWebhook','clerkWebhook','sms']) assert.equal(check(healthy,id).status,'partly_connected',id)
  const failures = await fixture({ stripeDenied: true, smtpDenied: true, routingMismatch: true })
  for (const id of ['stripe','mail','publicDomain']) assert.equal(check(failures,id).status,'failed',id)
  assert.equal(check(await fixture({ staleRevision: true }), 'ubuntu').status, 'partly_connected')
  const overlay = load('src/lib/architectureLiveStatus.ts', {})
  const components = { db: { status: 'unknown' }, identity: { status: 'unknown' }, mail: { status: 'unknown' }, stripe: { status: 'unknown' }, ubuntuHost: { status: 'planned' }, databaseServer: { status: 'planned' }, portals: { status: 'planned' } }
  const connections = [{ id: 'ubuntu-application', status: 'planned' }, { id: 'portal-entitlements', status: 'planned' }]
  const result = overlay.withLiveSystemStatus(components, connections, healthy)
  assert.equal(result.components.db.status,'connected')
  assert.equal(result.components.ubuntuHost.status,'connected')
  assert.equal(result.components.portals.status,'planned', 'A successful service probe cannot promote an unfinished feature')
  assert.equal(result.connections[1].status,'planned')
  const external = [{ id: 'contact-mail', status: 'partly_connected' }, { id: 'payment-platform', status: 'partly_connected' }]
  const healthyExternal = overlay.withLiveSystemStatus(components, external, healthy)
  assert.ok(healthyExternal.connections.every(item => item.status === 'partly_connected'), 'Read-only success cannot replace complete workflow evidence')
  const failedExternal = overlay.withLiveSystemStatus(components, external, failures)
  assert.ok(failedExternal.connections.every(item => item.status === 'failed'), 'Real rejected credentials must remain visible on the affected connection')
  assert.ok(failedExternal.connections.every(item => item.liveObservation.source === 'Real Read-only Service Check'))
  assert.equal(components.ubuntuHost.status,'planned', 'Runtime overlays must not mutate static source evidence')
  console.log('PASS: authenticated-service probes, live DB/schema checks, routing mismatch, rejected credentials, stale deployment evidence, caching, secret exclusion, and no promotion of unfinished features.')
}
main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => {
  for (const key of keys) { if (before[key] === undefined) delete process.env[key]; else process.env[key] = before[key] }
})
