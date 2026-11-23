import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import Stripe from 'stripe'
import { findHealthTopicById } from '@/lib/healthTopics'
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
  let registrationStatus: 'pending' | 'paid' | 'failed' | 'expired'
  let session: Stripe.Checkout.Session
  switch (event.type) {
    case 'checkout.session.completed': {
      session = event.data.object as Stripe.Checkout.Session
      action = session.payment_status === 'paid' || session.payment_status === 'no_payment_required'
        ? 'payment_succeeded'
        : 'payment_pending'
      outcome = session.payment_status
      registrationStatus = action === 'payment_succeeded' ? 'paid' : 'pending'
      break
    }
    case 'checkout.session.async_payment_succeeded':
      session = event.data.object as Stripe.Checkout.Session
      action = 'payment_succeeded'
      outcome = 'success'
      registrationStatus = 'paid'
      break
    case 'checkout.session.async_payment_failed':
      session = event.data.object as Stripe.Checkout.Session
      action = 'payment_failed'
      outcome = 'failed'
      registrationStatus = 'failed'
      break
    case 'checkout.session.expired':
      session = event.data.object as Stripe.Checkout.Session
      action = 'checkout_expired'
      outcome = 'expired'
      registrationStatus = 'expired'
      break
    default:
      return NextResponse.json({ received: true, ignored: true })
  }

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.auditWebhookReceipt.create({
        data: { id: `stripe:${event.id}`, provider: 'stripe' },
      })
      const current = await transaction.healthTopicRegistration.findUnique({
        where: { checkoutSessionId: session.id },
      })
      const metadataTopicId = session.metadata?.topicId
      const topicId = current && metadataTopicId && current.topicId !== metadataTopicId
        ? ''
        : metadataTopicId || current?.topicId || ''
      const topic = findHealthTopicById(topicId)
      if (topic) {
        const status = current?.status === 'paid'
          ? 'paid'
          : current && current.status !== 'pending' && registrationStatus !== 'paid'
            ? current.status
            : registrationStatus
        await transaction.healthTopicRegistration.upsert({
          where: { checkoutSessionId: session.id },
          create: {
            checkoutSessionId: session.id,
            topicId: topic.id,
            topicName: topic.topic,
            amountTwd: topic.feeTwd,
            currency: 'twd',
            status,
            customerEmail: session.customer_details?.email || session.customer_email || null,
          },
          update: {
            status,
            customerEmail: current?.customerEmail || session.customer_details?.email || session.customer_email || null,
          },
        })
      } else {
        action = 'payment_event_unmatched'
        outcome = 'unknown_topic'
      }
      await writeAuditLog({
        serviceId: 'stripe',
        action,
        resource: 'health_topic_checkout',
        resourceId: session.id,
        actorRole: 'payment_provider',
        source: 'payment.stripe-webhook',
        module: 'payment',
        outcome,
        summary: action === 'payment_event_unmatched'
          ? 'Verified payment event did not match a known topic'
          : action.replace(/_/g, ' '),
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