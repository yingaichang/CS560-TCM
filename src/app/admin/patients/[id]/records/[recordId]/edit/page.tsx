import AdminPageScaffold from '@/components/AdminPageScaffold'
import PatientEncounterHistory from '@/components/admin/PatientEncounterHistory'

export default async function EditPatientRecordPage({
  params,
}: {
  params: Promise<{ id: string; recordId: string }>
}) {
  const { id, recordId } = await params

  return (
    <AdminPageScaffold
      title="修改病歷"
      description={`病歷編號：${recordId}。確認病人關聯後，由已指派醫師在看診工作清單編輯草稿。`}
      backHref={`/admin/patients/${id}/records`}
      backLabel="返回過去病歷"
    >
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <PatientEncounterHistory patientId={id} recordId={recordId} />
      </div>
    </AdminPageScaffold>
  )
}
