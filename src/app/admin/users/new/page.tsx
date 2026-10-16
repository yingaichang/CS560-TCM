import AdminPlaceholderPage from '@/components/admin/AdminPlaceholderPage'

export const metadata = { title: '新增使用者 | 診所管理系統' }

export default function NewUserPage() {
  return (
    <AdminPlaceholderPage
      title="新增使用者"
      description="此頁將用於建立新的後台使用者。目前尚未實作資料儲存。"
      backHref="/admin/users"
      backLabel="返回使用者清單"
    />
  )
}
