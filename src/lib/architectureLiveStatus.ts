import type { ArchitectureComponent, ArchitectureConnection, ComponentId } from './architectureMap'
import type { SystemCheck, SystemConnectionReport } from './systemConnectionTypes'

export function withLiveSystemStatus(
  sourceComponents: Record<ComponentId, ArchitectureComponent>,
  sourceConnections: ArchitectureConnection[],
  report?: SystemConnectionReport,
) {
  const components = { ...sourceComponents }
  const connections = sourceConnections.map(item => ({ ...item }))
  if (!report) return { components, connections }
  const byId = Object.fromEntries(report.checks.map(check => [check.id, check]))
  function patch<T extends ArchitectureComponent | ArchitectureConnection>(item: T, check?: SystemCheck): T {
    if (!check) return item
    return {
      ...item, status: check.status, assessment: check.detail,
      missingRequirement: check.status === 'connected' ? '本次唯讀連線檢查通過；完整業務流程、投遞結果及外部事件仍以各流程證據為準。' : check.detail,
      safeError: check.status === 'failed' ? check.detail : null,
      lastTest: ['connected', 'failed'].includes(check.status) ? {
        at: check.checkedAt, command: 'live-system-connections', scope: check.detail,
        result: check.status === 'connected' ? 'passed' : 'failed', source: 'Real Read-only Service Check',
      } : null,
    }
  }
  const componentChecks: Partial<Record<ComponentId, SystemCheck>> = {
    db: byId.database, identity: byId.identity, mail: byId.mail, stripe: byId.stripe,
    ubuntuHost: byId.ubuntu,
    databaseServer: report.environment === 'ubuntu' && report.databaseKind === 'postgresql' ? byId.database : undefined,
  }
  for (const [id, check] of Object.entries(componentChecks)) components[id as ComponentId] = patch(components[id as ComponentId], check)
  const connectionChecks: Record<string, SystemCheck | undefined> = {
    'booking-notify': byId.mail,
    'contact-mail': byId.mail,
    'payment-platform': byId.stripe,
    'payment-callback': byId.stripeWebhook,
    'identity-session': byId.identity,
    'kiosk-sms': byId.sms,
    'ubuntu-application': byId.ubuntu,
    'ubuntu-database': report.environment === 'ubuntu' && report.databaseKind === 'postgresql' ? byId.database : undefined,
    'database-migration': report.environment === 'ubuntu' ? byId.schema : undefined,
  }
  return { components, connections: connections.map(item => {
    const check = connectionChecks[item.id]
    if (!check) return item
    // Read-only probes never prove workflow writes, UI updates or migrations.
    return { ...item, ...(check.status === 'failed' ? { status: 'failed' as const, safeError: check.detail } : {}), liveObservation: { at: check.checkedAt, status: check.status, detail: check.detail, source: 'Real Read-only Service Check' } }
  }) }
}
