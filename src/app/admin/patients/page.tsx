import Link from 'next/link'

export const metadata = { title: '病歷管理 | 診所管理系統' }

// Placeholder row only; the real patient list is not connected yet.
const samplePatients = [{ id: 'sample-patient', name: '範例病人' }]

export default function AdminPatientsPage() {
  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#355C46]">病歷管理</h1>
          <p className="mt-1 text-sm text-gray-600">管理病人清單、病人資料與病歷紀錄。目前為基本架構，尚未連接資料。</p>
        </div>
        <Link href="/admin/patients/new" className="rounded bg-[#355C46] px-4 py-2 text-center text-sm text-white">新增病人</Link>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white p-4 shadow-sm">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="py-2">病人姓名</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {samplePatients.map((patient) => (
              <tr key={patient.id} className="border-t">
                <td className="py-3">{patient.name}</td>
                <td className="py-3">
                  <Link href={`/admin/patients/${patient.id}`} className="rounded bg-blue-600 px-2 py-1 text-xs text-white">查看病人資料</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
