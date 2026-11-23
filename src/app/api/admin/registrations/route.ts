import { NextResponse } from 'next/server'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

export async function GET() {
  const actor = await authorizeEhrRequest(['admin', 'billing_staff'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  try {
    const registrations = await prisma.healthTopicRegistration.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        checkoutSessionId: true,
        topicId: true,
        topicName: true,
        amountTwd: true,
        currency: true,
        status: true,
        customerEmail: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    await writeAuditLog({
      userId: actor.userId,
      externalUserId: actor.externalUserId,
      sessionId: actor.sessionId,
      actorRole: actor.role,
      action: 'read_list',
      resource: 'health_topic_registration',
      source: 'admin.registrations',
      module: 'payment',
    })
    return NextResponse.json({ registrations })
  } catch (error) {
    console.error('Unable to load registrations:', error)
    return NextResponse.json({ error: 'Unable to load registrations.' }, { status: 500 })
  }
}
