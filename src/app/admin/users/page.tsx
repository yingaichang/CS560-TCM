import Link from 'next/link'

export const metadata = { title: '使用者管理 | 診所管理系統' }

// Placeholder row only; real users are not connected yet.
const sampleUsers = [{ id: 'sample-user', name: '範例使用者' }]

export default function AdminUsersPage() {
  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#355C46]">使用者管理</h1>
          <p className="mt-1 text-sm text-gray-600">管理後台使用者、角色與帳號狀態。目前為基本架構，尚未連接資料或角色權限。</p>
        </div>
        <Link href="/admin/users/new" className="rounded bg-[#355C46] px-4 py-2 text-center text-sm text-white">新增使用者</Link>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white p-4 shadow-sm">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="py-2">使用者</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="py-3">{user.name}</td>
                <td className="flex gap-2 py-3">
                  <Link href={`/admin/users/${user.id}/role`} className="rounded bg-indigo-600 px-2 py-1 text-xs text-white">指定角色</Link>
                  <Link href={`/admin/users/${user.id}/disable`} className="rounded bg-gray-700 px-2 py-1 text-xs text-white">停用</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
