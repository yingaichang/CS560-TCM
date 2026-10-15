import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { MAX_VERIFICATION_ATTEMPTS } from '@/lib/kioskVerification'
import { getDoctorName } from '@/lib/doctorDirectory'
import { writeAuditLog } from '@/lib/auditLog'

const prisma = new PrismaClient()

// Confirms the code sent to the patient's phone, then returns just enough
// appointment info to show the check-in confirmation screen. This step
// never checks the patient in by itself.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const appointmentId = String(body.token || '')
    const code = normalizeCode(body.code)

    if (!appointmentId || code.length !== 6) {
      return NextResponse.json(
        { error: '請輸入 6 碼驗證碼。' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } })
    if (!appointment) {
      return NextResponse.json(
        { error: 'not_found', message: '找不到此預約，請洽櫃檯協助。' },
        { status: 404 }
      )
    }

    if (appointment.checkedIn) {
      return NextResponse.json(
        { error: 'already_checked_in', message: '此預約已完成報到。' },
        { status: 409 }
      )
    }

    if (
      !appointment.verificationCode ||
      !appointment.verificationCodeExpiresAt ||
      appointment.verificationCodeExpiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: 'invalid_or_expired', message: '驗證碼已逾時，請重新開始報到。' },
        { status: 410 }
      )
    }

    if (appointment.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { verificationCode: null, verificationCodeExpiresAt: null },
      })
      await writeAuditLog({
        action: 'verification_blocked',
        resource: 'appointment_checkin',
        resourceId: appointment.id,
        actorRole: 'kiosk',
        source: 'kiosk.verify',
        outcome: 'denied',
      })
      return NextResponse.json(
        { error: 'too_many_attempts', message: '驗證失敗次數過多，請洽櫃檯協助。' },
        { status: 410 }
      )
    }

    if (code !== appointment.verificationCode) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { verificationAttempts: { increment: 1 } },
      })
      await writeAuditLog({
        action: 'verification_failed',
        resource: 'appointment_checkin',
        resourceId: appointment.id,
        actorRole: 'kiosk',
        source: 'kiosk.verify',
        outcome: 'denied',
      })
      return NextResponse.json(
        { error: 'incorrect_code', message: '驗證碼不正確，請再試一次。' },
        { status: 401 }
      )
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        verificationCode: null,
        verificationCodeExpiresAt: null,
        verificationAttempts: 0,
        verifiedForCheckinAt: new Date(),
      },
    })
    await writeAuditLog({
      action: 'verification_succeeded',
      resource: 'appointment_checkin',
      resourceId: appointment.id,
      actorRole: 'kiosk',
      source: 'kiosk.verify',
    })

    return NextResponse.json({
      checkinToken: appointment.id,
      appointment: {
        patientId: appointment.id,
        name: appointment.name,
        appointmentTime: appointment.appointmentTime,
        doctorName: getDoctorName(appointment.doctorId),
        service: appointment.service,
      },
    })
  } catch (error) {
    console.error('Error during kiosk verification:', error)
    return NextResponse.json(
      { error: '系統發生錯誤，請洽櫃檯協助。' },
      { status: 500 }
    )
  }
}

const normalizeCode = (value: unknown) => String(value ?? '').replace(/\D/g, '')

