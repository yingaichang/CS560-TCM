import { notFound } from 'next/navigation'
import AdminPageScaffold from '@/components/AdminPageScaffold'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/auditLog'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const actor = await authorizeEhrRequest(['admin'])
  if (!actor) notFound()
  let users: { id: string; name: string | null; email: string; role: string }[] = []
  let error = false
  try {
    users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true }, orderBy: { email: 'asc' }, take: 100 })
    await writeAuditLog({ ...actor, actorRole: actor.role, action: 'read_list', resource: 'local_user_mapping', source: 'admin.users', module: 'user_access', summary: 'Local account mappings read; external identity state is not inferred' })
  } catch { error = true }
  return <AdminPageScaffold title="使用者對應清單" description="顯示已儲存的本機帳號對應。外部身分服務提供角色時，會優先使用外部角色。" backHref="/admin" backLabel="返回後台首頁">
    {error ? <p role="alert">無法確認清單，請重新整理後重試。</p> : <div className="overflow-x-auto rounded border bg-white p-4"><table className="w-full text-left text-sm"><thead><tr><th>姓名</th><th>電子郵件</th><th>本機角色</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td className="py-3">{user.name || '未提供'}</td><td>{user.email}</td><td>{user.role}</td></tr>)}</tbody></table>{!users.length && <p>尚無本機帳號對應。</p>}</div>}
    <p className="mt-4 text-sm text-gray-600">此清單不代表外部帳號已啟用或登入成功。建立、停用及角色異動需完成身分服務與本機資料的同步及復原流程，目前尚未開放。</p>
  </AdminPageScaffold>
}
