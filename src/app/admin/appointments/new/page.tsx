import AdminPlaceholderPage from '@/components/admin/AdminPlaceholderPage'

export const metadata = { title: '新增預約 | 診所管理系統' }

export default function NewAppointmentPage() {
  return (
    <AdminPlaceholderPage
      title="新增預約"
      description="此頁將用於由診所人員為病人建立新預約。目前尚未實作資料儲存。"
      backHref="/admin/appointments"
      backLabel="返回預約清單"
    />
  )
}
