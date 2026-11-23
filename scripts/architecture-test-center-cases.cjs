const assert = require('node:assert/strict')
const { randomUUID, createHmac } = require('node:crypto')
const { NextRequest } = require('next/server')

module.exports = async function architectureCases({ load, prisma, actor, setActor, testEnv }) {
  const base = 'http://synthetic.invalid'
  const request = (body, headers = {}, raw) => new NextRequest(base + '/api/test', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, ...headers }, body: raw ?? JSON.stringify(body) })
  const check = async (response, status) => { assert.equal(response.status, status); return response.json() }
  const fixtures = load('src/lib/architectureTests/fixtures.ts')
  const simulate = load('src/app/api/admin/development/architecture-tests/simulate/route.ts').POST
  const live = load('src/app/api/admin/development/architecture-tests/live/route.ts').POST
  const catalog = load('src/app/api/admin/development/architecture-tests/route.ts').GET
  const envelope = scenario => ({ runId: randomUUID(), scenario, source: 'Development Simulation', input: fixtures.scenarioFixtures[scenario] })
  const body = envelope('kiosk-arrival')
  for (const role of [null, 'clinic_staff', 'provider', 'billing_staff', 'student', 'customer', 'user']) {
    setActor(role ? { ...actor, role } : null)
    await check(await catalog(), 403)
    await check(await simulate(request(body)), 403)
    await check(await live(request({ runId: randomUUID() })), 403)
  }
  setActor(actor)
  testEnv.ARCHITECTURE_SIMULATION_ENABLED = 'true'
  testEnv.NODE_ENV = 'production'
  await check(await simulate(request(body)), 404)
  assert.equal((await check(await catalog(), 200)).simulationEnabled, false)
  testEnv.NODE_ENV = 'development'
  testEnv.ARCHITECTURE_SIMULATION_ENABLED = 'false'
  await check(await simulate(request(body)), 404)
  testEnv.ARCHITECTURE_SIMULATION_ENABLED = 'true'
  await check(await simulate(request(body, { Origin: 'https://other.invalid' })), 403)
  await check(await simulate(request(body, { Origin: '' })), 403)
  await check(await simulate(request({}, {}, '{')), 400)
  await check(await simulate(request({}, {}, 'x'.repeat(16385))), 413)
  await check(await simulate(request({ ...body, source: 'Real Device' })), 400)
  await check(await simulate(request({ ...body, input: { ...body.input, realRecord: 'forbidden' } })), 400)
  const businessBefore = await Promise.all([prisma.patient.count(), prisma.appointment.count(), prisma.encounter.count(), prisma.healthTopicRegistration.count()])
  for (const scenario of fixtures.scenarioIds) {
    const fixture = scenario === body.scenario ? body : envelope(scenario)
    const run = await check(await simulate(request(fixture)), 200)
    assert.equal(run.source, 'Development Simulation')
    assert.notEqual(run.status, 'Passed')
    const auditCount = await prisma.auditLog.count()
    const replay = await check(await simulate(request(fixture)), 200)
    assert.equal(replay.duplicate, true)
    assert.deepEqual(replay.steps.map(s => [s.id, s.status]).sort(), run.steps.map(s => [s.id, s.status]).sort())
    assert.equal(await prisma.auditLog.count(), auditCount)
  }
  await check(await simulate(request({ ...envelope('measurements'), runId: body.runId })), 409)
  setActor({ ...actor, externalUserId: actor.externalUserId + '-other-admin' })
  await check(await simulate(request(body)), 409)
  setActor(actor)
  const report = await check(await catalog(), 200)
  assert.equal(report.history.length, 9)
  assert.equal(report.historyStatus, 'Passed')
  const audit = await prisma.auditLog.findMany({ where: { module: 'architecture_test' } })
  assert.ok(audit.length > 9)
  assert.ok(audit.every(e => e.source === 'Development Simulation' && e.patientId === null))
  assert.doesNotMatch(JSON.stringify(audit.map(e => e.summary)), /2025550101|000000|Fictional patient-reported|example.test/)
  assert.deepEqual(await Promise.all([prisma.patient.count(), prisma.appointment.count(), prisma.encounter.count(), prisma.healthTopicRegistration.count()]), businessBefore)
  await check(await live(request({ runId: randomUUID() }, { Origin: '' })), 403)
  const runId = randomUUID()
  const readOnly = await check(await live(request({ runId })), 200)
  assert.equal(readOnly.source, 'Application Read-only Check')
  assert.equal(readOnly.steps[0].status, 'Passed')
  assert.equal((await check(await live(request({ runId })), 200)).duplicate, true)
  const receive = load('src/app/api/integrations/[service]/route.ts').POST
  const context = service => ({ params: Promise.resolve({ service }) })
  await check(await receive(request({}), context('not-supported')), 404)
  await check(await receive(request({}), context('scanner')), 503)
  const secret = 'fictional-adapter-signing-secret-for-isolated-tests'
  testEnv.INTEGRATION_RECEIPTS_ENABLED = 'true'
  const validEvents = {
    scanner: fixtures.scenarioFixtures['kiosk-arrival'].scanner,
    sms: { version: 1, eventId: randomUUID(), occurredAt: new Date().toISOString(), kind: 'sms.delivery', data: { messageId: 'sim_message_001', status: 'delivered', attempt: 1 } },
    voice: fixtures.scenarioFixtures['voice-intake'].result,
    learning: fixtures.scenarioFixtures['course-completion'],
    storage: fixtures.scenarioFixtures['document-storage'],
    measurements: fixtures.scenarioFixtures.measurements[0],
  }
  const signed = (service, data, headers = {}, timestamp = String(Math.floor(Date.now() / 1000))) => {
    const raw = JSON.stringify(data)
    const signature = 'sha256=' + createHmac('sha256', secret).update(timestamp + '.' + service + '.' + raw).digest('hex')
    return request(data, { 'x-adapter-timestamp': timestamp, 'x-adapter-signature': signature, ...headers })
  }
  for (const [service, event] of Object.entries(validEvents)) {
    testEnv[service.toUpperCase() + '_ADAPTER_SIGNING_SECRET'] = secret
    const responses = await Promise.all([receive(signed(service, event), context(service)), receive(signed(service, event), context(service))])
    const result = await Promise.all(responses.map(response => check(response, 202)))
    assert.equal(result.filter(r => r.duplicate).length, 1)
    assert.ok(result.every(r => r.accepted && !r.applied && r.status === 'Planned'))
    await check(await receive(signed(service, { ...event, occurredAt: '2031-01-01T00:00:00.000Z' }), context(service)), 409)
  }
  await check(await receive(signed('scanner', validEvents.scanner, { 'x-adapter-signature': 'sha256=' + '0'.repeat(64) }), context('scanner')), 401)
  await check(await receive(signed('scanner', validEvents.scanner, {}, String(Math.floor(Date.now() / 1000) - 601)), context('scanner')), 401)
  await check(await receive(signed('scanner', { ...validEvents.scanner, source: 'Development Simulation' }), context('scanner')), 400)
  await check(await receive(signed('scanner', validEvents.scanner, { 'Content-Type': 'text/plain' }), context('scanner')), 415)
  await check(await receive(signed('scanner', validEvents.scanner, { 'Content-Type': 'application/jsoninvalid' }), context('scanner')), 415)
  await check(await receive(signed('scanner', validEvents.scanner), context('sms')), 401)
  await check(await receive(request({}, {}, 'x'.repeat(16385)), context('scanner')), 413)
  const receiverReport = await check(await catalog(), 200)
  assert.equal(receiverReport.receipts.length, 6)
  assert.ok(receiverReport.receipts.every(r => r.status === 'Planned'))
  const adapterAudit = await prisma.auditLog.findMany({ where: { module: 'integration_adapter' } })
  assert.equal(adapterAudit.length, 6)
  assert.ok(adapterAudit.every(e => e.source === 'External Adapter' && e.patientId === null && e.outcome === 'Planned'))
  assert.doesNotMatch(JSON.stringify(adapterAudit.map(e => e.summary)), /Fictional patient-reported|dev_sim|00000000-0000|fictional-adapter-signing/)
  const findMany = prisma.auditLog.findMany
  prisma.auditLog.findMany = async () => { throw new Error('Fictional DB outage') }
  try { assert.equal((await check(await catalog(), 200)).historyStatus, 'Failed') } finally { prisma.auditLog.findMany = findMany }
  const transaction = prisma.$transaction
  prisma.$transaction = async () => { throw new Error('Fictional audit outage') }
  try {
    await check(await simulate(request(envelope('measurements'))), 503)
    await check(await receive(signed('scanner', { ...validEvents.scanner, eventId: randomUUID() }), context('scanner')), 503)
  } finally { prisma.$transaction = transaction }
  testEnv.NODE_ENV = 'test'
}
