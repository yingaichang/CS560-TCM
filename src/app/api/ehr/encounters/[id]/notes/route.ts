import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

const draftInput = z.object({
  observationTongue: z.string().trim().max(1000).optional(),
  inquirySymptoms: z.string().trim().max(3000).optional(),
  palpationPulse: z.string().trim().max(1000).optional(),
  patternAssessment: z.string().trim().max(2000).optional(),
  treatmentPrinciple: z.string().trim().max(2000).optional(),
  followUpPlan: z.string().trim().max(2000).optional(),
}).strict()

type NoteRouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: NoteRouteContext) {
  const actor = await authorizeEhrRequest(['provider'])
  if (!actor?.userId) return NextResponse.json({ error: 'A mapped provider account is required.' }, { status: 403 })
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Clinical draft writes are disabled in production.' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const parsed = draftInput.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid clinical draft fields' }, { status: 400 })

  try {
    const { id } = await params
    const result = await prisma.$transaction(async (transaction) => {
      const encounter = await transaction.encounter.findFirst({
        where: {
          id,
          providerId: actor.userId!,
          patient: { providerAccess: { some: { providerId: actor.userId!, revokedAt: null } } },
        },
        select: {
          id: true,
          patientId: true,
          clinicalNote: { select: { id: true, status: true } },
        },
      })
      if (!encounter) return { error: 'Encounter not found or not assigned to this provider.', status: 404 as const }
      if (encounter.clinicalNote?.status === 'signed') {
        return { error: 'Signed notes are read-only.', status: 409 as const }
      }

      const note = await transaction.clinicalNote.upsert({
        where: { encounterId: encounter.id },
        create: {
          encounterId: encounter.id,
          authorId: actor.userId!,
          status: 'draft',
          observationTongue: parsed.data.observationTongue,
          inquirySymptoms: parsed.data.inquirySymptoms,
          palpationPulse: parsed.data.palpationPulse,
          assessment: {
            create: {
              patternAssessment: parsed.data.patternAssessment,
              treatmentPrinciple: parsed.data.treatmentPrinciple,
              followUpPlan: parsed.data.followUpPlan,
            },
          },
        },
        update: {
          observationTongue: parsed.data.observationTongue,
          inquirySymptoms: parsed.data.inquirySymptoms,
          palpationPulse: parsed.data.palpationPulse,
          assessment: {
            upsert: {
              create: {
                patternAssessment: parsed.data.patternAssessment,
                treatmentPrinciple: parsed.data.treatmentPrinciple,
                followUpPlan: parsed.data.followUpPlan,
              },
              update: {
                patternAssessment: parsed.data.patternAssessment,
                treatmentPrinciple: parsed.data.treatmentPrinciple,
                followUpPlan: parsed.data.followUpPlan,
              },
            },
          },
        },
        select: { id: true, status: true, updatedAt: true },
      })

      await writeAuditLog({
        userId: actor.userId,
        externalUserId: actor.externalUserId,
        sessionId: actor.sessionId,
        patientId: encounter.patientId,
        actorRole: actor.role,
        action: encounter.clinicalNote ? 'update_draft' : 'create_draft',
        resource: 'clinical_note',
        resourceId: note.id,
        source: 'ehr.encounter-note',
        module: 'ehr',
        summary: 'Provider clinical note draft saved',
      }, transaction)

      return { note }
    })

    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
    return NextResponse.json({ note: result.note })
  } catch (error) {
    console.error('Unable to save clinical note draft:', error)
    return NextResponse.json({ error: 'Unable to save clinical note draft.' }, { status: 500 })
  }
}
