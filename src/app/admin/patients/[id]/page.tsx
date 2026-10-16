import Link from 'next/link'
import AdminPlaceholderPage from '@/components/admin/AdminPlaceholderPage'

export const metadata = { title: '病人資料 | 診所管理系統' }

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <AdminPlaceholderPage
      title="病人資料"
      description="此頁將顯示選定病人的基本資料，並可由此進入過去病歷。目前尚未連接資料。"
      backHref="/admin/patients"
      backLabel="返回病人清單"
    >
      <p className="mt-3 text-xs text-gray-500">病人編號：{id}</p>
      <div className="mt-4">
        <Link href={`/admin/patients/${id}/records`} className="rounded bg-blue-600 px-3 py-2 text-sm text-white">查看過去病歷</Link>
      </div>
    </AdminPlaceholderPage>
  )
}
