import { NextRequest, NextResponse } from 'next/server'
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

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
    const body = await request.json()
    const firstName = (body.firstName || '').trim()
    const middleName = (body.middleName || '').trim()
    const lastName = (body.lastName || '').trim()
    const phone = String(body.phone || '').replace(/\D/g, '')
    const email = (body.email || '').trim()
    const service = (body.service || '').trim()
    const date = (body.date || '').trim()
    const doctor = (body.doctor || '').trim()
    const time = (body.time || '').trim()
    const message = ((body.message || body.questionnaire) || '').trim()

    if (!firstName || !lastName || !phone || !date || !service || !doctor || !time) {
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

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

    const appointmentCount = await prisma.appointment.count({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    })

    const appointmentNumber = `YA-${date.replace(/-/g, '')}-${String(appointmentCount + 1).padStart(3, '0')}`

    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ')
    const detailLines = [
      `Doctor: ${doctor}`,
      `Time: ${time}`,
      message ? `Notes: ${message}` : '',
    ].filter(Boolean)

    const appointment = await prisma.appointment.create({
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

    return NextResponse.json({
      ...appointment,
      appointmentNumber,
    }, { status: 201 })
  } catch (error) {
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
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const takeParam = Number(searchParams.get('take') || '10')
    const skipParam = Number(searchParams.get('skip') || '0')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: skipParam,
      take: Math.min(Math.max(1, takeParam), 100),
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: '無法獲取預約資訊' },
      { status: 500 }
    )
  }
}
