import { NextResponse } from 'next/server'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

export async function GET() {
  const actor = await authorizeEhrRequest()
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  try {
    const encounters = await prisma.encounter.findMany({
      where: actor.role === 'provider'
        ? { providerId: actor.userId ?? '__unmapped_provider__', patient: { providerAccess: { some: { providerId: actor.userId ?? '__unmapped_provider__', revokedAt: null } } } }
        : undefined,
      orderBy: [{ encounterDate: 'desc' }, { createdAt: 'desc' }],
      take: 100,
      include: {
        patient: { select: { id: true, patientId: true, firstName: true, lastName: true } },
        provider: { select: { id: true, name: true } },
        appointment: { select: { id: true, appointmentTime: true, doctorId: true, checkedInAt: true } },
        clinicalNote: {
          select: {
            id: true,
            status: true,
            signedAt: true,
            updatedAt: true,
            observationTongue: true,
            inquirySymptoms: true,
            palpationPulse: true,
            assessment: { select: { patternAssessment: true, treatmentPrinciple: true, followUpPlan: true } },
          },
        },
      },
    })

    await writeAuditLog({
      userId: actor.userId,
      externalUserId: actor.externalUserId,
      sessionId: actor.sessionId,
      actorRole: actor.role,
      action: 'read_list',
      resource: 'encounter',
      source: 'ehr.encounters',
    })

    const providers = actor.role === 'provider'
      ? []
      : await prisma.user.findMany({
          where: { role: 'provider' },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        })

    return NextResponse.json({
      encounters,
      providers,
      canWriteNotes: process.env.NODE_ENV !== 'production' && actor.role === 'provider' && Boolean(actor.userId),
      canManageQueue: actor.role === 'admin' || actor.role === 'clinic_staff',
    })
  } catch (error) {
    console.error('Unable to load encounter queue:', error)
    return NextResponse.json({ error: 'Unable to load encounter queue.' }, { status: 500 })
  }
}
