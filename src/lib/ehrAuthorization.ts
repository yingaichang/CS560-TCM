import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

export type EhrRole = 'admin' | 'clinic_staff' | 'provider' | 'billing_staff'

const clinicalRoles: EhrRole[] = ['admin', 'clinic_staff', 'provider']
const allEhrRoles: EhrRole[] = [...clinicalRoles, 'billing_staff']

async function recordAccessDenied({
  userId,
  externalUserId,
  sessionId,
  role,
  resource,
}: {
  userId?: string | null
  externalUserId?: string | null
  sessionId?: string | null
  role: string
  resource: string
}) {
  try {
    await writeAuditLog({
      userId,
      externalUserId,
      sessionId,
      serviceId: userId || externalUserId ? null : 'authorization-service',
      actorRole: role,
      action: 'access_denied',
      resource,
      source: 'auth.authorization',
      module: 'auth',
      outcome: 'denied',
      summary: 'Protected access request denied',
    })
  } catch (error) {
    console.error('Unable to record access denial:', error)
  }
}

export async function authorizeEhrRequest(allowedRoles: EhrRole[] = clinicalRoles) {
  const { userId, sessionId } = await auth()
  if (!userId) {
    await recordAccessDenied({ sessionId, role: 'anonymous', resource: 'ehr_api' })
    return null
  }

  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(userId)
  const email = clerkUser.primaryEmailAddress?.emailAddress
  if (!email) {
    await recordAccessDenied({ externalUserId: clerkUser.id, sessionId, role: 'unmapped', resource: 'ehr_api' })
    return null
  }

  const appUser = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } })
  const metadataRole = clerkUser.publicMetadata.role
  const roleValue = typeof metadataRole === 'string' ? metadataRole : appUser?.role
  if (!roleValue || !allEhrRoles.includes(roleValue as EhrRole) || !allowedRoles.includes(roleValue as EhrRole)) {
    await recordAccessDenied({
      userId: appUser?.id,
      externalUserId: clerkUser.id,
      sessionId,
      role: roleValue || 'unassigned',
      resource: 'ehr_api',
    })
    return null
  }

  return {
    role: roleValue as EhrRole,
    userId: appUser?.id ?? null,
    externalUserId: clerkUser.id,
    sessionId: sessionId ?? null,
  }
}

export async function authorizeAuditLogAccess() {
  const actor = await authorizeEhrRequest(['admin', 'clinic_staff'])
  if (!actor) return null
  if (actor.role === 'admin') return actor
  if (!actor.userId) {
    await recordAccessDenied({
      externalUserId: actor.externalUserId,
      sessionId: actor.sessionId,
      role: actor.role,
      resource: 'audit_log',
    })
    return null
  }

  const staff = await prisma.user.findUnique({
    where: { id: actor.userId },
    select: { canViewAuditLogs: true },
  })

  if (staff?.canViewAuditLogs) return actor
  await recordAccessDenied({
    userId: actor.userId,
    externalUserId: actor.externalUserId,
    sessionId: actor.sessionId,
    role: actor.role,
    resource: 'audit_log',
  })
  return null
}