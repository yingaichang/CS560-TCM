// Pure application policies: shared by real adapters and the isolated simulator.
export function classifyMailAcceptance(result: { accepted?: unknown[]; rejected?: unknown[] }): 'sent' | 'failed' | 'unknown' {
  return result.accepted?.length ? result.rejected?.length ? 'unknown' : 'sent' : 'failed'
}

export function matchesRegistrationPayment(registration: { currency: string; amountTwd: number }, session: { mode?: string | null; currency?: string | null; amount_total?: number | null }, knownTopic: boolean) {
  return knownTopic && session.mode === 'payment' && session.currency === registration.currency && session.amount_total === registration.amountTwd * 100
}

export function planCheckedInEncounter(appointment: { id: string; patientId: string | null; date: Date; service: string; message: string | null }, encounterId: string) {
  if (!appointment.patientId) return null
  return { encounterId, appointmentId: appointment.id, patientId: appointment.patientId, encounterDate: appointment.date, visitType: appointment.service, chiefComplaint: appointment.message, status: 'checked_in' }
}
