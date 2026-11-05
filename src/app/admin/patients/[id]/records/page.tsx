import Link from 'next/link'
import AdminPageScaffold from '@/components/AdminPageScaffold'

export default async function PatientRecordsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminPageScaffold
      title="過去病歷"
      description={`病人編號：${id}。病歷清單與內容尚未連接資料來源。`}
      backHref={`/admin/patients/${id}`}
      backLabel="返回病人資料"
    >
      <div className="mb-4 flex justify-end">
        <Link href={`/admin/patients/${id}/records/new`} className="rounded bg-[#355C46] px-3 py-2 text-sm font-medium text-white">
          新增病歷
        </Link>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">病歷資料串接尚未實作。每筆病歷可由此進入查看或修改。</p>
        <Link href={`/admin/patients/${id}/records/sample-record/edit`} className="mt-4 inline-flex text-sm font-medium text-[#355C46] underline">
          查看示範病歷修改頁
        </Link>
      </div>
    </AdminPageScaffold>
  )
}
