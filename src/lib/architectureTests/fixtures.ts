const uuid = (index: number) => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`
const occurredAt = '2030-01-07T09:00:00.000Z'
const event = <T extends object>(index: number, kind: string, data: T) => ({ version: 1, eventId: uuid(index), occurredAt, kind, data })
const scanner = event(1, 'scanner.read', { deviceId: 'dev_sim_scanner', scanType: 'membership_token', token: uuid(2) })
const sms = { to: '2025550101', code: '000000' }
const appointment = { id: 'syn-appointment-001', patientId: 'syn-patient-001', date: '2030-01-07T00:00:00.000Z', service: 'Fictional consultation', message: 'Fictional development record' }

export const scenarioFixtures = {
  'kiosk-arrival': { scanner, sms, acceptance: { messageId: 'sim_message_001', status: 'accepted' }, appointment },
  'sms-failure': { scanner, sms, acceptance: { messageId: 'sim_message_002', status: 'rejected' }, appointment },
  'contact-delivery': { envelope: { from: 'clinic@example.test', to: ['recipient@example.test', 'rejected@example.test'], subject: 'Fictional contact notification', text: 'Fictional fixture only' }, result: { accepted: ['recipient@example.test'], rejected: ['rejected@example.test'] } },
  'payment-registration': { registration: { topicId: 'sim_topic_001', currency: 'twd', amountTwd: 100 }, event: { id: 'evt_sim_001', type: 'checkout.session.completed', data: { object: { id: 'cs_test_sim_001', mode: 'payment', currency: 'twd', amount_total: 10000, payment_status: 'paid', metadata: { topicId: 'sim_topic_001' } } } } },
  'identity-event': { type: 'session.created', data: { id: 'sess_sim_001', user_id: 'user_sim_001' } },
  'voice-intake': { audio: { contentType: 'audio/webm', bytes: 1024, durationSeconds: 5, sampleRateHz: 16000, sha256: '0'.repeat(64) }, result: event(3, 'voice.result', { interviewId: uuid(4), consentReference: uuid(5), mode: 'audio', transcript: 'Fictional patient-reported words. No clinical conclusion.', reviewRequired: true }) },
  'course-completion': event(6, 'course.completed', { registrationId: 'cm000000000000000000000001', subjectReference: uuid(7), courseId: 'sim_course_001', completedAt: occurredAt, creditUnits: 1 }),
  'document-storage': event(8, 'document.stored', { documentReference: uuid(9), objectReference: uuid(10), sha256: '0'.repeat(64), contentType: 'application/pdf', bytes: 1024 }),
  measurements: [
    event(11, 'measurement.recorded', { deviceId: 'dev_sim_bp', subjectReference: uuid(7), reading: { metric: 'blood_pressure', systolic: 123, diastolic: 78, unit: 'mmHg' } }),
    event(12, 'measurement.recorded', { deviceId: 'dev_sim_glucose', subjectReference: uuid(7), reading: { metric: 'blood_glucose', value: 101, unit: 'mg/dL' } }),
    event(13, 'measurement.recorded', { deviceId: 'dev_sim_scale', subjectReference: uuid(7), reading: { metric: 'weight', value: 65, unit: 'kg' } }),
    event(14, 'measurement.recorded', { deviceId: 'dev_sim_sleep', subjectReference: uuid(7), reading: { metric: 'sleep', durationMinutes: 420 } }),
  ],
}
export const scenarioIds = ['kiosk-arrival', 'sms-failure', 'contact-delivery', 'payment-registration', 'identity-event', 'voice-intake', 'course-completion', 'document-storage', 'measurements'] as const
export type ScenarioId = typeof scenarioIds[number]
