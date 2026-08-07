import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = ['/admin', '/clinic-management']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const matches = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (!matches) return NextResponse.next()

  // Allow demo bypass via cookie for beta face-recognition flow
  const demo = request.cookies.get('clinic_demo')?.value
  if (demo === 'admin' || demo === 'clinic_staff') {
    return NextResponse.next()
  }

  const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(url)
  }

  const role = (token as any).role
  if (role === 'admin' || role === 'clinic_staff') {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = '/'
  url.searchParams.set('error', 'forbidden')
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin/:path*', '/clinic-management/:path*'],
}
