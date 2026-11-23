import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { writeAuditLog } from '@/lib/auditLog'
import { CommandError, runSoftwareCommand } from '@/lib/softwareCommands'

const input = z.discriminatedUnion('action', [
  z.object({ action: z.literal('sign_note'), encounterId: z.string().cuid(), expectedUpdatedAt: z.iso.datetime() }).strict(),
  z.object({ action: z.literal('record_treatment'), encounterId: z.string().cuid(), cptCodeId: z.string().cuid(), units: z.number().int().min(1).max(100), notes: z.string().trim().max(2000).default('') }).strict(),
  z.object({ action: z.literal('review_billing'), billingId: z.string().cuid(), expectedUpdatedAt: z.iso.datetime() }).strict(),
  z.object({ action: z.literal('record_medication'), patientId: z.string().cuid(), medicationId: z.string().cuid(), dosage: z.string().trim().min(1).max(200), frequency: z.string().trim().max(200), route: z.string().trim().max(100) }).strict(),
  z.object({ action: z.literal('stop_medication'), medicationRecordId: z.string().cuid(), expectedUpdatedAt: z.iso.datetime() }).strict(),
])

export async function GET() {
  const actor = await authorizeEhrRequest(['admin', 'clinic_staff', 'provider', 'billing_staff'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  try {
    const billingOnly = actor.role === 'billing_staff'
    const patientScope = actor.role === 'provider'
      ? { providerAccess: { some: { providerId: actor.userId ?? '__unmapped__', revokedAt: null } } } : {}
    const encounterScope = actor.role === 'provider' ? { providerId: actor.userId ?? '__unmapped__', patient: patientScope } : {}
    const [billingRecords, treatments, medications, documents, cptCodes, medicationCatalog, patients, intakes] = await Promise.all([
      prisma.billingRecord.findMany({ where: { encounter: encounterScope }, orderBy: { createdAt: 'desc' }, take: 100, include: { cptCode: true, patient: { select: { patientId: true, firstName: true, lastName: true } }, encounter: { select: { encounterId: true } } } }),
      billingOnly ? [] : prisma.treatment.findMany({ where: { encounter: encounterScope }, orderBy: { createdAt: 'desc' }, take: 100, include: { items: { include: { cptCode: true } }, encounter: { select: { encounterId: true, patient: { select: { patientId: true } } } } } }),
      billingOnly ? [] : prisma.patientMedication.findMany({ where: { patient: patientScope }, orderBy: { createdAt: 'desc' }, take: 100, include: { medication: true, patient: { select: { patientId: true } } } }),
      billingOnly ? [] : prisma.document.findMany({ where: { patient: patientScope }, orderBy: { createdAt: 'desc' }, take: 100, select: { id: true, name: true, documentType: true, createdAt: true, patient: { select: { patientId: true } } } }),
      prisma.cptCode.findMany({ where: { active: true }, orderBy: { code: 'asc' } }),
      billingOnly ? [] : prisma.medication.findMany({ orderBy: { name: 'asc' } }),
      billingOnly ? [] : prisma.patient.findMany({ where: patientScope, select: { id: true, patientId: true, firstName: true, lastName: true } }),
      billingOnly ? [] : prisma.patientIntake.findMany({ where: { patient: patientScope }, orderBy: { createdAt: 'desc' }, take: 100, select: { id: true, patientId: true, completedAt: true, createdAt: true } }),
    ])
    await writeAuditLog({ ...actor, actorRole: actor.role, action: 'read_list', resource: billingOnly ? 'billing_record' : 'clinical_workflow', source: 'ehr.workflow', module: 'ehr', summary: 'Authorized workflow records read' })
    return NextResponse.json({ billingRecords, treatments, medications, documents, cptCodes, medicationCatalog, patients, intakes, canWrite: process.env.NODE_ENV !== 'production' && actor.role === 'provider' && Boolean(actor.userId), canReviewBilling: process.env.NODE_ENV !== 'production' && ['admin', 'billing_staff'].includes(actor.role) })
  } catch { return NextResponse.json({ error: 'Unable to load workflow records. Retry without changing records.' }, { status: 503 }) }
}

export async function POST(request: NextRequest) {
  const actor = await authorizeEhrRequest(['provider', 'admin', 'billing_staff'])
  if (!actor?.userId) return NextResponse.json({ error: 'A mapped account is required.' }, { status: 403 })
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'These clinical writes are development-only.' }, { status: 403 })
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }) }
  const parsed = input.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid workflow fields.' }, { status: 400 })
  const data = parsed.data
  if (data.action === 'review_billing' ? !['admin', 'billing_staff'].includes(actor.role) : actor.role !== 'provider') return NextResponse.json({ error: 'Not authorized for this action.' }, { status: 403 })
  try {
    const result = await runSoftwareCommand(`ehr:${actor.userId}`, request.headers.get('idempotency-key'), data, async tx => {
      let patientId: string
      let resourceId: string
      if (data.action === 'sign_note' || data.action === 'record_treatment') {
        const encounter = await tx.encounter.findFirst({ where: { id: data.encounterId, providerId: actor.userId!, patient: { providerAccess: { some: { providerId: actor.userId!, revokedAt: null } } } }, include: { clinicalNote: true } })
        if (!encounter) throw new CommandError('Encounter not found or access revoked.', 404)
        if (encounter.status === 'cancelled') throw new CommandError('Cancelled encounters are read-only.')
        patientId = encounter.patientId
        if (data.action === 'sign_note') {
          const note = encounter.clinicalNote
          if (!note || note.authorId !== actor.userId) throw new CommandError('Only the note author may sign an existing draft.')
          if (note.status !== 'draft' || note.updatedAt.toISOString() !== data.expectedUpdatedAt) throw new CommandError('The draft changed or is already signed. Reload before signing.')
          if (!note.inquirySymptoms?.trim()) throw new CommandError('Document symptoms before signing.', 400)
          const updated = await tx.clinicalNote.updateMany({ where: { id: note.id, status: 'draft', updatedAt: note.updatedAt }, data: { status: 'signed', signedAt: new Date() } })
          if (updated.count !== 1) throw new CommandError('The draft changed. Reload before signing.')
          resourceId = note.id
        } else {
          if (encounter.clinicalNote?.status !== 'signed') throw new CommandError('Sign the clinical note before recording treatment.')
          const code = await tx.cptCode.findFirst({ where: { id: data.cptCodeId, active: true } })
          if (!code) throw new CommandError('The selected CPT code is unavailable.', 400)
          const treatment = await tx.treatment.create({ data: { treatmentId: `TRT-${randomUUID()}`, encounterId: encounter.id, providerId: actor.userId!, treatmentType: code.serviceName, units: data.units, notes: data.notes, items: { create: { cptCodeId: code.id, units: data.units } } } })
          const bill = await tx.billingRecord.create({ data: { patientId, encounterId: encounter.id, treatmentId: treatment.id, cptCodeId: code.id, units: data.units, serviceDate: encounter.encounterDate, status: 'draft' } })
          await writeAuditLog({ ...actor, actorRole: actor.role, patientId, action: 'create_draft', resource: 'billing_record', resourceId: bill.id, source: 'ehr.workflow', module: 'ehr', summary: 'Draft billing linked to recorded treatment; no charge submitted' }, tx)
          resourceId = treatment.id
        }
      } else if (data.action === 'review_billing') {
        const bill = await tx.billingRecord.findUnique({ where: { id: data.billingId } })
        if (!bill) throw new CommandError('Billing record not found.', 404)
        if (bill.status !== 'draft' || bill.updatedAt.toISOString() !== data.expectedUpdatedAt) throw new CommandError('Billing record changed. Reload before reviewing.')
        await tx.billingRecord.update({ where: { id: bill.id }, data: { status: 'reviewed' } })
        patientId = bill.patientId; resourceId = bill.id
      } else if (data.action === 'record_medication') {
        const patient = await tx.patient.findFirst({ where: { id: data.patientId, providerAccess: { some: { providerId: actor.userId!, revokedAt: null } } } })
        if (!patient) throw new CommandError('Patient not found or access revoked.', 404)
        if (!await tx.medication.findUnique({ where: { id: data.medicationId } })) throw new CommandError('Medication not found.', 404)
        if (await tx.patientMedication.findFirst({ where: { patientId: patient.id, medicationId: data.medicationId, active: true } })) throw new CommandError('An active record already exists. Review it before adding another.')
        const record = await tx.patientMedication.create({ data: { patientId: patient.id, medicationId: data.medicationId, dosage: data.dosage, frequency: data.frequency, route: data.route } })
        patientId = patient.id; resourceId = record.id
      } else {
        const record = await tx.patientMedication.findFirst({ where: { id: data.medicationRecordId, patient: { providerAccess: { some: { providerId: actor.userId!, revokedAt: null } } } } })
        if (!record) throw new CommandError('Medication record not found.', 404)
        if (!record.active || record.updatedAt.toISOString() !== data.expectedUpdatedAt) throw new CommandError('Medication record changed. Reload before updating.')
        await tx.patientMedication.update({ where: { id: record.id }, data: { active: false, endDate: new Date() } })
        patientId = record.patientId; resourceId = record.id
      }
      await writeAuditLog({ ...actor, actorRole: actor.role, patientId, action: data.action, resource: data.action === 'sign_note' ? 'clinical_note' : data.action === 'record_treatment' ? 'treatment' : data.action === 'review_billing' ? 'billing_record' : 'patient_medication', resourceId, source: 'ehr.workflow', module: 'ehr', summary: 'Explicit development workflow action recorded' }, tx)
      return { resourceId }
    })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof CommandError) return NextResponse.json({ error: error.message }, { status: error.status })
    return NextResponse.json({ error: 'Action could not be confirmed. Retry with the same submission key.' }, { status: 503 })
  }
}
