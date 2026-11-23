import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adapterServices } from '@/lib/integrations/contracts'
import { adapterSecret, receiveAdapterEvent, verifyAdapterSignature } from '@/lib/integrations/receiptAdapter'
import { BoundaryError, parseJson, readBoundedBody } from '@/lib/integrations/httpBoundary'

export async function POST(request: NextRequest, { params }: { params: Promise<{ service: string }> }) {
  const parsed = z.enum(adapterServices).safeParse((await params).service)
  if (!parsed.success) return NextResponse.json({ error: 'Unknown adapter.' }, { status: 404 })
  const service = parsed.data
  const secret = adapterSecret(service)
  if (!secret) return NextResponse.json({ error: 'Receipt adapter is not configured; no workflow is applied.' }, { status: 503 })
  try {
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new BoundaryError(415, 'JSON is required.')
    const body = await readBoundedBody(request)
    verifyAdapterSignature(service, body, request.headers.get('x-adapter-timestamp'), request.headers.get('x-adapter-signature'), secret)
    const receipt = await receiveAdapterEvent(service, parseJson(body))
    return NextResponse.json(receipt, { status: 202, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const status = error instanceof BoundaryError ? error.status : error instanceof z.ZodError ? 400 : 503
    return NextResponse.json({ error: error instanceof BoundaryError ? error.message : status === 400 ? 'Invalid event contract.' : 'Receipt was not confirmed; retry the same event.' }, { status })
  }
}
