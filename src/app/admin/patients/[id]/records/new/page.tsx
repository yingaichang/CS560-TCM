import AdminPlaceholderPage from '@/components/admin/AdminPlaceholderPage'

export const metadata = { title: '新增病歷 | 診所管理系統' }

export default async function NewRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <AdminPlaceholderPage
      title="新增病歷"
      description="此頁將用於為選定病人新增病歷。目前尚未實作資料儲存。"
      backHref={`/admin/patients/${id}/records`}
      backLabel="返回過去病歷"
    />
  )
}
