import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { adapterSchemas, integrationContracts } from '@/lib/integrations/contracts'
import { scenarioFixtures, scenarioIds } from '@/lib/architectureTests/fixtures'
import { scenarioNames } from '@/lib/architectureTests/runner'
import { unrunSteps } from '@/lib/architectureTests/catalog'
import { recentRuns, simulationEnabled } from '@/lib/architectureTests/service'
import verification from '@/data/softwareConnectionVerification.json'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export async function GET() {
  if (!(await authorizeEhrRequest(['admin']))) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  let history: Awaited<ReturnType<typeof recentRuns>> = []
  let receipts: { service: string; at: string; status: 'Planned' }[] = []
  let historyStatus = 'Passed'
  try {
    history = await recentRuns()
    const events = await prisma.auditLog.findMany({ where: { module: 'integration_adapter', resource: 'integration_receipt', source: 'External Adapter' }, orderBy: { createdAt: 'desc' }, take: 20, select: { serviceId: true, createdAt: true } })
    receipts = events.filter(e => e.serviceId?.startsWith('adapter-') && Object.prototype.hasOwnProperty.call(adapterSchemas, e.serviceId.slice(8))).map(e => ({ service: e.serviceId!.slice(8), at: e.createdAt.toISOString(), status: 'Planned' }))
  } catch { historyStatus = 'Failed' }
  return NextResponse.json({ simulationEnabled: simulationEnabled(), simulationSource: 'Development Simulation', contracts: integrationContracts, schemas: Object.fromEntries(Object.entries(adapterSchemas).map(([id, schema]) => [id, z.toJSONSchema(schema)])), scenarios: scenarioIds.map(id => ({ id, name: scenarioNames[id], fixture: scenarioFixtures[id], steps: unrunSteps(id) })), history, historyStatus, receipts, recordedSoftwareVerification: { at: verification.at, result: verification.result, scope: verification.scope, connections: verification.connections } }, { headers: { 'Cache-Control': 'no-store' } })
}
