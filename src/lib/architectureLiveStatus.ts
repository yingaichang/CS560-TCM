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
        result: check.status === 'connected' ? 'passed' : 'failed',
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
    'ubuntu-application': byId.ubuntu,
    'ubuntu-database': report.environment === 'ubuntu' && report.databaseKind === 'postgresql' ? byId.database : undefined,
    'database-migration': report.environment === 'ubuntu' ? byId.schema : undefined,
  }
  return { components, connections: connections.map(item => patch(item, connectionChecks[item.id])) }
}
