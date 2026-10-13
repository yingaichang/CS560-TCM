import Link from 'next/link'

export default function AdminSidebar() {
  const menu = [
    { label: '儀表板', href: '/admin' },
    { label: '預約管理', href: '/admin/appointments' },
    { label: '病人管理', href: '/admin/patients' },
    { label: '健康資料', href: '/admin/health-data' },
    { label: 'AI 問卷審核', href: '/admin/ai-review' },
    { label: '安全稽核', href: '/admin/audit-logs' },
    { label: '回診提醒', href: '/admin/reminders' },
    { label: '醫師排班', href: '/admin/schedule' },
    { label: '系統設定', href: '/admin/settings' },
  ]

  return (
    <aside className="w-64 border-r border-gray-100 bg-white px-4 py-6 hidden md:block">
      <div className="mb-6 px-2">
        <h3 className="text-lg font-semibold text-[#355C46]">診所管理</h3>
      </div>
      <nav className="space-y-1">
        {menu.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
