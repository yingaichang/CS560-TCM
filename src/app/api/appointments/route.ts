import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { writeAuditLog } from '@/lib/auditLog'
import { notifyNewAppointment, appointmentNotificationKey } from '@/lib/appointmentMail'
import { CommandError, lockSoftwareWrites } from '@/lib/softwareCommands'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const services = [
  '中醫內科調理',
  '婦科調理',
  '骨傷科',
  '針灸',
  '推拿',
  '拔罐',
  '艾灸',
]

const doctors = [
  '李明智醫師',
  '王芳妤醫師',
  '張瑋翔醫師',
  '陳雅琪醫師',
]

const doctorIdMap: Record<string, string> = {
  '李明智醫師': 'doctor-li-ming-zhi',
  '王芳妤醫師': 'doctor-wang-fang-yu',
  '張瑋翔醫師': 'doctor-zhang-wei-xiang',
  '陳雅琪醫師': 'doctor-chen-ya-qi',
}

const timeSlots = [
  '09:00',
  '09:30',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '15:30',
  '16:00',
  '17:00',
]

const toDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseAppointmentDate = (dateValue: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return null
  }

  const date = new Date(`${dateValue}T12:00:00`)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  if (toDateString(date) !== dateValue) return null

  return date
}

const isBusinessDate = (date: Date) => {
  const day = date.getDay()
  if (day === 0 || day === 6) {
    return false
  }

  const today = toDateString(new Date())
  return toDateString(date) >= today
}

export async function POST(request: NextRequest) {
  try {
    let raw: unknown
    try { raw = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }) }
    const parsed = z.object({ firstName: z.string().trim().min(1).max(80), middleName: z.string().trim().max(80).optional(), lastName: z.string().trim().min(1).max(80), phone: z.string().max(40), email: z.email().max(254), service: z.string().max(100), date: z.iso.date(), doctor: z.string().max(100), time: z.string().max(10), message: z.string().max(3000).optional() }).safeParse(raw)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid appointment fields.' }, { status: 400 })
    const body = parsed.data
    const firstName = (body.firstName || '').trim()
    const middleName = (body.middleName || '').trim()
    const lastName = (body.lastName || '').trim()
    const phone = String(body.phone || '').replace(/\D/g, '')
    const email = (body.email || '').trim()
    const service = (body.service || '').trim()
    const date = (body.date || '').trim()
    const doctor = (body.doctor || '').trim()
    const time = (body.time || '').trim()
    const message = (body.message || '').trim()

    if (!firstName || !lastName || !phone || !email || !date || !service || !doctor || !time) {
      return NextResponse.json(
        { error: '缺少必要資訊' },
        { status: 400 }
      )
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: '手機號碼需為 10 碼數字' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email 格式不正確' },
        { status: 400 }
      )
    }

    if (!services.includes(service)) {
      return NextResponse.json(
        { error: '診療項目不正確' },
        { status: 400 }
      )
    }

    if (!doctors.includes(doctor) || !doctorIdMap[doctor]) {
      return NextResponse.json(
        { error: '醫生選項不正確' },
        { status: 400 }
      )
    }

    if (!timeSlots.includes(time)) {
      return NextResponse.json(
        { error: '預約時間需在 9:00 AM 到 5:00 PM 之間' },
        { status: 400 }
      )
    }

    const appointmentDate = parseAppointmentDate(date)
    if (!appointmentDate || !isBusinessDate(appointmentDate)) {
      return NextResponse.json(
        { error: '預約日期僅可為平日且不可為過去日期' },
        { status: 400 }
      )
    }

    const dayStart = new Date(`${date}T00:00:00`)
    const dayEnd = new Date(`${date}T23:59:59.999`)

    const holiday = await prisma.holiday.findFirst({
      where: {
        isClosed: true,
        holidayDate: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    })

    if (holiday) {
      return NextResponse.json(
        { error: '預約日期為假日，請選擇其他日期' },
        { status: 400 }
      )
    }

    const doctorId = doctorIdMap[doctor]

    const existingAppointment = await prisma.appointment.findUnique({
      where: {
        doctorId_date_appointmentTime: {
          doctorId,
          date: dayStart,
          appointmentTime: time,
        },
      },
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: '此醫師於該日期與時段已被預約，請選擇其他時間。' },
        { status: 409 }
      )
    }

    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ')
    const detailLines = [
      `Doctor: ${doctor}`,
      `Time: ${time}`,
      message ? `Notes: ${message}` : '',
    ].filter(Boolean)

    const appointment = await prisma.$transaction(async (transaction) => {
      await lockSoftwareWrites(transaction)
      const closed = await transaction.holiday.findFirst({ where: { isClosed: true, holidayDate: { gte: dayStart, lte: dayEnd } }, select: { id: true } })
      if (closed) throw new CommandError('The selected date is closed.')
      const created = await transaction.appointment.create({
        data: {
          name: fullName,
          email,
          phone,
          doctorId,
          date: dayStart,
          appointmentTime: time,
          service,
          message: detailLines.join('\n') || null,
          status: 'pending',
        },
      })

      await writeAuditLog({
          action: 'create',
          resource: 'appointment',
          resourceId: created.id,
          actorRole: 'public',
          source: 'public.booking',
        }, transaction)

      return created
    })

    await notifyNewAppointment(appointment)

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    if (error instanceof CommandError) return NextResponse.json({ error: error.message }, { status: error.status })
    console.error('Error creating appointment:', error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: '此醫師於該日期與時段已被預約，請選擇其他時間。' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: '建立預約失敗，請稍後重試' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const actor = await authorizeEhrRequest(['admin', 'clinic_staff'])
    if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const dateParam = searchParams.get('date')
    const takeParam = Number(searchParams.get('take'))
    const skipParam = Number(searchParams.get('skip'))

    const where: Prisma.AppointmentWhereInput = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (dateParam) {
      const dayStart = new Date(`${dateParam}T00:00:00`)
      const dayEnd = new Date(`${dateParam}T23:59:59.999`)
      where.date = { gte: dayStart, lte: dayEnd }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number.isInteger(takeParam) && takeParam > 0 ? Math.min(takeParam, 100) : 10,
      skip: Number.isFinite(skipParam) && skipParam > 0 ? skipParam : 0,
      include: {
        patient: { select: { id: true, patientId: true, firstName: true, lastName: true } },
      },
    })

    await writeAuditLog({
      userId: actor.userId,
      externalUserId: actor.externalUserId,
      sessionId: actor.sessionId,
      actorRole: actor.role,
      action: 'read_list',
      resource: 'appointment',
      source: 'admin.appointments',
    })

    const receipts = await prisma.auditWebhookReceipt.findMany({ where: { id: { in: appointments.flatMap(a => ['admin', 'patient'].map(kind => appointmentNotificationKey(a, kind as 'admin' | 'patient'))) } } })
    const byId = new Map(receipts.map(r => [r.id, r.provider]))
    return NextResponse.json(appointments.map(a => ({ ...a, notifications: Object.fromEntries(['admin', 'patient'].map(kind => {
      const saved = byId.get(appointmentNotificationKey(a, kind as 'admin' | 'patient'))
      let delivery = { state: 'not_attempted', attempts: 0 }
      try { if (saved) delivery = JSON.parse(saved) } catch { delivery = { state: 'unknown', attempts: 0 } }
      return [kind, delivery]
    })) })))
  } catch (error) {
    console.error('Error fetching appointments:', error)
    const details = process.env.NODE_ENV === 'development'
      ? error instanceof Error ? error.message : String(error)
      : undefined
    return NextResponse.json(
      { error: '無法獲取預約資訊', ...(details ? { details } : {}) },
      { status: 500 }
    )
  }
}
