import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { isLocalClerkBypassEnabled } from '@/lib/localClerkBypass'

const protectedRoots = ['/admin', '/clinic-management', '/ehr']

const localBypassMiddleware = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname
  const isApiRoute = pathname === '/api' || pathname.startsWith('/api/') || pathname === '/trpc' || pathname.startsWith('/trpc/')
  if (isApiRoute) {
    return NextResponse.json(
      { error: 'API routes are unavailable while the local Clerk UI bypass is enabled.' },
      { status: 503 },
    )
  }

  const clerkOnlyRoots = [...protectedRoots, '/sign-in', '/sign-up']
  const requiresClerk = clerkOnlyRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`))
  if (requiresClerk) return new NextResponse('Not Found', { status: 404 })

  return NextResponse.next()
}

export default isLocalClerkBypassEnabled
  ? localBypassMiddleware
  : clerkMiddleware(async (auth, request) => {
      const pathname = request.nextUrl.pathname
      const requiresAuthentication = protectedRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`))

      if (requiresAuthentication) {
        await auth.protect()
      }
    })

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}