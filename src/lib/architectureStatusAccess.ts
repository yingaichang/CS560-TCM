import 'server-only'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'

// Share one role lookup between the admin layout and page within each request.
// Match EHR authorization: Clerk metadata takes precedence over the database role.
export const canViewArchitectureStatus = cache(async (): Promise<boolean> => {
  const { userId } = await auth()
  if (!userId) return false

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const email = user.primaryEmailAddress?.emailAddress
  if (!email) return false

  const metadataRole = user.publicMetadata.role
  if (typeof metadataRole === 'string') return metadataRole === 'admin'

  const appUser = await prisma.user.findUnique({ where: { email }, select: { role: true } })
  return appUser?.role === 'admin'
})
