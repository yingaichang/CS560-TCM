import { createHash } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export class CommandError extends Error {
  constructor(message: string, public status = 409) { super(message) }
}

// Share the existing audit lock so a command and its audit append commit together.
export async function lockSoftwareWrites(tx: Prisma.TransactionClient) {
  await tx.auditLogChain.upsert({ where: { id: 'global' }, create: { id: 'global' }, update: { id: 'global' } })
}

export async function runSoftwareCommand<T extends { resourceId: string }>(scope: string, key: string | null, payload: unknown, operation: (tx: Prisma.TransactionClient) => Promise<T>) {
  if (!key || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) {
    throw new CommandError('A valid Idempotency-Key is required.', 400)
  }
  const digest = (value: string) => createHash('sha256').update(value).digest('hex')
  const id = `command:${digest(scope + ':' + key)}`
  const fingerprint = `command:${digest(JSON.stringify(payload))}`
  return prisma.$transaction(async tx => {
    await lockSoftwareWrites(tx)
    const previous = await tx.auditWebhookReceipt.findUnique({ where: { id } })
    if (previous) {
      const saved = JSON.parse(previous.provider) as { fingerprint: string; resourceId: string }
      if (saved.fingerprint !== fingerprint) throw new CommandError('This submission key was already used for different data.')
      return { duplicate: true as const, result: { resourceId: saved.resourceId } }
    }
    const result = await operation(tx)
    await tx.auditWebhookReceipt.create({ data: { id, provider: JSON.stringify({ fingerprint, resourceId: result.resourceId }) } })
    return { duplicate: false as const, result }
  }, { maxWait: 30000, timeout: 30000 })
}
