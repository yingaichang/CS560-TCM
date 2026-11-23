import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'
import { CommandError, runSoftwareCommand } from '@/lib/softwareCommands'

const intakeInput = z.object({
  patientId: z.string().cuid(),
  majorComplaints: z.string().trim().max(3000).optional(),
  onsetDate: z.iso.date().optional(),
  frequency: z.enum(['constant', 'frequent', 'occasional', 'intermittent']).optional(),
  symptomNature: z.array(z.enum(['sharp', 'shooting', 'dull_ache', 'burning', 'numb', 'tingling'])).max(6).default([]),
  symptomChange: z.enum(['improving', 'no_change', 'worsening']).optional(),
  painIntensity: z.number().int().min(0).max(10).optional(),
  locations: z.array(z.enum(['front', 'back', 'left', 'right'])).max(4).default([]),
  workImpact: z.string().trim().max(1000).optional(),
  socialImpact: z.string().trim().max(1000).optional(),
  overallHealth: z.string().trim().max(1000).optional(),
  previousProviders: z.string().trim().max(2000).optional(),
  patientQuestions: z.string().trim().max(2000).optional(),
  patientConcerns: z.string().trim().max(2000).optional(),
  additionalInformation: z.string().trim().max(2000).optional(),
  signatureName: z.string().trim().max(160).optional(),
  signatureDate: z.iso.date().optional(),
  medicalConditions: z.array(z.enum([
    'Cancer', 'Diabetes', 'Hepatitis', 'Hypertension', 'Autoimmune disease', 'Stroke', 'Heart disease',
    'Seizures', 'Arthritis', 'Asthma', 'Thyroid disease', 'Mental illness', 'Infectious diseases',
  ])).max(13).default([]),
  historyEntries: z.array(z.object({
    category: z.enum(['disease_surgery', 'trauma', 'car_accident', 'fall', 'allergy']),
    details: z.string().trim().min(1).max(1000),
  })).max(20).default([]),
  diagnosticTests: z.array(z.object({
    testType: z.enum(['X-Ray', 'MRI', 'CT Scan', 'Other']),
    testDate: z.iso.date().optional(),
    location: z.string().trim().max(200).optional(),
  })).max(20).default([]),
  lifestyleEntries: z.array(z.object({
    category: z.enum(['Smoking', 'Alcohol use', 'Coffee / caffeine', 'Drug use', 'Restricted diet', 'Exercise', 'Other habits']),
    uses: z.enum(['yes', 'no']).optional(),
    frequency: z.string().trim().max(200).optional(),
    amount: z.string().trim().max(200).optional(),
    notes: z.string().trim().max(500).optional(),
  })).max(7).default([]),
})

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

  const parsed = intakeInput.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid intake fields' }, { status: 400 })
  }

  const data = parsed.data
  const patientExists = await prisma.patient.findFirst({
    where: {
      id: data.patientId,
      ...(actor.role === 'provider'
        ? { providerAccess: { some: { providerId: actor.userId ?? '', revokedAt: null } } }
        : {}),
    },
    select: { id: true },
  })
  if (!patientExists) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

  try {
  const result = await runSoftwareCommand(`intake-create:${actor.userId || actor.externalUserId}`, request.headers.get('idempotency-key'), data, async (transaction) => {
    const allowed = await transaction.patient.findFirst({ where: { id: data.patientId, ...(actor.role === 'provider' ? { providerAccess: { some: { providerId: actor.userId ?? '', revokedAt: null } } } : {}) }, select: { id: true } })
    if (!allowed) throw new CommandError('Patient not found or access revoked.', 404)
    const record = await transaction.patientIntake.create({
      data: {
        patientId: data.patientId,
        majorComplaints: data.majorComplaints,
        onsetDate: data.onsetDate ? new Date(`${data.onsetDate}T00:00:00.000Z`) : null,
        frequency: data.frequency,
        symptomChange: data.symptomChange,
        painIntensity: data.painIntensity,
        workImpact: data.workImpact,
        socialImpact: data.socialImpact,
        overallHealth: data.overallHealth,
        previousProviders: data.previousProviders,
        patientQuestions: data.patientQuestions,
        patientConcerns: data.patientConcerns,
        additionalInformation: data.additionalInformation,
        signatureName: data.signatureName,
        signatureDate: data.signatureDate ? new Date(`${data.signatureDate}T00:00:00.000Z`) : null,
        selections: {
          create: [
            ...Array.from(new Set(data.locations)).map((value) => ({ kind: 'pain_location', value })),
            ...Array.from(new Set(data.symptomNature)).map((value) => ({ kind: 'symptom_nature', value })),
          ],
        },
        diagnosticTests: {
          create: data.diagnosticTests.map((test) => ({
            patientId: data.patientId,
            testType: test.testType,
            testDate: test.testDate ? new Date(`${test.testDate}T00:00:00.000Z`) : null,
            location: test.location || null,
          })),
        },
      },
      select: { id: true, patientId: true, createdAt: true },
    })

    await transaction.patient.update({
      where: { id: data.patientId },
      data: {
        medicalHistories: {
          create: [
            ...data.medicalConditions.map((condition) => ({ category: 'condition', condition })),
            ...data.historyEntries.filter((entry) => entry.category !== 'allergy').map((entry) => ({ category: entry.category, condition: entry.details })),
          ],
        },
        allergies: {
          create: data.historyEntries.filter((entry) => entry.category === 'allergy').map((entry) => ({ allergen: entry.details })),
        },
        lifestyleProfile: { upsert: { create: {}, update: {} } },
      },
    })

    for (const entry of data.lifestyleEntries) {
      await transaction.lifestyleEntry.upsert({
        where: { patientId_category: { patientId: data.patientId, category: entry.category } },
        create: {
          patientId: data.patientId,
          category: entry.category,
          uses: entry.uses === undefined ? null : entry.uses === 'yes',
          frequency: entry.frequency,
          amount: entry.amount,
          notes: entry.notes,
        },
        update: {
          uses: entry.uses === undefined ? null : entry.uses === 'yes',
          frequency: entry.frequency,
          amount: entry.amount,
          notes: entry.notes,
        },
      })
    }

    await writeAuditLog({
        userId: actor.userId,
        externalUserId: actor.externalUserId,
        sessionId: actor.sessionId,
        patientId: data.patientId,
        action: 'create',
        resource: 'patient_intake',
        resourceId: record.id,
        actorRole: actor.role,
        source: 'ehr.patient-intake',
      }, transaction)

    return { resourceId: record.id }
  })
  const intake = await prisma.patientIntake.findUnique({ where: { id: result.result.resourceId }, select: { id: true, patientId: true, createdAt: true } })
  return NextResponse.json({ intake, duplicate: result.duplicate }, { status: result.duplicate ? 200 : 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof CommandError ? error.message : 'Intake could not be confirmed. Retry with the same submission key.' }, { status: error instanceof CommandError ? error.status : 503 })
  }
}
