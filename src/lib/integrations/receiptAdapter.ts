import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'
import { lockSoftwareWrites } from '@/lib/softwareCommands'
import { parseAdapterEvent, type AdapterService } from './contracts'
import { BoundaryError } from './httpBoundary'
import { canonicalJson } from './canonicalJson'

const secretKeys: Record<AdapterService, string> = { scanner: 'SCANNER_ADAPTER_SIGNING_SECRET', sms: 'SMS_ADAPTER_SIGNING_SECRET', voice: 'VOICE_ADAPTER_SIGNING_SECRET', learning: 'LEARNING_ADAPTER_SIGNING_SECRET', storage: 'STORAGE_ADAPTER_SIGNING_SECRET', measurements: 'MEASUREMENTS_ADAPTER_SIGNING_SECRET' }
export function adapterSecret(service: AdapterService) {
  const secret = process.env[secretKeys[service]]
  return process.env.INTEGRATION_RECEIPTS_ENABLED === 'true' && secret && secret.length >= 32 ? secret : null
}

export function verifyAdapterSignature(service: AdapterService, body: string, timestamp: string | null, signature: string | null, secret: string) {
  if (!timestamp || !/^\d{10}$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300 || !signature || !/^sha256=[a-f0-9]{64}$/.test(signature)) throw new BoundaryError(401, 'Invalid adapter signature.')
  const expected = createHmac('sha256', secret).update(timestamp + '.' + service + '.' + body).digest()
  if (!timingSafeEqual(expected, Buffer.from(signature.slice(7), 'hex'))) throw new BoundaryError(401, 'Invalid adapter signature.')
}

export async function receiveAdapterEvent(service: AdapterService, input: unknown) {
  const event = parseAdapterEvent(service, input)
  const digest = (value: string) => createHash('sha256').update(value).digest('hex')
  const receiptId = `adapter:${service}:${digest(event.eventId)}`
  const fingerprint = digest(canonicalJson(event))
  return prisma.$transaction(async tx => {
    await lockSoftwareWrites(tx)
    const previous = await tx.auditWebhookReceipt.findUnique({ where: { id: receiptId } })
    if (previous && previous.provider !== fingerprint) throw new BoundaryError(409, 'Event identifier was already used for different data.')
    if (!previous) {
      await tx.auditWebhookReceipt.create({ data: { id: receiptId, provider: fingerprint } })
      await writeAuditLog({ serviceId: `adapter-${service}`, actorRole: 'external_service', action: 'receive_contract_event', resource: 'integration_receipt', resourceId: receiptId, source: 'External Adapter', module: 'integration_adapter', outcome: 'Planned', summary: `Receipt-only ${service} event accepted; workflow not applied; raw input discarded` }, tx)
    }
    return { receiptId, accepted: true, applied: false, duplicate: Boolean(previous), status: 'Planned' as const, reason: 'record_mapping_not_configured' }
  }, { maxWait: 30000, timeout: 30000 })
}
