import Link from 'next/link'
import AdminPageScaffold from '@/components/AdminPageScaffold'
import PatientEncounterHistory from '@/components/admin/PatientEncounterHistory'

export default async function PatientRecordsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminPageScaffold
      title="過去病歷"
      description={`病人編號：${id}。顯示已保存的看診與病歷狀態。`}
      backHref={`/admin/patients/${id}`}
      backLabel="返回病人資料"
    >
      <div className="mb-4 flex justify-end">
        <Link href={`/admin/patients/${id}/records/new`} className="rounded bg-[#355C46] px-3 py-2 text-sm font-medium text-white">
          新增病歷
        </Link>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <PatientEncounterHistory patientId={id} />
      </div>
    </AdminPageScaffold>
  )
}
