import AdminPlaceholderPage from '@/components/admin/AdminPlaceholderPage'

export const metadata = { title: '停用使用者 | 診所管理系統' }

export default async function DisableUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <AdminPlaceholderPage
      title="停用使用者"
      description="此頁將用於確認並停用選定的使用者。目前尚未實作資料儲存，不會變更任何帳號。"
      backHref="/admin/users"
      backLabel="返回使用者清單"
    >
      <p className="mt-3 text-xs text-gray-500">使用者編號：{id}</p>
    </AdminPlaceholderPage>
  )
}
