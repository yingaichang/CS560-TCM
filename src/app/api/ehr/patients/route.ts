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

const patientInput = z.object({
  firstName: z.string().trim().min(1).max(80),
  middleName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().min(1).max(80),
  dateOfBirth: z.iso.date().optional(),
  gender: z.string().trim().max(40).optional(),
  phone: optionalPhone.optional(),
  email: z.email().optional().or(z.literal('')),
  preferredLanguage: z.string().trim().max(80).optional(),
  address: z.string().trim().max(240).optional(),
  city: z.string().trim().max(120).optional(),
  state: z.string().trim().max(120).optional(),
  postalCode: z.string().trim().max(30).optional(),
  country: z.string().trim().max(120).optional(),
  emergencyContact: z.string().trim().max(160).optional(),
  emergencyRelationship: z.string().trim().max(80).optional(),
  emergencyContactPhone: optionalPhone.optional(),
  emergencyContactEmail: z.email().optional().or(z.literal('')),
  requireCompleteProfile: z.boolean().optional(),
}).superRefine((data, context) => {
  if (!data.requireCompleteProfile) return

  const requiredFields = [
    ['firstName', data.firstName],
    ['lastName', data.lastName],
    ['dateOfBirth', data.dateOfBirth],
    ['gender', data.gender],
    ['phone', data.phone],
    ['email', data.email],
    ['address', data.address],
    ['city', data.city],
    ['state', data.state],
    ['postalCode', data.postalCode],
    ['country', data.country],
    ['emergencyContact', data.emergencyContact],
    ['emergencyRelationship', data.emergencyRelationship],
    ['emergencyContactPhone', data.emergencyContactPhone],
    ['emergencyContactEmail', data.emergencyContactEmail],
  ] as const

  for (const [field, value] of requiredFields) {
    if (!value?.trim()) {
      context.addIssue({
        code: 'custom',
        path: [field],
        message: 'This field is required.',
      })
    }
  }
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

  const data = parsed.data
  try {
    const patient = await prisma.$transaction(async (transaction) => {
      const created = await transaction.patient.create({
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
              city: data.city || null,
              state: data.state || null,
              postalCode: data.postalCode || null,
              country: data.country || null,
              emergencyContact: data.emergencyContact || null,
              emergencyRelationship: data.emergencyRelationship || null,
              emergencyContactPhone: data.emergencyContactPhone || null,
              emergencyContactEmail: data.emergencyContactEmail || null,
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
        patientId: created.id,
        action: 'create',
        resource: 'patient',
        resourceId: created.id,
        actorRole: actor.role,
        source: 'ehr.patient-create',
      }, transaction)

      return created
    })

    return NextResponse.json({ patient }, { status: 201 })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json({ error: 'Unable to save patient. Please try again.' }, { status: 500 })
  }
}