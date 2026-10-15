import { NextRequest, NextResponse } from 'next/server'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await authorizeEhrRequest()
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  const { id } = await params

  const patient = await prisma.patient.findFirst({
    where: {
      id,
      ...(actor.role === 'provider'
        ? { providerAccess: { some: { providerId: actor.userId ?? '', revokedAt: null } } }
        : {}),
    },
    include: {
      profile: true,
      intakes: { orderBy: { createdAt: 'desc' }, take: 5, include: { selections: true, diagnosticTests: true } },
      medicalHistories: { orderBy: { createdAt: 'desc' } },
      familyHistories: { orderBy: { createdAt: 'desc' } },
      allergies: { orderBy: { createdAt: 'desc' } },
      symptoms: { include: { symptom: true }, orderBy: { recordedAt: 'desc' } },
      medications: { include: { medication: true }, orderBy: { createdAt: 'desc' } },
      lifestyleEntries: true,
      womensHealth: true,
      interviews: { orderBy: { createdAt: 'desc' }, take: 5 },
      encounters: {
        orderBy: { encounterDate: 'desc' },
        take: 20,
        include: {
          clinicalNote: { include: { assessment: true } },
          treatments: { include: { items: { include: { cptCode: true } } } },
          billingRecords: { include: { cptCode: true } },
          documents: true,
        },
      },
      documents: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

  await writeAuditLog({
      userId: actor.userId,
      externalUserId: actor.externalUserId,
      sessionId: actor.sessionId,
      patientId: patient.id,
      action: 'read',
      resource: 'patient_profile',
      resourceId: patient.id,
      actorRole: actor.role,
      source: 'ehr.patient-profile',
  })

  return NextResponse.json({ patient })
}