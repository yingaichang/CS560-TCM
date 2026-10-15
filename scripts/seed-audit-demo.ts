import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

const demoSource = 'demo.activity'

const demoEvents = [
  {
    module: 'kiosk',
    action: 'verification_succeeded',
    resource: 'appointment_checkin',
    resourceId: 'DEMO-CHECKIN-001',
    actorRole: 'kiosk',
    serviceId: 'demo-kiosk',
    summary: 'Demo patient verification succeeded',
  },
  {
    module: 'kiosk',
    action: 'check_in',
    resource: 'appointment_checkin',
    resourceId: 'DEMO-CHECKIN-001',
    actorRole: 'kiosk',
    serviceId: 'demo-kiosk',
    summary: 'Demo patient checked in',
  },
  {
    module: 'appointments',
    action: 'create',
    resource: 'appointment',
    resourceId: 'DEMO-APPOINTMENT-001',
    actorRole: 'public',
    serviceId: 'demo-booking',
    summary: 'Demo appointment created',
  },
  {
    module: 'appointments',
    action: 'update',
    resource: 'appointment',
    resourceId: 'DEMO-APPOINTMENT-001',
    actorRole: 'clinic_staff',
    serviceId: 'demo-appointment-manager',
    summary: 'Demo appointment status changed',
  },
  {
    module: 'payment',
    action: 'checkout_session_created',
    resource: 'health_topic_checkout',
    resourceId: 'DEMO-CHECKOUT-001',
    actorRole: 'public',
    serviceId: 'demo-payment',
    outcome: 'initiated',
    summary: 'Demo payment checkout created',
  },
  {
    module: 'payment',
    action: 'payment_succeeded',
    resource: 'health_topic_checkout',
    resourceId: 'DEMO-CHECKOUT-001',
    actorRole: 'payment_provider',
    serviceId: 'demo-payment',
    outcome: 'success',
    summary: 'Demo payment succeeded',
  },
  {
    module: 'payment',
    action: 'payment_failed',
    resource: 'health_topic_checkout',
    resourceId: 'DEMO-CHECKOUT-002',
    actorRole: 'payment_provider',
    serviceId: 'demo-payment',
    outcome: 'failed',
    summary: 'Demo payment failed',
  },
] as const

async function main() {
  const alreadySeeded = await prisma.auditLog.count({ where: { source: demoSource } })
  if (alreadySeeded) {
    console.log(`Demo audit activity already exists (${alreadySeeded} events); no changes made.`)
    return
  }

  for (const event of demoEvents) {
    await writeAuditLog({
      ...event,
      source: demoSource,
    })
  }

  console.log(`Created ${demoEvents.length} fictional audit events across kiosk, appointments, and payment.`)
}

main()
  .catch((error) => {
    console.error('Failed to seed fictional audit activity:', error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())