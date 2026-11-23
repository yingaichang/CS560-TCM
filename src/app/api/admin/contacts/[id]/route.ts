import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

const updateInput = z.object({
  status: z.enum(['new', 'in_progress', 'closed']),
})

type ContactRouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: ContactRouteContext) {
  const actor = await authorizeEhrRequest(['admin', 'clinic_staff'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const parsed = updateInput.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid contact status.' }, { status: 400 })

  try {
    const { id } = await params
    const result = await prisma.$transaction(async (transaction) => {
      const current = await transaction.contact.findUnique({ where: { id }, select: { id: true, status: true } })
      if (!current) return null
      const contact = await transaction.contact.update({
        where: { id },
        data: { status: parsed.data.status },
        select: { id: true, status: true },
      })
      if (current.status !== contact.status) {
        await writeAuditLog({
          userId: actor.userId,
          externalUserId: actor.externalUserId,
          sessionId: actor.sessionId,
          actorRole: actor.role,
          action: 'update_status',
          resource: 'contact_message',
          resourceId: id,
          source: 'admin.contact-inbox',
          module: 'contact',
          summary: 'Contact message status updated',
        }, transaction)
      }
      return contact
    })

    if (!result) return NextResponse.json({ error: 'Contact message not found.' }, { status: 404 })
    return NextResponse.json({ contact: result })
  } catch (error) {
    console.error('Unable to update contact message:', error)
    return NextResponse.json({ error: 'Unable to update contact message.' }, { status: 500 })
  }
}
