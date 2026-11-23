import AdminPageScaffold from '@/components/AdminPageScaffold'
import Link from 'next/link'

export default function NewAppointmentPage() {
  return (
    <AdminPageScaffold
      title="新增預約"
      description="使用現有公開預約流程建立申請，送出後可回到預約清單處理。"
      backHref="/admin/appointments"
    >
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">表單會檢查休診日及時段衝突；申請不會自動建立病人身分或完成報到。</p>
        <Link href="/appointments" className="mt-5 inline-flex rounded bg-[#355C46] px-4 py-2 text-white">開啟公開預約表單</Link>
      </div>
    </AdminPageScaffold>
  )
}
