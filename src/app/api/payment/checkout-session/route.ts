import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { findHealthTopicById } from '@/lib/healthTopics'
import { writeAuditLog } from '@/lib/auditLog'
import { prisma } from '@/lib/prisma'
import { createHash } from 'node:crypto'
import { lockSoftwareWrites } from '@/lib/softwareCommands'

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!stripeSecretKey) {
    return null
  }

  return new Stripe(stripeSecretKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const topicId = String(body.topicId || '').trim()

    if (!topicId) {
      return NextResponse.json({ error: '缺少主題資訊' }, { status: 400 })
    }

    const topic = findHealthTopicById(topicId)
    if (!topic) {
      return NextResponse.json({ error: '找不到講座主題' }, { status: 404 })
    }
    const submissionKey = request.headers.get('idempotency-key')
    if (!submissionKey || !/^[0-9a-f-]{36}$/i.test(submissionKey)) return NextResponse.json({ error: 'A submission identifier is required.' }, { status: 400 })

    const stripe = getStripeClient()
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe 金鑰未設定，請先完成伺服器環境變數設定。' },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'twd',
            unit_amount: topic.feeTwd * 100,
            product_data: {
              name: `健康學院報名 - ${topic.topic}`,
              description: topic.summary,
            },
          },
        },
      ],
      success_url: `${appUrl}/payment?topic=${topic.id}&status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment?topic=${topic.id}&status=cancel`,
      metadata: {
        topicId: topic.id,
        topic: topic.topic,
      },
    }, { idempotencyKey: 'topic-checkout-' + createHash('sha256').update(submissionKey).digest('hex') })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Stripe 未回傳付款網址，請稍後再試。' },
        { status: 500 }
      )
    }

    await prisma.$transaction(async (transaction) => {
      await lockSoftwareWrites(transaction)
      const previous = await transaction.healthTopicRegistration.findUnique({ where: { checkoutSessionId: session.id } })
      await transaction.healthTopicRegistration.upsert({
        where: { checkoutSessionId: session.id },
        create: {
          checkoutSessionId: session.id,
          topicId: topic.id,
          topicName: topic.topic,
          amountTwd: topic.feeTwd,
          currency: 'twd',
          status: 'pending',
        },
        update: {},
      })
      if (!previous) await writeAuditLog({
        action: 'checkout_session_created',
        resource: 'health_topic_checkout',
        resourceId: session.id,
        actorRole: 'public',
        source: 'public.payment',
        outcome: 'initiated',
      }, transaction)
    })

    return NextResponse.json({ sessionId: session.id, sessionUrl: session.url })
  } catch (error) {
    console.error('Create Stripe checkout session failed:', error)
    return NextResponse.json({ error: '建立付款連結失敗，請稍後再試。' }, { status: 500 })
  }
}
