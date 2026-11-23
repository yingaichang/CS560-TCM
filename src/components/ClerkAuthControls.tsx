'use client'

import {
  SignOutButton,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useLocalClerkBypass } from '@/components/LocalClerkBypassProvider'

export default function ClerkAuthControls({ className = '' }: { className?: string }) {
  const localClerkBypass = useLocalClerkBypass()
  if (localClerkBypass) return null

  return <AuthenticatedClerkAuthControls className={className} />
}

function AuthenticatedClerkAuthControls({ className = '' }: { className?: string }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const pathname = usePathname()

  if (!isLoaded) return null

  const isAdmin = user?.publicMetadata.role === 'admin'
  const isOnAdminPortal = pathname === '/admin' || pathname.startsWith('/admin/')

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!isSignedIn ? <>
        <Link href="/sign-in" className="rounded-full border border-primary/20 bg-white px-3 py-2 text-xs font-semibold text-primary">登入</Link>
        <Link href="/sign-up" className="hidden rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white sm:inline-flex">註冊</Link>
      </> : <>
        {isAdmin && (
          <Link href={isOnAdminPortal ? '/' : '/admin'} className="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white">
            {isOnAdminPortal ? '返回首頁' : '管理後台'}
          </Link>
        )}
        <UserButton />
        <span className="hidden text-xs text-ink/70 md:inline">{user?.fullName}</span>
        <SignOutButton redirectUrl="/">
          <button type="button" className="rounded-full border border-primary/20 bg-white px-3 py-2 text-xs font-semibold text-primary">登出</button>
        </SignOutButton>
      </>}
    </div>
  )
}