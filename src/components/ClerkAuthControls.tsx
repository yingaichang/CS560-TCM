'use client'

import {
  SignOutButton,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

export default function ClerkAuthControls({ className = '' }: { className?: string }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  if (!isLoaded) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!isSignedIn ? <>
        <Link href="/sign-in" className="rounded-full border border-primary/20 bg-white px-3 py-2 text-xs font-semibold text-primary">Sign in</Link>
        <Link href="/sign-up" className="hidden rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white sm:inline-flex">Sign up</Link>
      </> : <>
        <UserButton />
        <span className="hidden text-xs text-ink/70 md:inline">{user?.fullName}</span>
        <SignOutButton redirectUrl="/">
          <button type="button" className="rounded-full border border-primary/20 bg-white px-3 py-2 text-xs font-semibold text-primary">Sign out</button>
        </SignOutButton>
      </>}
    </div>
  )
}