import AdminPageScaffold from '@/components/AdminPageScaffold'

export default async function DeactivateAdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminPageScaffold
      title="停用使用者"
      description={`使用者編號：${id}。停用確認流程與帳號狀態更新尚未實作。`}
      backHref="/admin/users"
    >
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">此頁目前只提供操作入口，不會停用或修改任何帳號。</p>
        <button type="button" disabled className="mt-5 rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-600">
          確認停用（尚未開放）
        </button>
      </div>
    </AdminPageScaffold>
  )
}
