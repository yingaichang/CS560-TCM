import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { deliverContact } from '@/lib/contactDelivery'
import { CommandError } from '@/lib/softwareCommands'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await authorizeEhrRequest(['admin', 'clinic_staff'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }) }
  const parsed = z.object({ expectedAttempts: z.number().int().min(0), acknowledgePossibleDuplicate: z.literal(true) }).strict().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Explicit retry acknowledgement and current attempt count are required.' }, { status: 400 })
  try {
    const status = await deliverContact((await params).id, true, { ...actor, actorRole: actor.role }, parsed.data.expectedAttempts)
    return NextResponse.json({ emailDeliveryStatus: status })
  } catch (error) {
    return NextResponse.json({ error: error instanceof CommandError ? error.message : 'Delivery could not be confirmed. Reload the inbox before taking further action.' }, { status: error instanceof CommandError ? error.status : 503 })
  }
}
