import 'server-only'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'
import { runSoftwareCommand } from '@/lib/softwareCommands'
import { getSystemConnections } from '@/lib/systemConnections'
import { canonicalJson } from '@/lib/integrations/canonicalJson'
import { BoundaryError } from '@/lib/integrations/httpBoundary'
import { scenarioFixtures, scenarioIds, type ScenarioId } from './fixtures'
import { runSimulation } from './runner'
import { unrunSteps } from './catalog'
import { aggregateStatus, simulationSource, testStatuses, type TestRun, type TestStep } from './types'

type Administrator = { userId: string | null; externalUserId: string; sessionId: string | null; role: string }
const moduleName = 'architecture_test'
export function simulationEnabled() {
  return process.env.NODE_ENV === 'development' && process.env.ARCHITECTURE_SIMULATION_ENABLED === 'true'
}
export const simulationInput = z.object({ runId: z.uuid(), scenario: z.enum(scenarioIds), source: z.literal(simulationSource), input: z.unknown() }).strict()
export const liveInput = z.object({ runId: z.uuid() }).strict()

async function appendRun(run: TestRun, actor: Administrator) {
  return runSoftwareCommand('architecture-test-center', run.runId, { actor: actor.externalUserId, scenario: run.scenario, source: run.source }, async tx => {
    const context = { userId: actor.userId, externalUserId: actor.externalUserId, sessionId: actor.sessionId, actorRole: 'admin', serviceId: 'architecture-test-center', source: run.source, module: moduleName, resourceId: run.runId }
    for (const step of run.steps) await writeAuditLog({ ...context, action: `step:${step.id}`, resource: 'architecture_test_step', outcome: step.status, summary: `Architecture step ${step.id}; ${step.status}; ${step.scope}; no raw input retained` }, tx)
    await writeAuditLog({ ...context, action: `run:${run.scenario}`, resource: 'architecture_test_run', outcome: run.status, summary: `Architecture ${run.source} run; fictional contract/sandbox data or read-only checks only` }, tx)
    return { resourceId: run.runId }
  })
}

export async function simulate(input: unknown, actor: Administrator): Promise<TestRun> {
  if (!simulationEnabled()) throw new BoundaryError(404, 'Development simulator is disabled.')
  const parsed = simulationInput.parse(input)
  if (canonicalJson(parsed.input) !== canonicalJson(scenarioFixtures[parsed.scenario])) throw new BoundaryError(400, 'Only the published fictional fixture is allowed. Do not submit real records.')
  const run = runSimulation(parsed.scenario, parsed.runId)
  const saved = await appendRun(run, actor)
  if (saved.duplicate) {
    const previous = await readRun(run.runId)
    if (!previous) throw new BoundaryError(503, 'The saved run cannot be confirmed.')
    return { ...previous, duplicate: true }
  }
  return run
}

export async function runReadOnly(input: unknown, actor: Administrator): Promise<TestRun> {
  const { runId } = liveInput.parse(input)
  const report = await getSystemConnections()
  const steps: TestStep[] = report.checks.map(check => ({ id: check.id, name: check.name, status: check.status === 'connected' ? 'Passed' : check.status === 'failed' ? 'Failed' : check.status === 'planned' ? 'Planned' : 'Not Tested', detail: check.detail, scope: 'Real Service / Device' }))
  const run: TestRun = { runId, scenario: 'live-readonly', source: 'Application Read-only Check', checkedAt: report.checkedAt, status: aggregateStatus(steps), steps }
  const saved = await appendRun(run, actor)
  if (saved.duplicate) {
    const previous = await readRun(runId)
    if (!previous) throw new BoundaryError(503, 'The saved run cannot be confirmed.')
    return { ...previous, duplicate: true }
  }
  return run
}

const liveNames: Record<string, string> = { database: '資料庫唯讀查詢', schema: '必要資料表與欄位', identity: 'Clerk 唯讀 API（不代表登入）', mail: 'SMTP 認證（不寄信）', stripe: 'Stripe 唯讀 API（不扣款）', stripeWebhook: 'Stripe 回呼設定', clerkWebhook: 'Clerk 回呼設定', sms: '簡訊設定', ubuntu: 'Ubuntu 部署', publicDomain: '公開網址版本' }
function knownSource(value: string) { return value === simulationSource || value === 'Application Read-only Check' }
export async function readRun(runId: string): Promise<TestRun | null> {
  if (!z.uuid().safeParse(runId).success) return null
  const head = await prisma.auditLog.findFirst({ where: { module: moduleName, resource: 'architecture_test_run', resourceId: runId }, orderBy: { createdAt: 'desc' }, select: { action: true, source: true, createdAt: true } })
  if (!head || !knownSource(head.source)) return null
  const scenario = head.action.startsWith('run:') ? head.action.slice(4) : ''
  const parsedScenario = z.enum(scenarioIds).safeParse(scenario)
  if (scenario !== 'live-readonly' && !parsedScenario.success) return null
  const definitions = parsedScenario.success ? unrunSteps(parsedScenario.data as ScenarioId) : Object.entries(liveNames).map(([id, name]) => ({ id, name, scope: 'Real Service / Device' as const }))
  const rows = await prisma.auditLog.findMany({ where: { module: moduleName, resource: 'architecture_test_step', resourceId: runId, source: head.source }, select: { action: true, outcome: true } })
  const steps: TestStep[] = definitions.map(definition => {
    const row = rows.find(row => row.action === `step:${definition.id}`)
    const status = z.enum(testStatuses).safeParse(row?.outcome)
    return { ...definition, status: status.success ? status.data : 'Not Tested', detail: '由受保護稽核事件還原的結果；未讀取或保存原始輸入、金鑰及供應商回應。' }
  })
  return { runId, scenario, source: head.source as TestRun['source'], checkedAt: head.createdAt.toISOString(), status: aggregateStatus(steps), steps }
}

export async function recentRuns() {
  const heads = await prisma.auditLog.findMany({ where: { module: moduleName, resource: 'architecture_test_run', source: { in: [simulationSource, 'Application Read-only Check'] } }, orderBy: { createdAt: 'desc' }, take: 10, select: { resourceId: true } })
  const runs = await Promise.all(heads.map(head => head.resourceId ? readRun(head.resourceId) : null))
  return runs.filter((run): run is TestRun => Boolean(run))
}
