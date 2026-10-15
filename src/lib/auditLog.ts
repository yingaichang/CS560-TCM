import { createHash, randomUUID } from 'node:crypto'
import type { Prisma as PrismaTypes } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type AuditEvent = {
  userId?: string | null
  externalUserId?: string | null
  serviceId?: string | null
  patientId?: string | null
  action: string
  resource: string
  resourceId?: string | null
  actorRole: string
  source: string
  module?: string
  sessionId?: string | null
  summary?: string
  outcome?: string
}

type AuditTransaction = PrismaTypes.TransactionClient
const GENESIS_HASH = 'GENESIS'

type HashableAuditEntry = {
  id: string
  createdAt: Date
  userId: string | null
  externalUserId: string | null
  serviceId: string | null
  patientId: string | null
  action: string
  resource: string
  resourceId: string | null
  module: string
  actorRole: string
  source: string
  outcome: string
  sessionId: string | null
  summary: string
  previousHash: string
}

type StoredAuditEntry = Omit<HashableAuditEntry, 'previousHash'> & {
  previousHash: string | null
  entryHash: string | null
}

function canonicalAuditFields(entry: HashableAuditEntry) {
  return {
    eventId: entry.id,
    timestampUTC: entry.createdAt.toISOString(),
    module: entry.module,
    userId: entry.userId,
    externalUserId: entry.externalUserId,
    serviceId: entry.serviceId,
    role: entry.actorRole,
    action: entry.action,
    relatedRecordId: entry.resourceId,
    result: entry.outcome,
    sessionId: entry.sessionId,
    safeSummary: entry.summary,
    source: entry.source,
    patientRecordId: entry.patientId,
  }
}

function entryHash(entry: HashableAuditEntry) {
  return createHash('sha256')
    .update(entry.previousHash)
    .update('\n')
    .update(JSON.stringify(canonicalAuditFields(entry)))
    .digest('hex')
}

function legacyEntryHash(entry: StoredAuditEntry) {
  const payload = {
    id: entry.id,
    createdAt: entry.createdAt.toISOString(),
    userId: entry.userId,
    externalUserId: entry.externalUserId,
    serviceId: entry.serviceId,
    patientId: entry.patientId,
    module: entry.module,
    actorRole: entry.actorRole,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId,
    outcome: entry.outcome,
    sessionId: entry.sessionId,
    summary: entry.summary,
    source: entry.source,
    previousHash: entry.previousHash,
  }
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

function moduleFromSource(source: string) {
  return source.split('.')[0] || 'app'
}

function safeSummary(event: AuditEvent) {
  return event.summary?.trim() || `${event.action} ${event.resource}`
}

async function lockAuditChain(transaction: AuditTransaction) {
  await transaction.auditLogChain.upsert({
    where: { id: 'global' },
    create: { id: 'global', hashVersion: 1 },
    update: { id: 'global' },
  })
}

async function upgradeAuditChain(transaction: AuditTransaction) {
  const chain = await transaction.auditLogChain.findUniqueOrThrow({ where: { id: 'global' } })
  if (chain.hashVersion >= 2) return true

  const entries = await transaction.auditLog.findMany({
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })

  let legacyPreviousHash: string | null = null
  let legacyValid = true
  const allEntriesUnhashed = entries.every((entry) => entry.entryHash === null)
  for (const entry of entries) {
    if (entry.entryHash === null || entry.previousHash !== legacyPreviousHash || entry.entryHash !== legacyEntryHash(entry)) {
      legacyValid = false
      break
    }
    legacyPreviousHash = entry.entryHash
  }
  const legacyHeadMatches = entries.length
    ? legacyPreviousHash === chain.headHash
      && entries[entries.length - 1].createdAt.getTime() === chain.headCreatedAt?.getTime()
    : chain.headHash === null && chain.headCreatedAt === null
  legacyValid = legacyValid && legacyHeadMatches
  if (!legacyValid && !allEntriesUnhashed) return false
  if (allEntriesUnhashed && (chain.headHash !== null || chain.headCreatedAt !== null)) return false

  let previousHash = GENESIS_HASH
  let lastCreatedAt: Date | null = null
  for (const entry of entries) {
    const moduleName = moduleFromSource(entry.source)
    const summary = entry.summary || `${entry.action} ${entry.resource}`
    const serviceId = entry.serviceId ?? (entry.userId || entry.externalUserId ? null : moduleName)
    const hashable: HashableAuditEntry = {
      id: entry.id,
      createdAt: entry.createdAt,
      userId: entry.userId,
      externalUserId: entry.externalUserId,
      serviceId,
      patientId: entry.patientId,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      module: moduleName,
      actorRole: entry.actorRole,
      source: entry.source,
      outcome: entry.outcome,
      sessionId: entry.sessionId,
      summary,
      previousHash,
    }
    const hash = entryHash(hashable)
    await transaction.auditLog.update({
      where: { id: entry.id },
      data: { serviceId, module: moduleName, summary, previousHash, entryHash: hash },
    })
    previousHash = hash
    lastCreatedAt = entry.createdAt
  }

  await transaction.auditLogChain.update({
    where: { id: 'global' },
    data: { headHash: entries.length ? previousHash : null, headCreatedAt: lastCreatedAt, hashVersion: 2 },
  })
  return true
}

async function appendAuditLog(transaction: AuditTransaction, event: AuditEvent) {
  await lockAuditChain(transaction)
  if (!await upgradeAuditChain(transaction)) throw new Error('Audit chain verification failed; refusing to append')

  const chain = await transaction.auditLogChain.findUniqueOrThrow({ where: { id: 'global' } })
  const createdAt = new Date(Math.max(Date.now(), (chain.headCreatedAt?.getTime() ?? 0) + 1))
  const id = randomUUID()
  const userId = event.userId ?? null
  const externalUserId = event.externalUserId ?? null
  const moduleName = event.module ?? moduleFromSource(event.source)
  const serviceId = event.serviceId ?? (!userId && !externalUserId ? moduleName : null)
  const hashable: HashableAuditEntry = {
    id,
    createdAt,
    userId,
    externalUserId,
    serviceId,
    patientId: event.patientId ?? null,
    action: event.action,
    resource: event.resource,
    resourceId: event.resourceId ?? null,
    module: moduleName,
    actorRole: event.actorRole,
    source: event.source,
    outcome: event.outcome ?? 'success',
    sessionId: event.sessionId ?? null,
    summary: safeSummary(event),
    previousHash: chain.headHash ?? GENESIS_HASH,
  }

  const hash = entryHash(hashable)
  await transaction.auditLog.create({
    data: {
      ...hashable,
      entryHash: hash,
    },
    select: { id: true },
  })
  await transaction.auditLogChain.update({
    where: { id: 'global' },
    data: { headHash: hash, headCreatedAt: createdAt },
  })
  return { id }
}

export async function verifyAuditChain() {
  return prisma.$transaction(async (transaction) => {
    await lockAuditChain(transaction)
    if (!await upgradeAuditChain(transaction)) return false

    const [chain, entries] = await Promise.all([
      transaction.auditLogChain.findUniqueOrThrow({ where: { id: 'global' } }),
      transaction.auditLog.findMany({ orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }),
    ])
    let previousHash = GENESIS_HASH
    let lastCreatedAt: Date | null = null

    for (const entry of entries) {
      const hashable: HashableAuditEntry = { ...entry, previousHash }
      if (entry.previousHash !== previousHash || entry.entryHash !== entryHash(hashable)) return false
      previousHash = entry.entryHash
      lastCreatedAt = entry.createdAt
    }

    return chain.headHash === (entries.length ? previousHash : null)
      && (chain.headCreatedAt?.getTime() ?? null) === (lastCreatedAt?.getTime() ?? null)
  })
}

export function writeAuditLog(event: AuditEvent, transaction?: AuditTransaction) {
  if (transaction) return appendAuditLog(transaction, event)
  // Audit writes serialize on a single chain row, so concurrent requests can queue for longer than Prisma's 5s default.
  return prisma.$transaction((client) => appendAuditLog(client, event), { maxWait: 30000, timeout: 30000 })
}