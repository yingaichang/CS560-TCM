import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, date, service, message } = body

    // Validation
    if (!name || !email || !phone || !date || !service) {
      return NextResponse.json(
        { error: '缺少必要資訊' },
        { status: 400 }
      )
    }

    // Create appointment in database
    const appointment = await prisma.appointment.create({
      data: {
        name,
        email,
        phone,
        date: new Date(date),
        service,
        message: message || null,
        status: 'pending',
      },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: '建立預約失敗，請稍後重試' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
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
