import { NextResponse } from 'next/server'

export async function GET() {
  const res = NextResponse.json({ ok: true })
  // set demo cookie valid for 1 hour
  res.cookies.set('clinic_demo', 'admin', { path: '/', httpOnly: false, maxAge: 60 * 60 })
  return res
}

export async function POST() {
  return GET()
}
