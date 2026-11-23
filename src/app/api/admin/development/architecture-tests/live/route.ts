import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { runReadOnly } from '@/lib/architectureTests/service'
import { BoundaryError, parseJson, readBoundedBody, requireSameOrigin } from '@/lib/integrations/httpBoundary'
import { CommandError } from '@/lib/softwareCommands'

export async function POST(request: NextRequest) {
  const actor = await authorizeEhrRequest(['admin'])
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  try {
    requireSameOrigin(request)
    const run = await runReadOnly(parseJson(await readBoundedBody(request, 1024)), actor)
    return NextResponse.json(run, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const status = error instanceof BoundaryError || error instanceof CommandError ? error.status : error instanceof z.ZodError ? 400 : 503
    return NextResponse.json({ error: error instanceof BoundaryError || error instanceof CommandError ? error.message : status === 400 ? 'Invalid test request.' : 'Read-only result could not be committed. Retry the same run identifier.' }, { status })
  }
}
