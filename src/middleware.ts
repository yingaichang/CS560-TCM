import { clerkMiddleware } from '@clerk/nextjs/server'

const protectedRoots = ['/admin', '/clinic-management', '/ehr']

export default clerkMiddleware(async (auth, request) => {
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