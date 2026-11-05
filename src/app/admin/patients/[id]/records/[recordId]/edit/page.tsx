import AdminPageScaffold from '@/components/AdminPageScaffold'

export default async function EditPatientRecordPage({
  params,
}: {
  params: Promise<{ id: string; recordId: string }>
}) {
  const { id, recordId } = await params

  return (
    <AdminPageScaffold
      title="修改病歷"
      description={`病歷編號：${recordId}。修改表單與資料儲存尚未實作。`}
      backHref={`/admin/patients/${id}/records`}
      backLabel="返回過去病歷"
    >
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">後續可在此修改病歷內容。</p>
      </div>
    </AdminPageScaffold>
  )
}
