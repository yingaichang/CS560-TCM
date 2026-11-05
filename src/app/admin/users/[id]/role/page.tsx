import AdminPageScaffold from '@/components/AdminPageScaffold'

export default async function AssignUserRolePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminPageScaffold
      title="指定使用者角色"
      description={`使用者編號：${id}。角色選擇與權限儲存尚未實作。`}
      backHref="/admin/users"
    >
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">後續可在此選擇管理員、診所人員或其他角色。</p>
        <button type="button" disabled className="mt-5 rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-600">
          儲存角色（尚未開放）
        </button>
      </div>
    </AdminPageScaffold>
  )
}
