import AdminPlaceholderPage from '@/components/admin/AdminPlaceholderPage'

export const metadata = { title: '新增病人 | 診所管理系統' }

export default function NewPatientPage() {
  return (
    <AdminPlaceholderPage
      title="新增病人"
      description="此頁將用於建立新的病人資料。目前尚未實作資料儲存。"
      backHref="/admin/patients"
      backLabel="返回病人清單"
    />
  )
}
