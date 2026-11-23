import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId') || ''
  if (!/^cs_(?:test_|live_)[A-Za-z0-9]+$/.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid checkout session identifier.' }, { status: 400 })
  }

  try {
    const registration = await prisma.healthTopicRegistration.findUnique({
      where: { checkoutSessionId: sessionId },
      select: { topicName: true, amountTwd: true, currency: true, status: true, updatedAt: true },
    })
    if (!registration) return NextResponse.json({ error: 'Registration status is not available yet.' }, { status: 404 })
    return NextResponse.json(registration, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Unable to load payment registration status:', error)
    return NextResponse.json({ error: 'Unable to load payment registration status.' }, { status: 500 })
  }
}
