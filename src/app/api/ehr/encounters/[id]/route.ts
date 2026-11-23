import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'
import { lockSoftwareWrites } from '@/lib/softwareCommands'

const updateInput = z.object({
  providerId: z.string().cuid().nullable().optional(),
  status: z.enum(['checked_in', 'scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  expectedUpdatedAt: z.iso.datetime().optional(),
}).strict().refine((value) => value.providerId !== undefined || value.status !== undefined)

type EncounterRouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: EncounterRouteContext) {
  const actor = await authorizeEhrRequest(['admin', 'clinic_staff'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const parsed = updateInput.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid encounter update' }, { status: 400 })

  try {
    const { id } = await params
    const result = await prisma.$transaction(async (transaction) => {
      await lockSoftwareWrites(transaction)
      const current = await transaction.encounter.findUnique({
        where: { id },
        select: { id: true, patientId: true, providerId: true, status: true, updatedAt: true, clinicalNote: { select: { status: true } } },
      })
      if (!current) return { error: 'Encounter not found.', status: 404 as const }
      if (parsed.data.expectedUpdatedAt && current.updatedAt.toISOString() !== parsed.data.expectedUpdatedAt) return { error: 'Encounter changed. Reload before updating.', status: 409 as const }
      if (parsed.data.providerId !== undefined && parsed.data.providerId !== current.providerId && current.clinicalNote) return { error: 'Provider cannot be reassigned after clinical documentation exists.', status: 409 as const }
      if (parsed.data.status === 'completed' && current.clinicalNote?.status !== 'signed') return { error: 'A signed note is required before completion.', status: 409 as const }
      if (['completed', 'cancelled'].includes(current.status) && parsed.data.status && parsed.data.status !== current.status) return { error: 'Closed encounters cannot be reopened here.', status: 409 as const }

      if (parsed.data.providerId) {
        const provider = await transaction.user.findFirst({
          where: { id: parsed.data.providerId, role: 'provider' },
          select: { id: true },
        })
        if (!provider) return { error: 'The selected provider is not available.', status: 400 as const }
        const access = await transaction.providerPatientAccess.findUnique({ where: { providerId_patientId: { providerId: provider.id, patientId: current.patientId } } })
        if (!access || access.revokedAt) {
          await transaction.providerPatientAccess.upsert({ where: { providerId_patientId: { providerId: provider.id, patientId: current.patientId } }, create: { providerId: provider.id, patientId: current.patientId }, update: { revokedAt: null, grantedAt: new Date() } })
          await writeAuditLog({ ...actor, actorRole: actor.role, patientId: current.patientId, action: 'grant_patient_access', resource: 'provider_patient_access', resourceId: provider.id, source: 'admin.ehr-encounters', module: 'auth', summary: 'Patient access granted by explicit encounter assignment' }, transaction)
        }
      }

      const updated = await transaction.encounter.update({
        where: { id },
        data: {
          ...(parsed.data.providerId !== undefined ? { providerId: parsed.data.providerId } : {}),
          ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
        },
        include: {
          patient: { select: { id: true, patientId: true, firstName: true, lastName: true } },
          provider: { select: { id: true, name: true } },
          appointment: { select: { id: true, appointmentTime: true, doctorId: true, checkedInAt: true } },
          clinicalNote: { select: { id: true, status: true, signedAt: true } },
        },
      })

      await writeAuditLog({
        userId: actor.userId,
        externalUserId: actor.externalUserId,
        sessionId: actor.sessionId,
        patientId: current.patientId,
        actorRole: actor.role,
        action: parsed.data.providerId !== undefined && parsed.data.providerId !== current.providerId
          ? 'assign_provider'
          : 'update',
        resource: 'encounter',
        resourceId: id,
        source: 'admin.ehr-encounters',
      }, transaction)

      if (parsed.data.status === 'completed') {
        const encounter = await transaction.encounter.findUnique({ where: { id }, select: { appointmentId: true } })
        if (encounter?.appointmentId) {
          const changed = await transaction.appointment.updateMany({ where: { id: encounter.appointmentId, status: { not: 'completed' } }, data: { status: 'completed' } })
          if (changed.count) await writeAuditLog({ ...actor, actorRole: actor.role, patientId: current.patientId, action: 'complete_from_encounter', resource: 'appointment', resourceId: encounter.appointmentId, source: 'ehr.encounters', summary: 'Appointment completed from signed clinical encounter' }, transaction)
        }
      }

      return { encounter: updated }
    })

    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
    return NextResponse.json({ encounter: result.encounter })
  } catch (error) {
    console.error('Unable to update encounter:', error)
    return NextResponse.json({ error: 'Unable to update encounter.' }, { status: 500 })
  }
}
