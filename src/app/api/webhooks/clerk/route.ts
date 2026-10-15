import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

type ClerkSessionData = {
  id: string
  user_id: string
}

export async function POST(request: NextRequest) {
  if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
    return NextResponse.json({ error: 'Clerk webhook is not configured' }, { status: 503 })
  }

  let event
  try {
    event = await verifyWebhook(request)
  } catch {
    return NextResponse.json({ error: 'Invalid Clerk webhook signature' }, { status: 400 })
  }

  if (event.type !== 'session.created' && event.type !== 'session.ended') {
    return NextResponse.json({ received: true })
  }

  const session = event.data as ClerkSessionData
  const webhookId = request.headers.get('svix-id')
  if (!webhookId || !session.id || !session.user_id) {
    return NextResponse.json({ error: 'Incomplete Clerk session event' }, { status: 400 })
  }

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.auditWebhookReceipt.create({
        data: { id: `clerk:${webhookId}`, provider: 'clerk' },
      })
      await writeAuditLog({
        externalUserId: session.user_id,
        serviceId: 'clerk',
        sessionId: session.id,
        action: event.type === 'session.created' ? 'login_succeeded' : 'session_ended',
        resource: 'auth_session',
        resourceId: session.id,
        actorRole: 'authenticated_user',
        source: 'auth.clerk-webhook',
        module: 'auth',
        outcome: 'success',
        summary: event.type === 'session.created' ? 'Clerk session created' : 'Clerk session ended',
      }, transaction)
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ received: true, duplicate: true })
    }
    throw error
  }

  return NextResponse.json({ received: true })
}