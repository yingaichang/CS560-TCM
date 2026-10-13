import { NextResponse } from 'next/server'
import { authorizeAuditLogAccess } from '@/lib/ehrAuthorization'
import { verifyAuditChain } from '@/lib/auditLog'

export async function GET() {
  const actor = await authorizeAuditLogAccess()
  if (!actor) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const valid = await verifyAuditChain()
  return NextResponse.json({
    valid,
    message: valid ? 'Verify Chain: Valid' : 'Verify Chain: Failed',
  })
}