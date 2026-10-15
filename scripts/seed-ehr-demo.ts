import { PrismaClient } from '@prisma/client'
import { demoPatients } from '../src/lib/ehr/demoPatients'

const prisma = new PrismaClient()

const birthDates: Record<string, string> = {
  'YAI-DEMO-1001': '1984-02-14',
  'YAI-DEMO-1002': '1990-07-08',
  'YAI-DEMO-1003': '1975-11-19',
  'YAI-DEMO-1004': '1997-04-02',
}

async function main() {
  const providers = await prisma.user.findMany({ where: { role: 'provider' }, select: { id: true } })
  for (const item of demoPatients) {
    const patient = await prisma.patient.upsert({
      where: { patientId: item.patientId },
      update: {},
      create: {
        patientId: item.patientId,
        firstName: item.firstName,
        lastName: item.lastName,
        dateOfBirth: new Date(`${birthDates[item.patientId]}T00:00:00.000Z`),
        gender: item.gender,
        phone: item.phone,
        email: item.email,
        preferredLanguage: item.language,
        profile: {
          create: {
            address: '240 Willow Lane',
            city: 'Oakland',
            state: 'CA',
            postalCode: '94612',
            emergencyContact: item.emergencyContact,
            emergencyRelationship: item.relationship,
            emergencyContactPhone: item.emergencyPhone,
            lastVisitAt: item.lastVisit === 'New patient' ? null : new Date(item.lastVisit),
          },
        },
      },
    })

    for (const provider of providers) {
      await prisma.providerPatientAccess.upsert({
        where: { providerId_patientId: { providerId: provider.id, patientId: patient.id } },
        create: { providerId: provider.id, patientId: patient.id },
        update: {},
      })
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async () => {
    await prisma.$disconnect()
    process.exitCode = 1
  })