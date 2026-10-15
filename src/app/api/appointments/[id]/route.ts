import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { writeAuditLog } from '@/lib/auditLog'
import { notifyAppointmentStatus } from '@/lib/appointmentMail'
import { prisma } from '@/lib/prisma'

type AppointmentRouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: AppointmentRouteContext) {
  const actor = await authorizeEhrRequest(['admin', 'clinic_staff'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  try {
    const { id } = await params
    const appointment = await prisma.appointment.findUnique({ where: { id } })
    if (!appointment) return NextResponse.json({ error: '找不到預約' }, { status: 404 })
    await writeAuditLog({ userId: actor.userId, externalUserId: actor.externalUserId, sessionId: actor.sessionId, actorRole: actor.role, action: 'read', resource: 'appointment', resourceId: id, source: 'admin.appointments' })
    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json({ error: '無法獲取預約' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: AppointmentRouteContext) {
  const actor = await authorizeEhrRequest(['admin', 'clinic_staff'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  try {
    const { id } = await params
    const body = await request.json()

    const updates: Prisma.AppointmentUpdateInput = {}
    if (body.status) updates.status = body.status
    if (body.date) updates.date = new Date(`${body.date}T00:00:00`)
    if (body.appointmentTime) updates.appointmentTime = body.appointmentTime
    if (body.message !== undefined) updates.message = body.message

    const previous = await prisma.appointment.findUnique({ where: { id }, select: { status: true } })

    const appointment = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.appointment.update({ where: { id }, data: updates })
      await writeAuditLog({
          userId: actor.userId,
          externalUserId: actor.externalUserId,
          sessionId: actor.sessionId,
          actorRole: actor.role,
          action: 'update',
          resource: 'appointment',
          resourceId: id,
          source: 'admin.appointments',
        }, transaction)
      return updated
    })

    if (body.status && body.status !== previous?.status) {
      await notifyAppointmentStatus(appointment)
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: '無法更新預約' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: AppointmentRouteContext) {
  const actor = await authorizeEhrRequest(['admin', 'clinic_staff'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  try {
    const { id } = await params
    await prisma.$transaction(async (transaction) => {
      await transaction.appointment.delete({ where: { id } })
      await writeAuditLog({
          userId: actor.userId,
          externalUserId: actor.externalUserId,
          sessionId: actor.sessionId,
          actorRole: actor.role,
          action: 'delete',
          resource: 'appointment',
          resourceId: id,
          source: 'admin.appointments',
        }, transaction)
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: '無法刪除預約' }, { status: 500 })
  }
}
