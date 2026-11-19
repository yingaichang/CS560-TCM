import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

type ClerkSessionData = {
  id: string
  user_id: string
}

type ClerkUserData = {
  id?: string
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

  const isSessionEvent = event.type === 'session.created' || event.type === 'session.ended'
  const isUserAccessEvent = event.type === 'user.created'
    || event.type === 'user.updated'
    || event.type === 'user.deleted'
  if (!isSessionEvent && !isUserAccessEvent) {
    return NextResponse.json({ received: true })
  }

  const webhookId = request.headers.get('svix-id')
  if (!webhookId) {
    return NextResponse.json({ error: 'Incomplete Clerk session event' }, { status: 400 })
  }

  const session = isSessionEvent ? event.data as ClerkSessionData : null
  const clerkUser = isUserAccessEvent ? event.data as ClerkUserData : null
  if ((session && (!session.id || !session.user_id)) || (clerkUser && !clerkUser.id)) {
    return NextResponse.json({ error: 'Incomplete Clerk identity event' }, { status: 400 })
  }

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.auditWebhookReceipt.create({
        data: { id: `clerk:${webhookId}`, provider: 'clerk' },
      })
      if (session) {
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
      } else if (clerkUser) {
        const action = event.type === 'user.created'
          ? 'user_created'
          : event.type === 'user.deleted'
            ? 'user_deleted'
            : 'user_access_profile_updated'
        await writeAuditLog({
          externalUserId: clerkUser.id,
          serviceId: 'clerk',
          action,
          resource: 'identity_user',
          resourceId: clerkUser.id,
          actorRole: 'identity_provider',
          source: 'auth.clerk-webhook',
          module: 'user_access',
          outcome: 'success',
          summary: action.replace(/_/g, ' '),
        }, transaction)
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ received: true, duplicate: true })
    }
    throw error
  }

  return NextResponse.json({ received: true })
}
