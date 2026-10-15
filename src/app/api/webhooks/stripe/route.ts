import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get('stripe-signature')
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook is not configured' }, { status: 503 })
  }
  if (!signature) return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })

  const stripe = new Stripe(stripeSecretKey)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid Stripe webhook signature' }, { status: 400 })
  }

  let action: string
  let outcome: string
  let resourceId: string
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      resourceId = session.id
      action = session.payment_status === 'paid' || session.payment_status === 'no_payment_required'
        ? 'payment_succeeded'
        : 'payment_pending'
      outcome = session.payment_status
      break
    }
    case 'checkout.session.async_payment_succeeded':
      action = 'payment_succeeded'
      outcome = 'success'
      resourceId = event.data.object.id
      break
    case 'checkout.session.async_payment_failed':
      action = 'payment_failed'
      outcome = 'failed'
      resourceId = event.data.object.id
      break
    case 'checkout.session.expired':
      action = 'checkout_expired'
      outcome = 'expired'
      resourceId = event.data.object.id
      break
    default:
      return NextResponse.json({ received: true, ignored: true })
  }

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.auditWebhookReceipt.create({
        data: { id: `stripe:${event.id}`, provider: 'stripe' },
      })
      await writeAuditLog({
        serviceId: 'stripe',
        action,
        resource: 'health_topic_checkout',
        resourceId,
        actorRole: 'payment_provider',
        source: 'payment.stripe-webhook',
        module: 'payment',
        outcome,
        summary: action.replace(/_/g, ' '),
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