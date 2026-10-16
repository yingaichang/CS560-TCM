import Link from 'next/link'

export const metadata = { title: '過去病歷 | 診所管理系統' }

// Placeholder row only; real medical records are not connected yet.
const sampleRecords = [{ id: 'sample-record', label: '範例病歷' }]

export default async function PatientRecordsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <section>
      <Link href={`/admin/patients/${id}`} className="mb-3 inline-block text-sm font-medium text-[#355C46]">← 返回病人資料</Link>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#355C46]">過去病歷</h1>
          <p className="mt-1 text-sm text-gray-600">此頁將列出選定病人的過去病歷。目前為基本架構，尚未連接資料。</p>
        </div>
        <Link href={`/admin/patients/${id}/records/new`} className="rounded bg-[#355C46] px-4 py-2 text-center text-sm text-white">新增病歷</Link>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white p-4 shadow-sm">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="py-2">病歷</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {sampleRecords.map((record) => (
              <tr key={record.id} className="border-t">
                <td className="py-3">{record.label}</td>
                <td className="py-3">
                  <Link href={`/admin/patients/${id}/records/${record.id}/edit`} className="rounded bg-yellow-500 px-2 py-1 text-xs text-white">修改病歷</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
