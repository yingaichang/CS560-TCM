import Link from 'next/link'

export default function AdminHome() {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#355C46]">儀表板</h1>
        <div></div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium">歡迎來到診所管理系統</h2>
          <p className="mt-2 text-sm text-gray-600">使用左側選單瀏覽管理功能。</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/admin/appointments" className="text-sm font-medium text-[#355C46]">前往：預約管理 → 待確認預約</Link>
            <Link href="/admin/patients" className="text-sm font-medium text-[#355C46]">前往：病歷管理</Link>
            <Link href="/admin/users" className="text-sm font-medium text-[#355C46]">前往：使用者管理</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
