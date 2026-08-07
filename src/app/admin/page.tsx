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
          <div className="mt-4">
            <Link href="/admin/appointments" className="text-sm font-medium text-[#355C46]">前往：預約管理 → 待確認預約</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
