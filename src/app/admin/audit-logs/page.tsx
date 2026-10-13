import { redirect } from 'next/navigation'
import AuditLogViewer from './AuditLogViewer'
import { authorizeAuditLogAccess } from '@/lib/ehrAuthorization'

export const dynamic = 'force-dynamic'

export default async function AuditLogsPage() {
  const actor = await authorizeAuditLogAccess()
  if (!actor) redirect('/admin')
  return <AuditLogViewer />
}