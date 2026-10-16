import AdminPlaceholderPage from '@/components/admin/AdminPlaceholderPage'

export const metadata = { title: '修改預約 | 診所管理系統' }

export default async function EditAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <AdminPlaceholderPage
      title="修改預約"
      description="此頁將用於修改預約的日期、時間與內容。目前尚未實作資料儲存。"
      backHref="/admin/appointments"
      backLabel="返回預約清單"
    >
      <p className="mt-3 text-xs text-gray-500">預約編號：{id}</p>
    </AdminPlaceholderPage>
  )
}
