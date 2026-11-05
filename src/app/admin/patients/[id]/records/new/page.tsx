import AdminPageScaffold from '@/components/AdminPageScaffold'

export default async function NewPatientRecordPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminPageScaffold
      title="新增病歷"
      description={`病人編號：${id}。新增病歷表單與資料儲存尚未實作。`}
      backHref={`/admin/patients/${id}/records`}
      backLabel="返回過去病歷"
    >
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">後續可在此輸入看診日期、症狀、診斷與治療紀錄。</p>
        <button type="button" disabled className="mt-5 rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-600">
          儲存病歷（尚未開放）
        </button>
      </div>
    </AdminPageScaffold>
  )
}
