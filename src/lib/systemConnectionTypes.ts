import type { ConnectionStatus } from './architectureMap'

export type SystemCheckId = 'database' | 'schema' | 'identity' | 'mail' | 'stripe' | 'stripeWebhook' | 'clerkWebhook' | 'sms' | 'ubuntu' | 'publicDomain'
export type SystemCheck = {
  id: SystemCheckId
  name: string
  status: ConnectionStatus
  detail: string
  checkedAt: string
}
export type SystemConnectionReport = { checkedAt: string; checks: SystemCheck[] }
