import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) return NextResponse.json({ user: null }, { status: 200 })

    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) return NextResponse.json({ user: null }, { status: 200 })

    const payload = jwt.verify(token, secret) as any
    const userId = payload?.userId
    if (!userId) return NextResponse.json({ user: null }, { status: 200 })

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true } })
    return NextResponse.json({ user }, { status: 200 })
  } catch (err) {
    console.error('session error', err)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
