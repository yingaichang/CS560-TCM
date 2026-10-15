import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeAuditLog } from '@/lib/auditLog'
import {
  VERIFICATION_TTL_MS,
  generateVerificationCode,
  getTodayRange,
  maskPhone,
  normalizeDigits,
  sendVerificationCode,
} from '@/lib/kioskVerification'

const prisma = new PrismaClient()

// Looks up today's appointment by phone number or last-4 SSN and sends a
// verification code to the phone number already on file. No appointment
// details are returned here - only a token to redeem via /api/kiosk/verify.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const method = body.method
    const rawValue = String(body.value || '')

    if (method !== 'phone' && method !== 'ssn') {
      return NextResponse.json(
        { error: '此報到方式目前無法使用，請洽櫃檯協助。' },
        { status: 400 }
      )
    }

    const value = normalizeDigits(rawValue)
    const expectedLength = method === 'phone' ? 10 : 4
    if (value.length !== expectedLength) {
      return NextResponse.json(
        { error: method === 'phone' ? '請輸入 10 碼手機號碼' : '請輸入 4 碼社會安全碼末四碼' },
        { status: 400 }
      )
    }

    const { start, end } = getTodayRange()

    const appointment = await prisma.appointment.findFirst({
      where: {
        date: { gte: start, lte: end },
        status: { not: 'cancelled' },
        ...(method === 'phone' ? { phone: value } : { ssnLast4: value }),
      },
      orderBy: { appointmentTime: 'asc' },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'not_found', message: '找不到今日的預約，請洽櫃檯協助。' },
        { status: 404 }
      )
    }

    if (appointment.checkedIn) {
      return NextResponse.json(
        { error: 'already_checked_in', message: '此預約已完成報到。' },
        { status: 409 }
      )
    }

    if (!appointment.phone) {
      return NextResponse.json(
        { error: 'no_phone_on_file', message: '此預約沒有可用的驗證電話，請洽櫃檯協助。' },
        { status: 409 }
      )
    }

    const code = generateVerificationCode()
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        verificationCode: code,
        verificationCodeExpiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
        verificationAttempts: 0,
      },
    })
    await writeAuditLog({
      action: 'verification_code_requested',
      resource: 'appointment_checkin',
      resourceId: appointment.id,
      actorRole: 'kiosk',
      source: 'kiosk.lookup',
    })
    await sendVerificationCode(appointment.phone, code)

    return NextResponse.json({
      token: appointment.id,
      maskedPhone: maskPhone(appointment.phone),
    })
  } catch (error) {
    console.error('Error during kiosk lookup:', error)
    return NextResponse.json(
      { error: '系統發生錯誤，請洽櫃檯協助。' },
      { status: 500 }
    )
  }
}

