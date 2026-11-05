import Link from 'next/link'
import AdminPageScaffold from '@/components/AdminPageScaffold'

export default function AdminUsersPage() {
  return (
    <AdminPageScaffold
      title="使用者管理"
      description="管理後台使用者、指定角色與停用帳號。資料串接與角色權限尚未實作。"
      backHref="/admin"
      backLabel="返回後台首頁"
    >
      <div className="mb-4 flex justify-end">
        <Link href="/admin/users/new" className="rounded bg-[#355C46] px-3 py-2 text-sm font-medium text-white">
          新增使用者
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white p-4 shadow-sm">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="text-xs text-gray-500">
            <tr>
              <th className="py-2">使用者</th>
              <th>角色</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-3">示範使用者（靜態範例）</td>
              <td>尚未指定</td>
              <td>待設定</td>
              <td className="space-x-3">
                <Link href="/admin/users/sample-user/role" className="font-medium text-[#355C46] underline">指定角色</Link>
                <Link href="/admin/users/sample-user/deactivate" className="font-medium text-red-700 underline">停用</Link>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-xs text-gray-500">此列僅供介面導覽示範，不代表實際帳號，也不會變更資料。</p>
      </div>
    </AdminPageScaffold>
  )
}
