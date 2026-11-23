const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { randomUUID } = require('node:crypto')
const ts = require('typescript')
const { PrismaClient } = require('@prisma/client')
const { NextRequest } = require('next/server')
const Stripe = require('stripe')

// This suite refuses application databases and never loads an environment file.
const url = new URL(process.env.DATABASE_URL || 'http://invalid')
assert.equal(process.env.TCM_CONNECTION_TEST, '1')
assert.equal(url.hostname, 'synthetic-db')
assert.equal(url.pathname, '/synthetic_connections')
const prisma = new PrismaClient({ datasourceUrl: url.href })
const root = path.resolve(__dirname, '..')
let actor, mailMode = 'accepted', mailCalls = 0, stage = 'initialization'
const cache = new Map()
const testEnv = { NODE_ENV: 'test', SMTP_HOST: 'synthetic.invalid', SMTP_USER: 'synthetic', SMTP_PASS: 'fictional', STRIPE_SECRET_KEY: 'fictional', STRIPE_WEBHOOK_SECRET: 'whsec_synthetic_fixture', NEXT_PUBLIC_APP_URL: 'https://cse03.tcmusa.ai' }
const stripe = new Stripe('fictional')
const checkoutRequests = []
class FixtureStripe {
  constructor() {
    this.webhooks = stripe.webhooks
    this.checkout = { sessions: { create: async (params, options) => {
      checkoutRequests.push({ params, options })
      return { id: 'cs_test_syntheticCheckout', url: 'https://checkout.stripe.com/synthetic-fixture' }
    } } }
  }
}
function load(relative) {
  if (cache.has(relative)) return cache.get(relative).exports
  const module = { exports: {} }; cache.set(relative, module)
  const code = ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText
  const customRequire = name => {
    if (name === '@/lib/prisma') return { prisma }
    if (name === '@/lib/ehrAuthorization') return { authorizeEhrRequest: async roles => actor && (!roles || roles.includes(actor.role)) ? actor : null }
    if (name === 'nodemailer') return { createTransport: () => ({ close() {}, sendMail: async () => { mailCalls++; if (mailMode === 'timeout') throw Object.assign(new Error('synthetic'), { code: 'ETIMEDOUT' }); if (mailMode === 'denied') throw Object.assign(new Error('synthetic'), { code: 'EAUTH' }); return { accepted: ['synthetic@example.test'], rejected: mailMode === 'partial' ? ['rejected@example.test'] : [] } } }) }
    if (name === 'stripe') return FixtureStripe
    if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts')
    return require(name)
  }
  new Function('require', 'module', 'exports', 'process', 'console', code)(customRequire, module, module.exports, { env: testEnv }, { log() {}, error() {}, warn() {} })
  return module.exports
}
const context = id => ({ params: Promise.resolve({ id }) })
function request(body, key = randomUUID(), headers = {}) { return new NextRequest('http://synthetic.invalid/test', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key, ...headers }, body: JSON.stringify(body) }) }
async function expect(response, status) { assert.equal(response.status, status, stage); return response.json() }

async function main() {
  const admin = await prisma.user.create({ data: { email: 'admin@example.test', name: 'Fictional Admin', role: 'admin' } })
  const provider = await prisma.user.create({ data: { email: 'provider@example.test', name: 'Fictional Provider', role: 'provider' } })
  const other = await prisma.user.create({ data: { email: 'other@example.test', role: 'provider' } })
  const actorFor = user => ({ userId: user.id, externalUserId: 'synthetic-external-' + user.id, role: user.role, sessionId: 'synthetic-session' })
  actor = actorFor(admin)
  const patients = load('src/app/api/ehr/patients/route.ts')
  stage = 'patient create and replay'
  const key = randomUUID(), body = { firstName: 'Fictional', lastName: 'Connection', email: 'patient@example.test' }
  const first = await expect(await patients.POST(request(body, key)), 201)
  const replay = await expect(await patients.POST(request(body, key)), 200)
  assert.equal(first.patient.id, replay.patient.id)
  await expect(await patients.POST(request({ ...body, firstName: 'Conflict' }, key)), 409)
  assert.equal(await prisma.patient.count(), 1)
  const patient = first.patient
  stage = 'patient profile update and stale edit protection'
  const patientDetails = load('src/app/api/ehr/patients/[id]/route.ts')
  const beforeProfile = await expect(await patientDetails.GET(new NextRequest('http://synthetic.invalid/test'), context(patient.id)), 200)
  const profileUpdate = { expectedUpdatedAt: beforeProfile.patient.updatedAt, firstName: 'Fictional', lastName: 'Connection', dateOfBirth: '1990-01-01', gender: 'fictional', phone: '5550100200', email: 'patient@example.test', address: '123 Fictional Lane', city: 'Fictional', state: 'CA', postalCode: '00000', country: 'Fictional', emergencyContact: 'Fictional Contact', emergencyRelationship: 'Fictional', emergencyContactPhone: '5550100201', emergencyContactEmail: 'emergency@example.test' }
  await expect(await patientDetails.PUT(request(profileUpdate), context(patient.id)), 200)
  await expect(await patientDetails.PUT(request(profileUpdate), context(patient.id)), 409)
  const appointment = await prisma.appointment.create({ data: { name: 'Fictional Appointment', email: 'booking@example.test', phone: '5550100101', patientId: patient.id, doctorId: 'fictional-doctor', date: new Date(), appointmentTime: '09:00', service: 'fictional' } })
  const encounter = await prisma.encounter.create({ data: { encounterId: 'SYN-ENCOUNTER', appointmentId: appointment.id, patientId: patient.id, encounterDate: new Date(), visitType: 'fictional', status: 'checked_in' } })
  stage = 'explicit provider assignment grants access atomically'
  const queue = load('src/app/api/ehr/encounters/[id]/route.ts')
  await expect(await queue.PATCH(request({ providerId: provider.id, expectedUpdatedAt: encounter.updatedAt.toISOString() }), context(encounter.id)), 200)
  assert.ok(await prisma.providerPatientAccess.findFirst({ where: { providerId: provider.id, patientId: patient.id, revokedAt: null } }))
  await expect(await queue.PATCH(request({ status: 'completed' }), context(encounter.id)), 409)
  const intake = load('src/app/api/ehr/intakes/route.ts')
  actor = actorFor(provider)
  stage = 'intake saves once; duplicate selections do not fail'
  const intakeKey = randomUUID(), intakeBody = { patientId: patient.id, majorComplaints: 'Fictional symptoms', locations: ['front', 'front'], medicalConditions: ['Asthma'] }
  await expect(await intake.POST(request(intakeBody, intakeKey)), 201)
  await expect(await intake.POST(request(intakeBody, intakeKey)), 200)
  assert.equal(await prisma.patientIntake.count(), 1)
  assert.equal(await prisma.medicalHistory.count(), 1)
  stage = 'draft, stale conflict, and signing'
  const notes = load('src/app/api/ehr/encounters/[id]/notes/route.ts')
  const draft = await expect(await notes.POST(request({ inquirySymptoms: 'Fictional symptoms', expectedUpdatedAt: null }), context(encounter.id)), 200)
  await expect(await notes.POST(request({ inquirySymptoms: 'Stale', expectedUpdatedAt: null }), context(encounter.id)), 409)
  const workflow = load('src/app/api/ehr/workflow/route.ts')
  const signBody = { action: 'sign_note', encounterId: encounter.id, expectedUpdatedAt: draft.note.updatedAt }, signKey = randomUUID()
  await expect(await workflow.POST(request(signBody, signKey)), 200)
  assert.equal((await expect(await workflow.POST(request(signBody, signKey)), 200)).duplicate, true)
  await expect(await notes.POST(request({ inquirySymptoms: 'Mutate signed note', expectedUpdatedAt: draft.note.updatedAt }), context(encounter.id)), 409)
  stage = 'treatment produces one linked billing draft, no charges'
  const code = await prisma.cptCode.create({ data: { code: 'SYN001', serviceName: 'Fictional service', serviceType: 'fictional' } })
  const treatmentKey = randomUUID(), treatmentBody = { action: 'record_treatment', encounterId: encounter.id, cptCodeId: code.id, units: 2 }
  const parallel = await Promise.all([workflow.POST(request(treatmentBody, treatmentKey)), workflow.POST(request(treatmentBody, treatmentKey))])
  for (const response of parallel) await expect(response, 200)
  assert.equal(await prisma.treatment.count(), 1); assert.equal(await prisma.billingRecord.count(), 1)
  const bill = await prisma.billingRecord.findFirstOrThrow()
  assert.equal(bill.patientId, patient.id); assert.equal(bill.encounterId, encounter.id); assert.ok(bill.treatmentId)
  await expect(await workflow.POST(request({ action: 'review_billing', billingId: bill.id, expectedUpdatedAt: bill.updatedAt.toISOString() })), 403)
  actor = actorFor(admin)
  await expect(await workflow.POST(request({ action: 'review_billing', billingId: bill.id, expectedUpdatedAt: bill.updatedAt.toISOString() })), 200)
  stage = 'signed encounter completion updates the correct appointment'
  await expect(await queue.PATCH(request({ status: 'completed' }), context(encounter.id)), 200)
  assert.equal((await prisma.appointment.findUniqueOrThrow({ where: { id: appointment.id } })).status, 'completed')
  actor = actorFor(provider)
  stage = 'medication duplicate protection and stop'
  const medicine = await prisma.medication.create({ data: { name: 'Fictional medicine', category: 'synthetic' } })
  const medicationBody = { action: 'record_medication', patientId: patient.id, medicationId: medicine.id, dosage: 'fictional dose', frequency: '', route: '' }
  await expect(await workflow.POST(request(medicationBody)), 200)
  await expect(await workflow.POST(request(medicationBody)), 409)
  const medication = await prisma.patientMedication.findFirstOrThrow()
  await expect(await workflow.POST(request({ action: 'stop_medication', medicationRecordId: medication.id, expectedUpdatedAt: medication.updatedAt.toISOString() })), 200)
  assert.equal((await prisma.patientMedication.findUniqueOrThrow({ where: { id: medication.id } })).active, false)
  stage = 'receiving management screens use persisted data'
  const received = await expect(await workflow.GET(), 200)
  assert.equal(received.treatments.length, 1); assert.equal(received.billingRecords[0].status, 'reviewed'); assert.equal(received.medications.length, 1)
  actor = { ...actorFor(other), role: 'billing_staff' }
  const limited = await expect(await workflow.GET(), 200)
  assert.equal(limited.treatments.length, 0); assert.equal(limited.patients.length, 0); assert.equal(limited.medications.length, 0)
  actor = actorFor(other)
  assert.equal((await expect(await workflow.GET(), 200)).treatments.length, 0)
  await expect(await workflow.POST(request({ ...treatmentBody, units: 3 })), 404)
  stage = 'revoked provider access blocks queued clinical actions'
  await prisma.providerPatientAccess.updateMany({ where: { providerId: provider.id }, data: { revokedAt: new Date() } })
  actor = actorFor(provider)
  await expect(await workflow.POST(request({ ...treatmentBody, units: 4 })), 404)
  assert.equal((await expect(await load('src/app/api/ehr/encounters/route.ts').GET(), 200)).encounters.length, 0)
  stage = 'production clinical writes remain disabled'
  testEnv.NODE_ENV = 'production'
  await expect(await workflow.POST(request(treatmentBody)), 403)
  await expect(await patients.POST(request(body)), 403)
  testEnv.NODE_ENV = 'test'
  stage = 'transaction rollback also rolls back audit and idempotency receipt'
  const count = await prisma.auditLog.count(), receiptCount = await prisma.auditWebhookReceipt.count()
  const commands = load('src/lib/softwareCommands.ts')
  await assert.rejects(commands.runSoftwareCommand('synthetic-rollback', randomUUID(), {}, async tx => {
    await tx.patient.create({ data: { patientId: 'SYN-ROLLBACK', firstName: 'Rollback', lastName: 'Fictional' } })
    await load('src/lib/auditLog.ts').writeAuditLog({ action: 'create', resource: 'patient', actorRole: 'system', source: 'test.synthetic' }, tx)
    throw new Error('synthetic rollback')
  }))
  assert.equal(await prisma.auditLog.count(), count); assert.equal(await prisma.auditWebhookReceipt.count(), receiptCount)
  assert.equal(await prisma.patient.count({ where: { patientId: 'SYN-ROLLBACK' } }), 0)
  stage = 'SMTP fixture rejection, safe retry, ambiguous result'
  actor = actorFor(admin)
  const contact = await prisma.contact.create({ data: { name: 'Fictional', email: 'contact@example.test', subject: 'Synthetic', message: 'Synthetic fixture only', emailDeliveryStatus: 'failed' } })
  const retry = load('src/app/api/admin/contacts/[id]/retry/route.ts')
  mailMode = 'denied'
  assert.equal((await expect(await retry.POST(request({ expectedAttempts: 0, acknowledgePossibleDuplicate: true }), context(contact.id)), 200)).emailDeliveryStatus, 'failed')
  await expect(await retry.POST(request({ expectedAttempts: 0, acknowledgePossibleDuplicate: true }), context(contact.id)), 409)
  mailMode = 'timeout'
  assert.equal((await expect(await retry.POST(request({ expectedAttempts: 1, acknowledgePossibleDuplicate: true }), context(contact.id)), 200)).emailDeliveryStatus, 'unknown')
  await expect(await retry.POST(request({ expectedAttempts: 2, acknowledgePossibleDuplicate: true }), context(contact.id)), 409)
  assert.equal(mailCalls, 2)
  stage = 'saved contact reaches inbox once with fixture SMTP acceptance'
  mailMode = 'accepted'
  const contacts = load('src/app/api/contact/route.ts'), contactKey = randomUUID()
  await expect(await contacts.POST(request({ name: 123 })), 400)
  const contactBody = { name: 'Fictional Contact', email: 'inbox@example.test', subject: 'Fictional message', message: 'Synthetic fixture' }
  assert.equal((await expect(await contacts.POST(request(contactBody, contactKey)), 201)).emailDeliveryStatus, 'sent')
  await expect(await contacts.POST(request(contactBody, contactKey)), 200)
  assert.equal(mailCalls, 3)
  assert.equal((await expect(await contacts.GET(), 200)).length, 2)
  mailMode = 'partial'
  const partialContact = await expect(await contacts.POST(request({ ...contactBody, subject: 'Partial recipient fixture' })), 201)
  assert.equal(partialContact.emailDeliveryStatus, 'unknown')
  mailMode = 'accepted'
  stage = 'appointment notification tracking, duplicate suppression, retries and stale version'
  const appointmentMail = load('src/lib/appointmentMail.ts')
  let latestAppointment = await prisma.appointment.findUniqueOrThrow({ where: { id: appointment.id } })
  delete testEnv.SMTP_HOST
  assert.equal((await appointmentMail.sendAppointmentNotification(latestAppointment, 'patient')).state, 'not_configured')
  testEnv.SMTP_HOST = 'synthetic.invalid'
  const beforeMail = mailCalls
  const attempts = await Promise.all([appointmentMail.sendAppointmentNotification(latestAppointment, 'patient', 0), appointmentMail.sendAppointmentNotification(latestAppointment, 'patient', 0).catch(error => error)])
  assert.ok(attempts.some(x => x.state === 'sent'))
  assert.equal(mailCalls, beforeMail + 1)
  await appointmentMail.notifyAppointmentStatus(latestAppointment)
  assert.equal(mailCalls, beforeMail + 1)
  const appointmentList = await expect(await load('src/app/api/appointments/route.ts').GET(new NextRequest('http://synthetic.invalid/api/appointments?status=all')), 200)
  assert.equal(appointmentList[0].notifications.patient.state, 'sent')
  await prisma.appointment.update({ where: { id: appointment.id }, data: { status: 'confirmed' } })
  await assert.rejects(appointmentMail.sendAppointmentNotification(latestAppointment, 'admin'))
  stage = 'unimplemented AI send and false completion are rejected'
  const appointmentActions = load('src/app/api/appointments/[id]/route.ts')
  await expect(await appointmentActions.PATCH(request({ status: 'ai_sent' }), context(appointment.id)), 400)
  stage = 'public booking rejects closed dates, invalid fields, and concurrent slot conflicts'
  const booking = load('src/app/api/appointments/route.ts')
  const bookingBody = { firstName: 'Fictional', lastName: 'Booking', email: 'booking@example.test', phone: '5550100123', service: '針灸', doctor: '李明智醫師', date: '2030-01-07', time: '09:00' }
  await expect(await booking.POST(request({ ...bookingBody, firstName: 123 })), 400)
  await expect(await booking.POST(request({ ...bookingBody, date: '2030-02-30' })), 400)
  await prisma.holiday.create({ data: { name: 'Fictional Closure', holidayDate: new Date('2030-01-07T00:00:00'), isClosed: true } })
  await expect(await booking.POST(request(bookingBody)), 400)
  const bookingResults = await Promise.all([booking.POST(request({ ...bookingBody, date: '2030-01-08' })), booking.POST(request({ ...bookingBody, date: '2030-01-08' }))])
  assert.deepEqual(bookingResults.map(x => x.status).sort(), [201, 409])
  stage = 'appointment editor saves changes, rejects stale edits and preserves patient links'
  const savedBooking = await bookingResults.find(x => x.status === 201).json()
  await expect(await appointmentActions.PATCH(request({ expectedUpdatedAt: savedBooking.updatedAt, message: 'Fictional edited note' }), context(savedBooking.id)), 200)
  await expect(await appointmentActions.PATCH(request({ expectedUpdatedAt: savedBooking.updatedAt, message: 'Stale overwrite' }), context(savedBooking.id)), 409)
  await expect(await appointmentActions.PATCH(request({ patientId: null }), context(appointment.id)), 409)
  stage = 'Stripe fixture checkout amount and idempotency'
  const topic = load('src/lib/healthTopics.ts').healthTopics[0]
  const checkout = load('src/app/api/payment/checkout-session/route.ts'), checkoutKey = randomUUID()
  await expect(await checkout.POST(request({ topicId: topic.id }, checkoutKey)), 200)
  await expect(await checkout.POST(request({ topicId: topic.id }, checkoutKey)), 200)
  assert.equal(checkoutRequests[0].params.line_items[0].price_data.unit_amount, topic.feeTwd * 100)
  assert.equal(checkoutRequests[0].options.idempotencyKey, checkoutRequests[1].options.idempotencyKey)
  assert.equal(await prisma.auditLog.count({ where: { action: 'checkout_session_created' } }), 1)
  stage = 'locally signed Stripe fixtures reject bad signature, mismatches, duplicates and late failure'
  const webhook = load('src/app/api/webhooks/stripe/route.ts')
  async function event(id, type, modifications = {}) {
    const eventBody = { id, type, data: { object: { id: 'cs_test_syntheticCheckout', mode: 'payment', currency: 'twd', amount_total: topic.feeTwd * 100, payment_status: 'paid', metadata: { topicId: topic.id }, ...modifications } } }
    const payload = JSON.stringify(eventBody), signature = stripe.webhooks.generateTestHeaderString({ payload, secret: testEnv.STRIPE_WEBHOOK_SECRET })
    return webhook.POST(request(eventBody, randomUUID(), { 'stripe-signature': signature }))
  }
  await expect(await webhook.POST(request({})), 400)
  await expect(await event('evt_syntheticMismatch', 'checkout.session.completed', { amount_total: 1 }), 200)
  assert.equal((await prisma.healthTopicRegistration.findUniqueOrThrow({ where: { checkoutSessionId: 'cs_test_syntheticCheckout' } })).status, 'requires_review')
  await expect(await event('evt_syntheticPaid', 'checkout.session.async_payment_succeeded'), 200)
  assert.equal((await expect(await event('evt_syntheticPaid', 'checkout.session.async_payment_succeeded'), 200)).duplicate, true)
  await expect(await event('evt_syntheticLateFailure', 'checkout.session.async_payment_failed'), 200)
  assert.equal((await prisma.healthTopicRegistration.findUniqueOrThrow({ where: { checkoutSessionId: 'cs_test_syntheticCheckout' } })).status, 'paid')
  await expect(await event('evt_syntheticUnmatched', 'checkout.session.completed', { id: 'cs_test_notStored' }), 503)
  assert.equal(await prisma.auditWebhookReceipt.count({ where: { id: 'stripe:evt_syntheticUnmatched' } }), 0)
  const registered = await expect(await load('src/app/api/admin/registrations/route.ts').GET(), 200)
  assert.equal(registered.registrations[0].status, 'paid')
  stage = 'audit chain integrity'
  assert.equal(await load('src/lib/auditLog.ts').verifyAuditChain(), true)
  console.log(JSON.stringify({ result: 'passed', at: new Date().toISOString(), command: 'isolated PostgreSQL: node scripts/test-software-connections.cjs', scope: 'Isolated PostgreSQL with fictional records; real handlers, transactions, access filters, replay/conflict protection, management reads and audit integrity. SMTP and Stripe are local fixtures, not external service success. Production clinical writes remain disabled.', components: ['patientApi', 'clinicalWrite', 'contactApi'], connections: ['patient-entry', 'patient-save', 'clinical-read', 'clinical-write', 'clinical-persist', 'registration-persist', 'payment-registration', 'contact-storage', 'contact-mail', 'booking-notify', 'booking-save', 'checkout-audit', 'business-audit', 'audit-storage'] }))
}
main().catch(error => { console.error('FAILED stage: ' + stage); console.error(error.message); process.exitCode = 1 }).finally(() => prisma.$disconnect())
