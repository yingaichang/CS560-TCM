import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { writeAuditLog } from '@/lib/auditLog'
import { notifyAppointmentStatus } from '@/lib/appointmentMail'
import { prisma } from '@/lib/prisma'
import { ensureEncounterForCheckedInAppointment } from '@/lib/checkinEncounter'
import { lockSoftwareWrites } from '@/lib/softwareCommands'

type AppointmentRouteContext = {
  params: Promise<{ id: string }>
}

const appointmentUpdate = z.object({
  expectedUpdatedAt: z.iso.datetime().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'waitlist', 'no_show']).optional(),
  date: z.iso.date().optional(),
  appointmentTime: z.string().regex(/^(09:00|09:30|10:00|11:00|12:00|13:00|14:00|15:00|15:30|16:00|17:00)$/).optional(),
  message: z.string().trim().max(3000).nullable().optional(),
  patientId: z.string().cuid().nullable().optional(),
}).strict().refine((value) => Object.keys(value).length > 0)

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
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const parsed = appointmentUpdate.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid appointment update' }, { status: 400 })
    const data = parsed.data

    const result = await prisma.$transaction(async (transaction) => {
      await lockSoftwareWrites(transaction)
      const current = await transaction.appointment.findUnique({
        where: { id },
        include: { encounter: { select: { id: true, status: true } } },
      })
      if (!current) return { error: 'Appointment not found', status: 404 as const }
      if (data.expectedUpdatedAt && current.updatedAt.toISOString() !== data.expectedUpdatedAt) return { error: 'Appointment changed. Reload before saving.', status: 409 as const }
      if (data.status === 'completed' && current.encounter?.status !== 'completed') return { error: 'Complete the linked clinical encounter first.', status: 409 as const }
      if (data.status === 'no_show' && current.checkedIn) return { error: 'A checked-in patient cannot be marked absent.', status: 409 as const }

      if (data.patientId !== undefined && data.patientId !== current.patientId) {
        if (current.encounter && current.patientId !== data.patientId) {
          return { error: 'A linked patient cannot be changed after an encounter exists.', status: 409 as const }
        }
        if (data.patientId) {
          const patient = await transaction.patient.findUnique({ where: { id: data.patientId }, select: { id: true } })
          if (!patient) return { error: 'Patient not found', status: 404 as const }
        }
      }

      const nextDate = data.date ? new Date(`${data.date}T00:00:00`) : current.date
      const nextTime = data.appointmentTime ?? current.appointmentTime
      const scheduleChanged = nextDate.getTime() !== current.date.getTime() || nextTime !== current.appointmentTime
      if (scheduleChanged) {
        if (current.checkedIn) return { error: 'A checked-in appointment cannot be rescheduled.', status: 409 as const }
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (nextDate.getTime() < today.getTime() || nextDate.getDay() === 0 || nextDate.getDay() === 6) {
          return { error: 'Appointments must be scheduled for a future weekday.', status: 400 as const }
        }
        const dayEnd = new Date(nextDate)
        dayEnd.setHours(23, 59, 59, 999)
        const holiday = await transaction.holiday.findFirst({
          where: { isClosed: true, holidayDate: { gte: nextDate, lte: dayEnd } },
          select: { id: true },
        })
        if (holiday) return { error: 'The selected date is closed.', status: 409 as const }
        const conflict = await transaction.appointment.findFirst({
          where: {
            id: { not: id },
            doctorId: current.doctorId,
            date: nextDate,
            appointmentTime: nextTime,
          },
          select: { id: true },
        })
        if (conflict) return { error: 'This provider already has an appointment at that time.', status: 409 as const }
      }

      const updates: Prisma.AppointmentUpdateInput = {}
      if (data.status !== undefined) updates.status = data.status
      if (data.date !== undefined) updates.date = nextDate
      if (data.appointmentTime !== undefined) updates.appointmentTime = nextTime
      if (data.message !== undefined) updates.message = data.message
      if (data.patientId !== undefined) {
        updates.patient = data.patientId ? { connect: { id: data.patientId } } : { disconnect: true }
      }

      const updated = await transaction.appointment.update({
        where: { id },
        data: updates,
        include: { patient: { select: { id: true, patientId: true, firstName: true, lastName: true } } },
      })
      const auditContext = {
        userId: actor.userId,
        externalUserId: actor.externalUserId,
        sessionId: actor.sessionId,
        actorRole: actor.role,
        resource: 'appointment',
        resourceId: id,
        source: 'admin.appointments',
      }

      if (data.patientId !== undefined && data.patientId !== current.patientId) {
        await writeAuditLog({
          ...auditContext,
          patientId: data.patientId,
          action: data.patientId ? 'link_patient' : 'unlink_patient',
          summary: data.patientId ? 'Patient linked to appointment' : 'Patient unlinked from appointment',
        }, transaction)
      }
      if (data.status !== undefined || scheduleChanged || data.message !== undefined) {
        await writeAuditLog({
          ...auditContext,
          patientId: updated.patientId,
          action: 'update',
        }, transaction)
      }

      if (updated.checkedIn && updated.patientId) {
        await ensureEncounterForCheckedInAppointment(transaction, {
          id: updated.id,
          patientId: updated.patientId,
          date: updated.date,
          service: updated.service,
          message: updated.message,
        })
      }

      return { appointment: updated, previousStatus: current.status }
    })

    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
    if (data.status && data.status !== result.previousStatus) {
      await notifyAppointmentStatus(result.appointment)
    }

    return NextResponse.json(result.appointment)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'This provider already has an appointment at that time.' }, { status: 409 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Appointment or patient not found.' }, { status: 404 })
    }
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'Unable to update appointment.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: AppointmentRouteContext) {
  const actor = await authorizeEhrRequest(['admin', 'clinic_staff'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  try {
    const { id } = await params
    await prisma.$transaction(async (transaction) => {
      const appointment = await transaction.appointment.findUnique({ where: { id }, select: { patientId: true } })
      if (!appointment) throw new Error('APPOINTMENT_NOT_FOUND')
      await transaction.appointment.delete({ where: { id } })
      await writeAuditLog({
        userId: actor.userId,
        externalUserId: actor.externalUserId,
        sessionId: actor.sessionId,
        patientId: appointment.patientId,
        actorRole: actor.role,
        action: 'delete',
        resource: 'appointment',
        resourceId: id,
        source: 'admin.appointments',
      }, transaction)
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'APPOINTMENT_NOT_FOUND') {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 })
    }
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: 'Unable to delete appointment.' }, { status: 500 })
  }
}
