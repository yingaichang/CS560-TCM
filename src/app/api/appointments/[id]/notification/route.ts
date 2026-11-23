import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { writeAuditLog } from '@/lib/auditLog'
import { sendAppointmentNotification } from '@/lib/appointmentMail'
import { CommandError } from '@/lib/softwareCommands'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await authorizeEhrRequest(['admin', 'clinic_staff'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }) }
  const parsed = z.object({ kind: z.enum(['admin', 'patient']), expectedUpdatedAt: z.iso.datetime(), expectedAttempts: z.number().int().min(0), acknowledgePossibleDuplicate: z.literal(true) }).strict().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid retry fields.' }, { status: 400 })
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id: (await params).id } })
    if (!appointment) return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 })
    if (appointment.updatedAt.toISOString() !== parsed.data.expectedUpdatedAt) throw new CommandError('Appointment changed. Reload before sending.')
    await writeAuditLog({ ...actor, actorRole: actor.role, action: 'request_notification_retry', resource: 'appointment', resourceId: appointment.id, source: 'admin.appointments', summary: 'Explicit notification retry requested' })
    const delivery = await sendAppointmentNotification(appointment, parsed.data.kind, parsed.data.expectedAttempts)
    return NextResponse.json(delivery)
  } catch (error) {
    return NextResponse.json({ error: error instanceof CommandError ? error.message : 'Notification result is unknown. Reload before retrying.' }, { status: error instanceof CommandError ? error.status : 503 })
  }
}
