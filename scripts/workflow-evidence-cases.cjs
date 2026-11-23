const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { randomUUID, createHmac } = require('node:crypto')
const { NextRequest } = require('next/server')
const renderScreen = require('./render-workflow-screen.cjs')
const digest = require('./workflow-source-digest.cjs')

module.exports = async function workflowEvidence({ load, prisma, actor, setActor, testEnv }) {
  const root = path.resolve(__dirname, '..'), results = new Map()
  const source = fs.readFileSync(path.join(root, 'src/lib/architectureMap.ts'), 'utf8')
  const start = source.indexOf('= ', source.indexOf('export const connectionDefinitions')) + 2
  const definitions = JSON.parse(source.slice(start, source.indexOf('\n]', start) + 2))
  const request = (body, headers = {}, url = '/test') => new NextRequest('http://synthetic.invalid' + url, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://synthetic.invalid', ...headers }, body: JSON.stringify(body) })
  const get = url => new NextRequest('http://synthetic.invalid' + url)
  const context = id => ({ params: Promise.resolve({ id }) })
  async function response(value, expected) { assert.equal(value.status, expected); return value.json() }
  const auditExists = async where => assert.ok(await prisma.auditLog.count({ where }))
  const patients = load('src/app/api/ehr/patients/route.ts')
  const appointments = load('src/app/api/appointments/route.ts')
  const workflow = load('src/app/api/ehr/workflow/route.ts')
  const contacts = load('src/app/api/contact/route.ts')
  const registrations = load('src/app/api/admin/registrations/route.ts')
  const audits = load('src/app/api/admin/audit-logs/route.ts')
  const verify = load('src/app/api/admin/audit-logs/verify-chain/route.ts')
  async function receive(url) {
    if (url.startsWith('/api/admin/audit-logs')) return audits.GET(get(url))
    if (url.startsWith('/api/appointments')) return appointments.GET(get(url))
    if (url.startsWith('/api/ehr/patients/')) return load('src/app/api/ehr/patients/[id]/route.ts').GET(get(url), context(url.split('/').pop()))
    if (url.startsWith('/api/ehr/patients')) return patients.GET(get(url))
    if (url.startsWith('/api/ehr/workflow')) return workflow.GET()
    if (url.startsWith('/api/ehr/encounters')) return load('src/app/api/ehr/encounters/route.ts').GET()
    if (url.startsWith('/api/contact')) return contacts.GET()
    if (url.startsWith('/api/admin/registrations')) return registrations.GET()
    if (url.startsWith('/api/holidays')) return load('src/app/api/holidays/route.ts').GET(get(url))
    if (url.startsWith('/api/admin/development/architecture-tests')) return load('src/app/api/admin/development/architecture-tests/route.ts').GET()
    throw new Error('Unlisted screen request')
  }
  const screen = (file, props = {}, exported = 'default') => renderScreen(file, exported, props, receive)
  const sourceName = 'Isolated Application Test (fictional records; identity/provider fixtures)'
  async function group(ids, operations, detail) {
    const stages = {}, cases = []
    for (const name of ['service', 'record', 'managementScreen', 'audit', 'finalResult', 'negativeCase']) {
      const operation = operations[name]
      if (!operation) { stages[name] = { status: 'Not Tested', detail: 'No executable evidence for this stage.' }; continue }
      try { await operation(); stages[name] = { status: 'Passed', detail: detail[name] || 'Executed assertion against the isolated application.' } }
      catch (error) { console.error(JSON.stringify({workflowCase:ids[0],stage:name,errorType:error.name,actual:error.actual,expected:error.expected,code:error.code})); stages[name] = { status: 'Failed', detail: 'Isolated assertion failed. Raw records and diagnostics withheld.' } }
      cases.push({ id: name, result: stages[name].status, evidence: 'scripts/workflow-evidence-cases.cjs' })
    }
    for (const id of ids) results.set(id, { id, at: new Date().toISOString(), source: sourceName, scope: 'Actual handlers, isolated PostgreSQL and receiving component effects/rendering. Not a browser click-through or real provider result.', stages: structuredClone(stages), cases: cases.map(c => ({ ...c, id: id + ':' + c.id })) })
  }
  setActor(actor)
  let patient, booking, holiday
  const patientKey = randomUUID(), patientBody = { firstName: 'Workflow', lastName: 'Fictional', email: 'workflow@example.test' }
  await group(['patient-entry', 'patient-save'], {
    service: async () => { patient = (await response(await patients.POST(request(patientBody, { 'Idempotency-Key': patientKey })), 201)).patient },
    record: async () => { assert.equal((await prisma.patient.findUniqueOrThrow({ where: { id: patient.id } })).email, patientBody.email) },
    managementScreen: async () => { assert.ok((await screen('src/app/ehr/EhrScreens.tsx', {}, 'PatientDirectoryScreen')).includes(patient.patientId)) },
    audit: () => auditExists({ resourceId: patient.id, action: 'create', source: 'ehr.patient-create' }),
    finalResult: async () => { const data = await response(await load('src/app/api/ehr/patients/[id]/route.ts').GET(get('/test'), context(patient.id)), 200); assert.equal(data.patient.id, patient.id) },
    negativeCase: async () => { assert.equal((await response(await patients.POST(request(patientBody, { 'Idempotency-Key': patientKey })), 200)).patient.id, patient.id); await response(await patients.POST(request({ ...patientBody, firstName: 'Conflict' }, { 'Idempotency-Key': patientKey })), 409); setActor(null); try { await response(await patients.POST(request(patientBody)), 403) } finally { setActor(actor) } },
  }, { managementScreen: 'Real patient directory consumed the actual authorized handler response and rendered the persisted patient reference.', negativeCase: 'Identical retry preserved one record; changed payload conflicted; anonymous write was denied.' })
  await group(['clinical-write', 'clinical-persist'], {
    service: async () => { assert.equal((await response(await workflow.GET(), 200)).billingRecords[0].status, 'reviewed') },
    record: async () => { assert.equal((await prisma.clinicalNote.findFirstOrThrow()).status, 'signed'); assert.equal((await prisma.billingRecord.findFirstOrThrow()).status, 'reviewed'); assert.equal((await prisma.patientMedication.findFirstOrThrow()).active, false) },
    managementScreen: async () => { assert.ok((await screen('src/app/ehr/WorkflowScreen.tsx', { module: 'billing' })).includes('reviewed')); assert.ok((await screen('src/app/ehr/WorkflowScreen.tsx', { module: 'medications' })).includes('Fictional medicine')) },
    audit: () => auditExists({ resource: 'clinical_note' }),
    finalResult: async () => { assert.equal(await load('src/lib/auditLog.ts').verifyAuditChain(), true) },
    negativeCase: async () => { testEnv.NODE_ENV = 'production'; try { await response(await workflow.POST(request({ action: 'record_treatment' })), 403) } finally { testEnv.NODE_ENV = 'test' } },
  }, { record: 'Signed note, reviewed linked billing and stopped medication from the preceding real handler workflow persisted.', managementScreen: 'Real billing and medication components rendered actual saved handler responses.', negativeCase: 'Production clinical write remained denied; baseline also exercises revoked access, immutable notes, stale versions and duplicate treatments.' })
  await group(['booking-submit', 'booking-save', 'booking-manage', 'booking-patient'], {
    service: async () => { booking = await prisma.appointment.findFirstOrThrow({ where: { phone: '5550100123' } }); const edit = load('src/app/api/appointments/[id]/route.ts'); await response(await edit.PATCH(request({ patientId: patient.id, expectedUpdatedAt: booking.updatedAt.toISOString() }), context(booking.id)), 200) },
    record: async () => { assert.equal((await prisma.appointment.findUniqueOrThrow({ where: { id: booking.id } })).patientId, patient.id) },
    managementScreen: async () => { const html = await screen('src/app/admin/appointments/page.tsx'); assert.ok(html.includes('5550100123')); assert.ok(html.includes('Workflow')) },
    audit: () => auditExists({ resourceId: booking.id, action: 'link_patient', source: 'admin.appointments' }),
    finalResult: async () => { const data = await response(await load('src/app/api/appointments/[id]/route.ts').GET(get('/test'), context(booking.id)), 200); assert.equal(data.patientId, patient.id) },
    negativeCase: async () => { await response(await load('src/app/api/appointments/[id]/route.ts').PATCH(request({ patientId: 'cm000000000000000000009999' }), context(booking.id)), 404); assert.equal((await prisma.appointment.findUniqueOrThrow({ where: { id: booking.id } })).patientId, patient.id) },
  }, { record: 'Persisted booking and explicit selected-patient association; no inferred person merge.', managementScreen: 'Real appointment management component consumed actual list and patient responses.', negativeCase: 'Unknown patient association was rejected without replacing the valid link. Baseline covers concurrent slot conflicts and stale edits.' })
  const holidayApi = load('src/app/api/holidays/route.ts')
  await group(['holiday-management'], {
    service: async () => { holiday = await response(await holidayApi.POST(request({ date: new Date().getFullYear() + '-12-24', name: 'Workflow Fictional Closure', isClosed: true })), 201) },
    record: async () => { assert.equal((await prisma.holiday.findUniqueOrThrow({ where: { id: holiday.id } })).isClosed, true) },
    managementScreen: async () => { assert.ok((await screen('src/app/admin/holidays/page.tsx')).includes('Workflow Fictional Closure')) },
    audit: () => auditExists({ resourceId: holiday.id, action: 'create', source: 'admin.holiday-calendar' }),
    finalResult: async () => { assert.ok((await response(await holidayApi.GET(get('/api/holidays')), 200)).some(h => h.id === holiday.id)) },
    negativeCase: async () => { await response(await holidayApi.POST(request({ date: new Date().getFullYear() + '-12-24', name: 'Duplicate' })), 409); setActor(null); try { await response(await holidayApi.DELETE(get('/api/holidays?id=' + holiday.id)), 403) } finally { setActor(actor) } },
  }, {})
  let contact
  await group(['contact-submit', 'contact-storage'], {
    service: async () => { contact = await prisma.contact.findFirstOrThrow({ where: { email: 'inbox@example.test', emailDeliveryStatus: 'sent' } }); await response(await load('src/app/api/admin/contacts/[id]/route.ts').PATCH(request({ status: 'in_progress' }), context(contact.id)), 200) },
    record: async () => { assert.equal((await prisma.contact.findUniqueOrThrow({ where: { id: contact.id } })).status, 'in_progress') },
    managementScreen: async () => { const html = await screen('src/app/admin/contacts/page.tsx'); assert.ok(html.includes('inbox@example.test')); assert.ok(html.includes('in_progress')) },
    audit: () => auditExists({ resourceId: contact.id, action: 'update_status', source: 'admin.contact-inbox' }),
    finalResult: async () => { assert.ok((await response(await contacts.GET(), 200)).some(c => c.id === contact.id && c.status === 'in_progress')) },
    negativeCase: async () => { const count = await prisma.auditLog.count({ where: { resourceId: contact.id, action: 'update_status' } }); await response(await load('src/app/api/admin/contacts/[id]/route.ts').PATCH(request({ status: 'in_progress' }), context(contact.id)), 200); assert.equal(await prisma.auditLog.count({ where: { resourceId: contact.id, action: 'update_status' } }), count); setActor(null); try { await response(await contacts.GET(), 403) } finally { setActor(actor) } },
  }, { negativeCase: 'Repeated management status did not duplicate its audit event; anonymous inbox read was denied.' })
  await group(['payment-request', 'payment-registration', 'registration-persist'], {
    service: async () => { assert.equal((await response(await registrations.GET(), 200)).registrations[0].status, 'paid') },
    record: async () => { assert.equal((await prisma.healthTopicRegistration.findUniqueOrThrow({ where: { checkoutSessionId: 'cs_test_syntheticCheckout' } })).status, 'paid') },
    managementScreen: async () => { assert.ok((await screen('src/app/admin/registrations/page.tsx')).includes('cs_test_syntheticCheckout')) },
    audit: () => auditExists({ action: 'checkout_session_created' }),
    finalResult: async () => { assert.equal((await response(await load('src/app/api/payment/registration/route.ts').GET(get('/api/payment/registration?sessionId=cs_test_syntheticCheckout')), 200)).status, 'paid') },
    negativeCase: async () => { await response(await load('src/app/api/payment/registration/route.ts').GET(get('/api/payment/registration?sessionId=invalid')), 400); setActor(null); try { await response(await registrations.GET(), 403) } finally { setActor(actor) } },
  }, { record: 'Locally signed Stripe fixtures updated the matching isolated registration; no real payment occurred.', negativeCase: 'Malformed lookup and anonymous management read denied. Baseline covers signature errors, wrong amount, event replay and late failure.' })
  // Clerk fixtures are signed locally and verified by the actual SDK, never by
  // an accepting stub. They prove event handling, not an actual identity login.
  const clerk = load('src/app/api/webhooks/clerk/route.ts')
  testEnv.CLERK_WEBHOOK_SIGNING_SECRET = 'whsec_' + Buffer.from('fictional-isolated-clerk-signing-secret').toString('base64')
  const event = { type: 'session.created', data: { id: 'sess_workflow_fictional', user_id: 'user_workflow_fictional' } }
  const eventId = 'msg_workflow_fictional', timestamp = String(Math.floor(Date.now() / 1000))
  const signature = 'v1,' + createHmac('sha256', Buffer.from(testEnv.CLERK_WEBHOOK_SIGNING_SECRET.slice(6), 'base64')).update(eventId + '.' + timestamp + '.' + JSON.stringify(event)).digest('base64')
  const signed = () => request(event, { 'svix-id': eventId, 'svix-timestamp': timestamp, 'svix-signature': signature })
  await group(['identity-session'], {
    service: async () => { await response(await clerk.POST(signed()), 200) },
    record: async () => { assert.ok(await prisma.auditWebhookReceipt.findUnique({ where: { id: 'clerk:' + eventId } })) },
    managementScreen: async () => { const html = await renderScreen('src/app/admin/audit-logs/AuditLogViewer.tsx', 'default', {}, () => audits.GET(get('/api/admin/audit-logs?source=auth.clerk-webhook'))); assert.ok(html.includes('login_succeeded')) },
    audit: () => auditExists({ source: 'auth.clerk-webhook', externalUserId: 'user_workflow_fictional' }),
    finalResult: async () => { assert.equal((await response(await clerk.POST(signed()), 200)).duplicate, true) },
    negativeCase: async () => { await response(await clerk.POST(request(event)), 400) },
  }, { service: 'Actual SDK verified a locally signed fictional event. No real browser identity session was established.' })
  let kioskAppointment, challenge, checkinToken
  const lookup = load('src/app/api/kiosk/lookup/route.ts').POST
  const verifyCode = load('src/app/api/kiosk/verify/route.ts').POST
  const checkin = load('src/app/api/kiosk/checkin/route.ts').POST
  await group(['kiosk-request', 'kiosk-save', 'checkin-encounter', 'kiosk-sms'], {
    service: async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      kioskAppointment = await prisma.appointment.create({ data: { name: 'Workflow Fictional Arrival', email: 'workflow-kiosk@example.test', phone: '2025550103', doctorId: 'workflow-kiosk-doctor', date: today, appointmentTime: '09:00', service: 'Fictional', patientId: patient.id } })
      delete testEnv.SMS_PROVIDER_WEBHOOK_URL
      await response(await lookup(request({ method: 'phone', value: kioskAppointment.phone })), 503)
      assert.equal((await prisma.appointment.findUniqueOrThrow({ where: { id: kioskAppointment.id } })).verificationCode, null)
      testEnv.SMS_PROVIDER_WEBHOOK_URL = 'https://synthetic.invalid/sms'
      const previous = global.fetch
      global.fetch = async url => { assert.equal(url, testEnv.SMS_PROVIDER_WEBHOOK_URL); return new Response('{}', { status: 200 }) }
      try { challenge = await response(await lookup(request({ method: 'phone', value: kioskAppointment.phone })), 200) } finally { global.fetch = previous }
      const saved = await prisma.appointment.findUniqueOrThrow({ where: { id: kioskAppointment.id } })
      await response(await verifyCode(request({ token: challenge.token, code: saved.verificationCode === '111111' ? '222222' : '111111' })), 401)
      const verified = await response(await verifyCode(request({ token: challenge.token, code: saved.verificationCode })), 200)
      checkinToken = verified.checkinToken
      assert.ok(checkinToken)
      await response(await checkin(request({ checkinToken })), 200)
    },
    record: async () => { assert.equal((await prisma.appointment.findUniqueOrThrow({ where: { id: kioskAppointment.id } })).checkedIn, true); assert.equal(await prisma.encounter.count({ where: { appointmentId: kioskAppointment.id, patientId: patient.id } }), 1) },
    managementScreen: async () => { const encounter = await prisma.encounter.findUniqueOrThrow({ where: { appointmentId: kioskAppointment.id } }); assert.ok((await screen('src/app/ehr/EncounterQueueScreen.tsx')).includes(encounter.encounterId)) },
    audit: () => auditExists({ resourceId: kioskAppointment.id, action: 'check_in' }),
    finalResult: async () => { assert.equal(await prisma.encounter.count({ where: { appointmentId: kioskAppointment.id } }), 1) },
    negativeCase: async () => { await response(await checkin(request({ checkinToken })), 410); assert.equal(await prisma.encounter.count({ where: { appointmentId: kioskAppointment.id } }), 1); await response(await lookup(request({ method: 'license', value: 'fictional' })), 400) },
  }, { service: 'Actual kiosk lookup/verification/check-in handlers with a strictly local fetch fixture; unconfigured delivery returned 503 and cleared its code.', managementScreen: 'Actual encounter queue consumed its authorized endpoint and rendered the persisted encounter.', negativeCase: 'Consumed check-in grant and unavailable scanner rejected; one encounter remained. No actual SMS or hardware success.' })
  const testCatalog = load('src/app/api/admin/development/architecture-tests/route.ts').GET
  const simulator = load('src/app/api/admin/development/architecture-tests/simulate/route.ts').POST
  const fixtures = load('src/lib/architectureTests/fixtures.ts')
  testEnv.NODE_ENV = 'development'; testEnv.ARCHITECTURE_SIMULATION_ENABLED = 'true'
  await group(['test-center-access', 'test-center-simulation', 'test-center-live', ...['scanner', 'sms', 'voice', 'learning', 'storage', 'measurements'].map(service => 'adapter-' + service)], {
    service: async () => { assert.equal((await response(await testCatalog(), 200)).receipts.length, 6) },
    record: async () => { assert.equal(await prisma.auditLog.count({ where: { module: 'integration_adapter' } }), 6) },
    managementScreen: async () => { const html = await screen('src/components/admin/ArchitectureTestCenter.tsx'); assert.ok(html.includes('Development Simulation')); assert.ok(html.includes('External Adapter')); assert.ok(html.includes('Planned')) },
    audit: () => auditExists({ module: 'architecture_test', source: 'Development Simulation' }),
    finalResult: async () => { assert.equal(await load('src/lib/auditLog.ts').verifyAuditChain(), true) },
    negativeCase: async () => { await response(await simulator(request({ runId: randomUUID(), source: 'Real Device', scenario: 'measurements', input: fixtures.scenarioFixtures.measurements })), 400); testEnv.NODE_ENV = 'production'; try { await response(await simulator(request({})), 404) } finally { testEnv.NODE_ENV = 'development' } },
  }, { record: 'Six authenticated receipt-only events and fictional run metadata persisted; no patient/payment/entitlement mapping was applied.', managementScreen: 'Actual protected center rendered persisted run history and each signed receipt as Planned.', negativeCase: 'Source spoofing and production simulation denied; baseline also verifies per-service signatures, replay/conflict, audit outage and administrator authorization.' })
  testEnv.NODE_ENV = 'test'
  for (const id of ['booking-notify', 'contact-mail', 'payment-platform', 'payment-callback']) {
    const mail = id === 'booking-notify' || id === 'contact-mail'
    await group([id], {
      service: async () => { if (mail) { delete testEnv.SMTP_HOST; try { assert.equal(load('src/lib/contactDelivery.ts').contactSmtpConfig(), null) } finally { testEnv.SMTP_HOST = 'synthetic.invalid' } } else { const previous = testEnv.STRIPE_SECRET_KEY; delete testEnv.STRIPE_SECRET_KEY; try { await response(await load('src/app/api/payment/checkout-session/route.ts').POST(request({ topicId: load('src/lib/healthTopics.ts').healthTopics[0].id }, { 'Idempotency-Key': randomUUID() })), 500) } finally { testEnv.STRIPE_SECRET_KEY = previous } } },
      record: async () => { if (id === 'booking-notify') assert.ok(await prisma.auditWebhookReceipt.count({ where: { id: { startsWith: 'appointment-mail:' } } })); else if (id === 'contact-mail') assert.ok(await prisma.contact.count({ where: { emailDeliveryStatus: 'unknown' } })); else assert.ok(await prisma.healthTopicRegistration.count({ where: { status: 'paid' } })) },
      managementScreen: async () => { assert.ok((await screen(mail ? id === 'booking-notify' ? 'src/app/admin/appointments/page.tsx' : 'src/app/admin/contacts/page.tsx' : 'src/app/admin/registrations/page.tsx')).length > 100) },
      audit: () => auditExists({ source: id === 'booking-notify' ? 'system.appointment-mail' : id === 'contact-mail' ? 'system.contact-mail' : id === 'payment-platform' ? 'public.payment' : 'payment.stripe-webhook' }),
      negativeCase: async () => { if (mail) assert.ok(await prisma.contact.count({ where: { emailDeliveryStatus: 'unknown' } })); else await response(await load('src/app/api/webhooks/stripe/route.ts').POST(request({})), 400) },
    }, { service: 'Unavailable configuration was tested safely. Baseline uses provider fixtures only.', record: 'Existing isolated delivery/registration records were preserved; this is not provider acceptance evidence.', negativeCase: 'Missing credentials, unknown delivery or invalid signature do not create a real provider success.' })
  }
  const authFixture = { signedIn: true, metadataRole: 'admin' }
  const authModule = { exports: {} }
  const authCode = require('typescript').transpileModule(fs.readFileSync('src/lib/ehrAuthorization.ts', 'utf8'), { compilerOptions: { module: require('typescript').ModuleKind.CommonJS } }).outputText
  const adminUser = await prisma.user.findUniqueOrThrow({ where: { id: actor.userId } })
  new Function('require', 'module', 'exports', authCode)(name => {
    if (name === '@/lib/prisma') return { prisma }
    if (name === '@/lib/auditLog') return load('src/lib/auditLog.ts')
    if (name === '@clerk/nextjs/server') return { auth: async () => ({ userId: authFixture.signedIn ? 'user_role_fixture' : null, sessionId: 'sess_role_fixture' }), clerkClient: async () => ({ users: { getUser: async () => ({ id: 'user_role_fixture', primaryEmailAddress: { emailAddress: adminUser.email }, publicMetadata: { role: authFixture.metadataRole } }) } }) }
    return require(name)
  }, authModule, authModule.exports)
  await group(['identity-role', 'guard-storage', 'admin-guard'], {
    service: async () => { assert.equal((await authModule.exports.authorizeEhrRequest(['admin'])).role, 'admin') },
    record: async () => { assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: actor.userId } })).role, 'admin') },
    managementScreen: async () => { setActor(null); try { await response(await testCatalog(), 403) } finally { setActor(actor) }; assert.equal((await response(await testCatalog(), 200)).historyStatus, 'Passed') },
    audit: async () => { authFixture.signedIn = false; try { assert.equal(await authModule.exports.authorizeEhrRequest(['admin']), null) } finally { authFixture.signedIn = true }; await auditExists({ source: 'auth.authorization', action: 'access_denied' }) },
    finalResult: async () => { assert.equal((await authModule.exports.authorizeEhrRequest(['admin'])).userId, actor.userId) },
    negativeCase: async () => { authFixture.metadataRole = 'student'; try { assert.equal(await authModule.exports.authorizeEhrRequest(['admin']), null) } finally { authFixture.metadataRole = 'admin' } },
  }, { service: 'Actual authorization function used isolated local role records and explicit fictional Clerk responses.', managementScreen: 'Protected catalog denied anonymous access and returned persisted history only to the fictional administrator. Full browser session is not tested.', negativeCase: 'Lower external metadata role overrode a local administrator role and was denied with a real isolated audit event.' })
  for (const [id, eventSource] of Object.entries({ 'patient-audit': 'ehr.patient-intake', 'kiosk-audit': 'kiosk.checkin', 'contact-audit': 'public.contact', 'checkout-audit': 'public.payment', 'business-audit': 'public.booking', 'webhook-audit': 'payment.stripe-webhook', 'audit-storage': 'admin.audit-logs', 'audit-view': 'admin.audit-logs' })) {
    let event
    await group([id], {
      service: async () => { assert.ok((await response(await audits.GET(get('/api/admin/audit-logs?source=' + eventSource)), 200)).events.length) },
      record: async () => { event = await prisma.auditLog.findFirstOrThrow({ where: { source: eventSource }, orderBy: { createdAt: 'desc' } }); assert.ok(event.entryHash) },
      managementScreen: async () => { const html = await renderScreen('src/app/admin/audit-logs/AuditLogViewer.tsx', 'default', {}, () => audits.GET(get('/api/admin/audit-logs?source=' + eventSource))); assert.ok(html.includes(event.id)) },
      audit: () => auditExists({ source: eventSource, id: event.id }),
      finalResult: async () => { assert.equal((await response(await verify.GET(), 200)).valid, true) },
      negativeCase: async () => { setActor(null); try { await response(await audits.GET(get('/test')), 403) } finally { setActor(actor) } },
    }, { managementScreen: 'Actual audit viewer rendered the specific emitting service event from its real filtered receiving endpoint.', record: 'The exact service source and its persisted hash-chained audit row were verified. No raw event or record was copied into this report.', negativeCase: 'Anonymous access to the receiving audit screen endpoint was denied.' })
  }
  await group(['clinical-read'], {
    service: async () => { assert.equal((await response(await load('src/app/api/ehr/patients/[id]/route.ts').GET(get('/test'), context(patient.id)), 200)).patient.id, patient.id) },
    record: async () => { assert.ok(await prisma.patient.findUnique({ where: { id: patient.id } })) },
    managementScreen: async () => { assert.ok((await screen('src/app/ehr/EhrScreens.tsx', { id: patient.id }, 'PatientRecordRoute')).includes(patient.patientId)) },
    audit: () => auditExists({ patientId: patient.id, action: 'read' }),
    finalResult: async () => { assert.equal(await load('src/lib/auditLog.ts').verifyAuditChain(), true) },
    negativeCase: async () => { setActor(null); try { await response(await load('src/app/api/ehr/patients/[id]/route.ts').GET(get('/test'), context(patient.id)), 403) } finally { setActor(actor) } },
  }, { managementScreen: 'Actual patient record route consumed the authorized detail response and rendered the persisted patient reference.' })
  for (const [id, scenario] of [['clinical-ai', 'voice-intake'], ['portal-entitlements', 'course-completion'], ['account-management', 'identity-event']]) {
    await group([id], {
      service: async () => { assert.notEqual(load('src/lib/architectureTests/runner.ts').runSimulation(scenario, randomUUID()).status, 'Passed') },
      negativeCase: async () => { assert.ok(load('src/lib/architectureTests/runner.ts').runSimulation(scenario, randomUUID()).steps.some(s => s.status === 'Planned')) },
    }, { service: 'Executed fixed contract/boundary scenario only; actual unsupported business action was not performed.', negativeCase: 'Unavailable business mapping remained Planned rather than being promoted by format success.' })
  }
  // External/unimplemented boundaries are exercised safely, then remain partial
  // or planned. Passing a format/rejection case cannot promote these to Connected.
  const limited = new Set(['identity-session', 'identity-role', 'guard-storage', 'admin-guard', 'booking-notify', 'kiosk-sms', 'payment-platform', 'payment-callback', 'contact-mail', 'ubuntu-application', 'ubuntu-database', 'database-migration'])
  for (const definition of definitions) {
    let result = results.get(definition.id)
    if (!result) result = { id: definition.id, at: null, source: 'Not Tested', scope: 'No complete executable witness has been recorded for this connection.', stages: Object.fromEntries(['service', 'record', 'managementScreen', 'audit', 'finalResult', 'negativeCase'].map(key => [key, { status: definition.status === 'planned' ? 'Planned' : 'Not Tested', detail: definition.missingRequirement }])), cases: [] }
    if (limited.has(definition.id) && result.stages.finalResult.status !== 'Failed') result.stages.finalResult = { status: 'Not Tested', detail: 'Real provider/session/deployment or actual authorization boundary requires independent evidence; fixtures and read-only probes are insufficient.' }
    const values = Object.values(result.stages)
    result.status = values.some(s => s.status === 'Failed') ? 'failed' : values.every(s => s.status === 'Passed' || s.status === 'Not Applicable') ? 'connected' : definition.status === 'planned' ? 'planned' : 'partly_connected'
    result.remainingRequirement = result.status === 'connected' ? 'Verified scope is isolated application software and receiving component rendering. Production enablement, browser click-through and real external results are separate requirements.' : Object.entries(result.stages).filter(([, value]) => !['Passed', 'Not Applicable'].includes(value.status)).map(([key, value]) => key + ': ' + value.detail).join(' ') + ' ' + definition.missingRequirement
    result.safeError = result.status === 'failed' ? 'A safe isolated workflow assertion failed; review the named test stage before using this connection.' : 'If the result cannot be confirmed, reload the saved record and retry with the same submission identifier. Do not infer external success.'
    results.set(definition.id, result)
  }
  const report = { version: 1, at: new Date().toISOString(), sourceDigest: digest(root), command: 'isolated PostgreSQL: node scripts/test-software-connections.cjs', connections: [...results.values()] }
  fs.writeFileSync(path.join(root, 'src/data/workflowConnectionVerification.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ workflowVerification: report.connections.map(c => ({ id: c.id, status: c.status })) }))
  assert.ok(!report.connections.some(c => c.status === 'failed'), 'One or more independently recorded workflow assertions failed; inspect safe stage metadata.')
}
