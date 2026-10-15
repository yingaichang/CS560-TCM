import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { CHECKIN_GRANT_TTL_MS, getTodayRange } from '@/lib/kioskVerification'
import { writeAuditLog } from '@/lib/auditLog'

const prisma = new PrismaClient()

// Performs the actual check-in. Requires the appointment to have been
// verified (via /api/kiosk/verify) within the last few minutes, so this
// cannot be called without prior verification.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const appointmentId = String(body.checkinToken || '')

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'expired', message: '報到逾時，請重新開始。' },
        { status: 410 }
      )
    }

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } })
    if (!appointment) {
      return NextResponse.json(
        { error: 'not_found', message: '找不到此預約，請洽櫃檯協助。' },
        { status: 404 }
      )
    }

    if (
      !appointment.verifiedForCheckinAt ||
      Date.now() - appointment.verifiedForCheckinAt.getTime() > CHECKIN_GRANT_TTL_MS
    ) {
      return NextResponse.json(
        { error: 'expired', message: '報到逾時，請重新開始。' },
        { status: 410 }
      )
    }

    const { start, end } = getTodayRange()
    if (appointment.date < start || appointment.date > end) {
      return NextResponse.json(
        { error: 'not_today', message: '此預約不是今天的預約，請洽櫃檯協助。' },
        { status: 400 }
      )
    }

    if (appointment.checkedIn) {
      return NextResponse.json(
        { error: 'already_checked_in', message: '此預約已完成報到。' },
        { status: 409 }
      )
    }

    // The checkedIn: false guard makes this a no-op (0 rows) if a concurrent
    // request already checked the patient in, preventing duplicate check-ins.
    const checkinResult = await prisma.$transaction(async (transaction) => {
      const result = await transaction.appointment.updateMany({
        where: { id: appointment.id, checkedIn: false },
        data: { checkedIn: true, checkedInAt: new Date(), verifiedForCheckinAt: null, status: 'checked_in' },
      })

      if (result.count === 0) return { count: 0, checkedInAt: null }

      const updated = await transaction.appointment.findUnique({ where: { id: appointment.id }, select: { checkedInAt: true } })
      await writeAuditLog({
          action: 'check_in',
          resource: 'appointment_checkin',
          resourceId: appointment.id,
          actorRole: 'kiosk',
          source: 'kiosk.checkin',
        }, transaction)

      return { count: result.count, checkedInAt: updated?.checkedInAt ?? null }
    })

    if (checkinResult.count === 0) {
      return NextResponse.json(
        { error: 'already_checked_in', message: '此預約已完成報到。' },
        { status: 409 }
      )
    }

    return NextResponse.json({ success: true, checkedInAt: checkinResult.checkedInAt })
  } catch (error) {
    console.error('Error during kiosk check-in:', error)
    return NextResponse.json(
      { error: '系統發生錯誤，請洽櫃檯協助。' },
      { status: 500 }
    )
  }
}

