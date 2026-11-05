import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

const isValidPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '')
  return /^[+\d\s().-]+$/.test(value) && digits.length >= 7 && digits.length <= 15
}

const optionalPhone = z.string()
  .trim()
  .max(40)
  .refine((value) => value === '' || isValidPhoneNumber(value), 'Enter a valid phone number.')

const patientUpdateInput = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  dateOfBirth: z.iso.date(),
  gender: z.string().trim().min(1).max(40),
  phone: optionalPhone,
  email: z.email(),
  address: z.string().trim().min(1).max(240),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().min(1).max(30),
  country: z.string().trim().min(1).max(120),
  emergencyContact: z.string().trim().min(1).max(160),
  emergencyRelationship: z.string().trim().min(1).max(80),
  emergencyContactPhone: optionalPhone,
  emergencyContactEmail: z.email(),
})

type PatientRouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: PatientRouteContext) {
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

export async function PUT(request: NextRequest, { params }: PatientRouteContext) {
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

  const parsed = patientUpdateInput.safeParse(body)
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      parsed.error.issues.flatMap((issue) => {
        const field = issue.path[0]
        return typeof field === 'string' ? [[field, issue.message]] : []
      }),
    )
    return NextResponse.json({
      error: 'Please correct the highlighted fields.',
      fieldErrors,
    }, { status: 400 })
  }

  const { id } = await params
  const data = parsed.data

  try {
    const patient = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.patient.findFirst({
        where: {
          id,
          ...(actor.role === 'provider'
            ? { providerAccess: { some: { providerId: actor.userId ?? '', revokedAt: null } } }
            : {}),
        },
        select: { id: true },
      })
      if (!existing) return null

      const updated = await transaction.patient.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: new Date(`${data.dateOfBirth}T00:00:00.000Z`),
          gender: data.gender,
          phone: data.phone,
          email: data.email,
          profile: {
            upsert: {
              create: {
                address: data.address,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
                country: data.country,
                emergencyContact: data.emergencyContact,
                emergencyRelationship: data.emergencyRelationship,
                emergencyContactPhone: data.emergencyContactPhone,
                emergencyContactEmail: data.emergencyContactEmail,
              },
              update: {
                address: data.address,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
                country: data.country,
                emergencyContact: data.emergencyContact,
                emergencyRelationship: data.emergencyRelationship,
                emergencyContactPhone: data.emergencyContactPhone,
                emergencyContactEmail: data.emergencyContactEmail,
              },
            },
          },
        },
        include: { profile: true },
      })

      await writeAuditLog({
        userId: actor.userId,
        externalUserId: actor.externalUserId,
        sessionId: actor.sessionId,
        patientId: updated.id,
        action: 'update',
        resource: 'patient',
        resourceId: updated.id,
        actorRole: actor.role,
        source: 'ehr.patient-update',
      }, transaction)

      return updated
    })

    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    return NextResponse.json({ patient })
  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json({ error: 'Unable to update patient. Please try again.' }, { status: 500 })
  }
}