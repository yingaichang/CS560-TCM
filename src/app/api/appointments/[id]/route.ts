import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const appointment = await prisma.appointment.findUnique({ where: { id } })
    if (!appointment) return NextResponse.json({ error: '找不到預約' }, { status: 404 })
    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json({ error: '無法獲取預約' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    const updates: any = {}
    if (body.status) updates.status = body.status
    if (body.date) updates.date = new Date(`${body.date}T00:00:00`)
    if (body.appointmentTime) updates.appointmentTime = body.appointmentTime
    if (body.message !== undefined) updates.message = body.message

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: '無法更新預約' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    await prisma.appointment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: '無法刪除預約' }, { status: 500 })
  }
}
