import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeAuditLog } from '@/lib/auditLog'

const prisma = new PrismaClient()

type HolidaySeedItem = {
  date: string
  name: string
}

const toDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const observedHoliday = (date: Date) => {
  const observed = new Date(date)
  if (date.getDay() === 6) {
    observed.setDate(date.getDate() - 1)
  } else if (date.getDay() === 0) {
    observed.setDate(date.getDate() + 1)
  }
  return observed
}

const nthWeekdayOfMonth = (
  year: number,
  month: number,
  weekday: number,
  nth: number
) => {
  const firstDay = new Date(year, month, 1)
  const firstWeekdayOffset = (7 + weekday - firstDay.getDay()) % 7
  return new Date(year, month, 1 + firstWeekdayOffset + (nth - 1) * 7)
}

const lastWeekdayOfMonth = (year: number, month: number, weekday: number) => {
  const lastDay = new Date(year, month + 1, 0)
  const diff = (7 + lastDay.getDay() - weekday) % 7
  return new Date(year, month, lastDay.getDate() - diff)
}

const getUsFederalHolidays = (year: number): HolidaySeedItem[] => {
  const holidays: HolidaySeedItem[] = [
    { date: toDateString(observedHoliday(new Date(year, 0, 1))), name: "New Year's Day" },
    { date: toDateString(nthWeekdayOfMonth(year, 0, 1, 3)), name: 'Martin Luther King Jr. Day' },
    { date: toDateString(nthWeekdayOfMonth(year, 1, 1, 3)), name: "Washington's Birthday" },
    { date: toDateString(lastWeekdayOfMonth(year, 4, 1)), name: 'Memorial Day' },
    { date: toDateString(observedHoliday(new Date(year, 5, 19))), name: 'Juneteenth National Independence Day' },
    { date: toDateString(observedHoliday(new Date(year, 6, 4))), name: 'Independence Day' },
    { date: toDateString(nthWeekdayOfMonth(year, 8, 1, 1)), name: 'Labor Day' },
    { date: toDateString(nthWeekdayOfMonth(year, 9, 1, 2)), name: 'Columbus Day' },
    { date: toDateString(observedHoliday(new Date(year, 10, 11))), name: 'Veterans Day' },
    { date: toDateString(nthWeekdayOfMonth(year, 10, 4, 4)), name: 'Thanksgiving Day' },
    { date: toDateString(observedHoliday(new Date(year, 11, 25))), name: 'Christmas Day' },
  ]

  const deduped = new Map<string, HolidaySeedItem>()
  for (const holiday of holidays) {
    if (!deduped.has(holiday.date)) {
      deduped.set(holiday.date, holiday)
    }
  }

  return Array.from(deduped.values())
}

export async function POST(request: NextRequest) {
  try {
    const yearParam = request.nextUrl.searchParams.get('year')
    const year = Number(yearParam)

    if (!yearParam || !Number.isInteger(year) || year < 1900 || year > 3000) {
      return NextResponse.json(
        { error: '請提供有效 year 參數（例如 ?year=2026）' },
        { status: 400 }
      )
    }

    const holidayItems = getUsFederalHolidays(year)

    const start = new Date(`${year}-01-01T00:00:00`)
    const end = new Date(`${year + 1}-01-01T00:00:00`)

    const existing = await prisma.holiday.findMany({
      where: {
        holidayDate: {
          gte: start,
          lt: end,
        },
      },
      select: {
        holidayDate: true,
      },
    })

    const existingSet = new Set(existing.map((item) => toDateString(item.holidayDate)))
    const toCreate = holidayItems.filter((item) => !existingSet.has(item.date))

    await prisma.$transaction(async (transaction) => {
      if (toCreate.length > 0) {
        await transaction.holiday.createMany({
          data: toCreate.map((item) => ({
            holidayDate: new Date(`${item.date}T00:00:00`),
            name: item.name,
            isClosed: true,
          })),
        })
      }
      await writeAuditLog({
        serviceId: 'holiday-api',
        action: 'seed',
        resource: 'holiday_catalog',
        actorRole: 'system',
        source: 'system.holiday-seed',
        module: 'holidays',
        outcome: toCreate.length ? 'success' : 'no_change',
        summary: `Holiday catalog seeded; ${toCreate.length} records created`,
      }, transaction)
    })

    return NextResponse.json(
      {
        year,
        totalGenerated: holidayItems.length,
        created: toCreate.length,
        skipped: holidayItems.length - toCreate.length,
        holidays: holidayItems,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error seeding holidays:', error)
    return NextResponse.json(
      { error: '匯入假日失敗，請稍後重試' },
      { status: 500 }
    )
  }
}
