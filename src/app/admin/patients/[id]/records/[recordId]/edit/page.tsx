import AdminPlaceholderPage from '@/components/admin/AdminPlaceholderPage'

export const metadata = { title: '修改病歷 | 診所管理系統' }

export default async function EditRecordPage({ params }: { params: Promise<{ id: string; recordId: string }> }) {
  const { id, recordId } = await params
  return (
    <AdminPlaceholderPage
      title="修改病歷"
      description="此頁將用於修改選定的病歷。目前尚未實作資料儲存。"
      backHref={`/admin/patients/${id}/records`}
      backLabel="返回過去病歷"
    >
      <p className="mt-3 text-xs text-gray-500">病歷編號：{recordId}</p>
    </AdminPlaceholderPage>
  )
}
