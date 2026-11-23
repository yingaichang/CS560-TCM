import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { simulate, simulationEnabled } from '@/lib/architectureTests/service'
import { BoundaryError, parseJson, readBoundedBody, requireSameOrigin } from '@/lib/integrations/httpBoundary'
import { CommandError } from '@/lib/softwareCommands'

export async function POST(request: NextRequest) {
  const actor = await authorizeEhrRequest(['admin'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  if (!simulationEnabled()) return NextResponse.json({ error: 'Development simulator is disabled.' }, { status: 404 })
  try {
    requireSameOrigin(request)
    const run = await simulate(parseJson(await readBoundedBody(request)), actor)
    return NextResponse.json(run, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const status = error instanceof BoundaryError || error instanceof CommandError ? error.status : error instanceof z.ZodError ? 400 : 503
    return NextResponse.json({ error: error instanceof BoundaryError || error instanceof CommandError ? error.message : status === 400 ? 'Invalid simulator contract.' : 'Test run could not be committed to the audit log. Retry the same run identifier.' }, { status })
  }
}
