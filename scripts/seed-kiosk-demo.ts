import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// One-off helper to create a demo appointment for kiosk testing.
// Usage: npx tsx scripts/seed-kiosk-demo.ts
async function main() {
  const today = new Date()
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const appointment = await prisma.appointment.upsert({
    where: {
      doctorId_date_appointmentTime: {
        doctorId: 'doctor-li-ming-zhi',
        date: dayStart,
        appointmentTime: '10:00',
      },
    },
    update: {
      name: 'Demo Patient',
      phone: '5555558888',
      status: 'confirmed',
      checkedIn: false,
      checkedInAt: null,
    },
    create: {
      name: 'Demo Patient',
      email: 'demo.patient@example.com',
      phone: '5555558888',
      doctorId: 'doctor-li-ming-zhi',
      date: dayStart,
      appointmentTime: '10:00',
      service: '中醫內科調理',
      status: 'confirmed',
    },
  })

  console.log('Demo appointment ready:', appointment)

  // Second demo patient, identified via last-4 SSN instead of phone.
  // The verification code still goes to the phone on file (5555559999),
  // since SSN alone is not enough to see appointment details.
  const ssnAppointment = await prisma.appointment.upsert({
    where: {
      doctorId_date_appointmentTime: {
        doctorId: 'doctor-wang-fang-yu',
        date: dayStart,
        appointmentTime: '11:00',
      },
    },
    update: {
      name: 'Demo SSN Patient',
      phone: '5555559999',
      ssnLast4: '8888',
      status: 'confirmed',
      checkedIn: false,
      checkedInAt: null,
    },
    create: {
      name: 'Demo SSN Patient',
      email: 'demo.ssn.patient@example.com',
      phone: '5555559999',
      ssnLast4: '8888',
      doctorId: 'doctor-wang-fang-yu',
      date: dayStart,
      appointmentTime: '11:00',
      service: '婦科調理',
      status: 'confirmed',
    },
  })

  console.log('Demo SSN appointment ready:', ssnAppointment)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
