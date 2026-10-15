import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

const patientInput = z.object({
  firstName: z.string().trim().min(1).max(80),
  middleName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().min(1).max(80),
  dateOfBirth: z.iso.date().optional(),
  gender: z.string().trim().max(40).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.email().optional().or(z.literal('')),
  preferredLanguage: z.string().trim().max(80).optional(),
  address: z.string().trim().max(240).optional(),
  emergencyContact: z.string().trim().max(160).optional(),
  emergencyRelationship: z.string().trim().max(80).optional(),
  emergencyContactPhone: z.string().trim().max(40).optional(),
})

export async function GET() {
  const actor = await authorizeEhrRequest()
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const patients = await prisma.patient.findMany({
    where: actor.role === 'provider'
      ? { providerAccess: { some: { providerId: actor.userId ?? '', revokedAt: null } } }
      : undefined,
    select: {
      id: true,
      patientId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      dateOfBirth: true,
      gender: true,
      phone: true,
      email: true,
      preferredLanguage: true,
      status: true,
      createdAt: true,
      profile: { select: { address: true, city: true, state: true, postalCode: true, lastVisitAt: true } },
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  })

  for (const patient of patients) {
    await writeAuditLog({
        userId: actor.userId,
        externalUserId: actor.externalUserId,
        sessionId: actor.sessionId,
        patientId: patient.id,
        action: 'read',
        resource: 'patient_list_item',
        resourceId: patient.id,
        actorRole: actor.role,
        source: 'ehr.patient-list',
    })
  }

  return NextResponse.json({ patients })
}

export async function POST(request: NextRequest) {
  const actor = await authorizeEhrRequest()
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'EHR writes are disabled in this development phase' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = patientInput.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid patient fields' }, { status: 400 })
  }

  const data = parsed.data
  const patient = await prisma.patient.create({
    data: {
      patientId: `YAI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth ? new Date(`${data.dateOfBirth}T00:00:00.000Z`) : null,
      gender: data.gender || null,
      phone: data.phone || null,
      email: data.email || null,
      preferredLanguage: data.preferredLanguage || null,
      profile: {
        create: {
          address: data.address || null,
          emergencyContact: data.emergencyContact || null,
          emergencyRelationship: data.emergencyRelationship || null,
          emergencyContactPhone: data.emergencyContactPhone || null,
        },
      },
      ...(actor.role === 'provider' && actor.userId
        ? { providerAccess: { create: { providerId: actor.userId } } }
        : {}),
    },
    select: { id: true, patientId: true, firstName: true, lastName: true, status: true },
  })

  await writeAuditLog({
      userId: actor.userId,
      externalUserId: actor.externalUserId,
      sessionId: actor.sessionId,
      patientId: patient.id,
      action: 'create',
      resource: 'patient',
      resourceId: patient.id,
      actorRole: actor.role,
      source: 'ehr.patient-create',
  })

  return NextResponse.json({ patient }, { status: 201 })
}