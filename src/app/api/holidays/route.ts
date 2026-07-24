import { NextRequest, NextResponse } from 'next/server'
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type CreateHolidayPayload = {
  date?: string
  name?: string
  isClosed?: boolean
}

const toDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDateOnly = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  if (toDateString(date) !== value) {
    return null
  }

  return date
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const yearParam = searchParams.get('year')

    const where: Prisma.HolidayWhereInput = {}
    if (yearParam) {
      const year = Number(yearParam)
      if (!Number.isInteger(year) || year < 1900 || year > 3000) {
        return NextResponse.json(
          { error: 'year 參數格式錯誤' },
          { status: 400 }
        )
      }

      where.holidayDate = {
        gte: new Date(`${year}-01-01T00:00:00`),
        lt: new Date(`${year + 1}-01-01T00:00:00`),
      }
    }

    const holidays = await prisma.holiday.findMany({
      where,
      orderBy: {
        holidayDate: 'asc',
      },
    })

    return NextResponse.json(holidays)
  } catch (error) {
    console.error('Error fetching holidays:', error)
    return NextResponse.json(
      { error: '無法獲取假日資料' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateHolidayPayload

    const dateText = (body.date || '').trim()
    const name = (body.name || '').trim()
    const isClosed = body.isClosed ?? true

    if (!dateText || !name) {
      return NextResponse.json(
        { error: '缺少必要資訊（date, name）' },
        { status: 400 }
      )
    }

    const holidayDate = parseDateOnly(dateText)
    if (!holidayDate) {
      return NextResponse.json(
        { error: '日期格式錯誤，請使用 YYYY-MM-DD' },
        { status: 400 }
      )
    }

    const holiday = await prisma.holiday.create({
      data: {
        holidayDate,
        name,
        isClosed,
      },
    })

    return NextResponse.json(holiday, { status: 201 })
  } catch (error) {
    console.error('Error creating holiday:', error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: '該日期假日已存在' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: '建立假日失敗，請稍後重試' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = (searchParams.get('id') || '').trim()
    const dateText = (searchParams.get('date') || '').trim()

    if (!id && !dateText) {
      return NextResponse.json(
        { error: '請提供 id 或 date 參數' },
        { status: 400 }
      )
    }

    if (id) {
      await prisma.holiday.delete({
        where: { id },
      })

      return NextResponse.json({ message: '假日已刪除' })
    }

    const holidayDate = parseDateOnly(dateText)
    if (!holidayDate) {
      return NextResponse.json(
        { error: '日期格式錯誤，請使用 YYYY-MM-DD' },
        { status: 400 }
      )
    }

    await prisma.holiday.delete({
      where: { holidayDate },
    })

    return NextResponse.json({ message: '假日已刪除' })
  } catch (error) {
    console.error('Error deleting holiday:', error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: '找不到要刪除的假日資料' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: '刪除假日失敗，請稍後重試' },
      { status: 500 }
    )
  }
}
