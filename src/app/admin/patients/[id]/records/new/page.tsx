import AdminPageScaffold from '@/components/AdminPageScaffold'
import Link from 'next/link'

export default async function NewPatientRecordPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminPageScaffold
      title="新增病歷"
      description={`病人編號：${id}。病歷須關聯已建立並指派醫師的看診。`}
      backHref={`/admin/patients/${id}/records`}
      backLabel="返回過去病歷"
    >
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">先在預約管理連結正確病人並完成報到，再指派醫師。醫師可在看診工作清單保存草稿、簽核，並於治療管理建立相關紀錄。</p>
        <div className="mt-5 flex gap-4"><Link className="underline" href="/admin/appointments">前往預約管理</Link><Link className="underline" href="/ehr/encounters">前往看診工作清單</Link></div>
      </div>
    </AdminPageScaffold>
  )
}
