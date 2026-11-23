import { randomUUID } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { writeAuditLog } from '@/lib/auditLog'
import { planCheckedInEncounter } from '@/lib/integrations/workflowPolicies'

type CheckedInAppointment = {
  id: string
  patientId: string | null
  date: Date
  service: string
  message: string | null
}

export async function ensureEncounterForCheckedInAppointment(
  transaction: Prisma.TransactionClient,
  appointment: CheckedInAppointment,
) {
  if (!appointment.patientId) return null

  const existing = await transaction.encounter.findUnique({
    where: { appointmentId: appointment.id },
    select: { id: true, encounterId: true },
  })
  if (existing) return existing

  const data = planCheckedInEncounter(appointment, `ENC-${randomUUID()}`)
  if (!data) return null
  const encounter = await transaction.encounter.create({
    data,
    select: { id: true, encounterId: true },
  })

  await writeAuditLog({
    patientId: appointment.patientId,
    action: 'create',
    resource: 'encounter',
    resourceId: encounter.id,
    actorRole: 'kiosk',
    source: 'kiosk.checkin',
    module: 'ehr',
    summary: 'Encounter created from verified check-in',
  }, transaction)

  return encounter
}
