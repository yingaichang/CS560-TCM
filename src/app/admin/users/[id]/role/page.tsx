import AdminPlaceholderPage from '@/components/admin/AdminPlaceholderPage'

export const metadata = { title: '指定角色 | 診所管理系統' }

export default async function AssignRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <AdminPlaceholderPage
      title="指定角色"
      description="此頁將用於為選定的使用者指定角色。目前尚未實作資料儲存與角色權限。"
      backHref="/admin/users"
      backLabel="返回使用者清單"
    >
      <p className="mt-3 text-xs text-gray-500">使用者編號：{id}</p>
    </AdminPlaceholderPage>
  )
}
