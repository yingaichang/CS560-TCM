import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeAuditLogAccess } from '@/lib/ehrAuthorization'
import { writeAuditLog } from '@/lib/auditLog'

function parseDate(value: string | null, endOfDay = false) {
  if (!value) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = new Date(endOfDay ? `${value}T23:59:59.999Z` : `${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export async function GET(request: NextRequest) {
  const actor = await authorizeAuditLogAccess()
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const params = request.nextUrl.searchParams
  const takeValue = Number(params.get('take') ?? 50)
  const skipValue = Number(params.get('skip') ?? 0)
  const take = Number.isInteger(takeValue) ? Math.max(1, Math.min(100, takeValue)) : 50
  const skip = Number.isInteger(skipValue) ? Math.max(0, skipValue) : 0
  const from = parseDate(params.get('from'))
  const to = parseDate(params.get('to'), true)

  if (from === undefined || to === undefined) {
    return NextResponse.json({ error: 'Invalid date filter' }, { status: 400 })
  }

  const action = (params.get('action') ?? '').trim().slice(0, 80)
  const resource = (params.get('resource') ?? '').trim().slice(0, 80)
  const source = (params.get('source') ?? '').trim().slice(0, 80)
  const actorRole = (params.get('actorRole') ?? '').trim().slice(0, 40)

  await writeAuditLog({
    userId: actor.userId,
    externalUserId: actor.externalUserId,
    sessionId: actor.sessionId,
    actorRole: actor.role,
    action: 'read',
    resource: 'audit_log',
    source: 'admin.audit-logs',
  })

  const where = {
    ...(action ? { action: { contains: action } } : {}),
    ...(resource ? { resource: { contains: resource } } : {}),
    ...(source ? { source: { contains: source } } : {}),
    ...(actorRole ? { actorRole } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
  }

  const [events, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
      select: {
        id: true,
        userId: true,
        externalUserId: true,
        serviceId: true,
        action: true,
        resource: true,
        resourceId: true,
        module: true,
        actorRole: true,
        source: true,
        outcome: true,
        sessionId: true,
        summary: true,
        previousHash: true,
        entryHash: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.count({ where }),
  ])

  return NextResponse.json({ events, total, take, skip })
}