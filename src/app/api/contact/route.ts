import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: '缺少必要資訊' },
        { status: 400 }
      )
    }

    // Create contact message in database
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'new',
      },
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact message:', error)
    return NextResponse.json(
      { error: '發送訊息失敗，請稍後重試' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: '無法獲取聯絡資訊' },
      { status: 500 }
    )
  }
}
