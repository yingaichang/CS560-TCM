'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CalendarDays, ChevronDown, ClipboardList, Mail, Receipt, ShieldCheck, Users, Wrench, type LucideIcon } from 'lucide-react'

type MenuItem = { label: string; href?: string; planned?: boolean }
type MenuSection = { key: string; label: string; icon: LucideIcon; basePath: string; items: MenuItem[] }

// Items without an href are features that have no route yet and are shown as planned.
const sections: MenuSection[] = [
  {
    key: 'appointments',
    label: '預約管理',
    icon: CalendarDays,
    basePath: '/admin/appointments',
    items: [
      { label: '預約清單', href: '/admin/appointments' },
      { label: '新增預約', href: '/admin/appointments/new' },
      { label: '預約日曆', planned: true },
      { label: '休診日管理', href: '/admin/holidays' },
    ],
  },
  {
    key: 'patients',
    label: '病歷管理',
    icon: ClipboardList,
    basePath: '/admin/patients',
    items: [
      { label: '病人清單', href: '/admin/patients' },
      { label: '新增病人', href: '/admin/patients/new' },
    ],
  },
  {
    key: 'users',
    label: '使用者管理',
    icon: Users,
    basePath: '/admin/users',
    items: [
      { label: '使用者清單', href: '/admin/users' },
      { label: '新增使用者', href: '/admin/users/new' },
      { label: '角色與權限', planned: true },
    ],
  },
  {
    key: 'security',
    label: '系統管理／安全性',
    icon: ShieldCheck,
    basePath: '/admin/audit-logs',
    items: [
      { label: '稽核紀錄', href: '/admin/audit-logs' },
    ],
  },
  {
    key: 'contacts',
    label: '聯絡訊息',
    icon: Mail,
    basePath: '/admin/contacts',
    items: [{ label: '訊息收件匣', href: '/admin/contacts' }],
  },
  {
    key: 'registrations',
    label: '講座報名',
    icon: Receipt,
    basePath: '/admin/registrations',
    items: [{ label: '報名紀錄', href: '/admin/registrations' }],
  },
]

const matchesPath = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`)

const developmentSection: MenuSection = {
  key: 'development',
  label: '開發工具',
  icon: Wrench,
  basePath: '/admin/development',
  items: [{ label: '系統架構狀態', href: '/admin/development/architecture-status' }],
}

// Patient profile and record pages need an id, so they only appear once a patient is selected.
function patientContextItems(pathname: string): MenuItem[] {
  const patientId = pathname.match(/^\/admin\/patients\/([^/]+)/)?.[1]
  if (!patientId || patientId === 'new') return []

  const base = `/admin/patients/${patientId}`
  const items: MenuItem[] = [
    { label: '病人資料', href: base },
    { label: '過去病歷', href: `${base}/records` },
    { label: '新增病歷', href: `${base}/records/new` },
  ]
  const editsRecord = /^\/admin\/patients\/[^/]+\/records\/[^/]+\/edit$/.test(pathname)
  if (editsRecord) items.push({ label: '修改病歷', href: pathname })
  return items
}

export default function AdminSidebar({ showDevelopment = false }: { showDevelopment?: boolean }) {
  const pathname = usePathname() ?? ''
  const visibleSections = showDevelopment ? [...sections, developmentSection] : sections
  const activeSection = visibleSections.find((section) => matchesPath(pathname, section.basePath))?.key
  const [openSections, setOpenSections] = useState<string[]>(activeSection ? [activeSection] : [])

  useEffect(() => {
    if (activeSection) {
      setOpenSections((current) => (current.includes(activeSection) ? current : [...current, activeSection]))
    }
  }, [activeSection])

  const toggle = (key: string) =>
    setOpenSections((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]))

  const itemsFor = (section: MenuSection) =>
    section.key === 'patients' ? [...section.items, ...patientContextItems(pathname)] : section.items

  // The most specific matching link wins, so only one submenu item is highlighted.
  const activeHref = visibleSections
    .flatMap(itemsFor)
    .map((item) => item.href)
    .filter((href): href is string => Boolean(href) && matchesPath(pathname, href as string))
    .sort((a, b) => b.length - a.length)[0]

  return (
    <aside className="w-64 border-r border-gray-100 bg-white px-3 py-6 hidden md:block">
      <div className="mb-5 px-2">
        <Link href="/admin" className="text-lg font-semibold text-[#355C46]">診所管理</Link>
      </div>
      <nav className="space-y-2" aria-label="後台導覽">
        {visibleSections.map((section) => {
          const Icon = section.icon
          const isOpen = openSections.includes(section.key)
          const panelId = `admin-menu-${section.key}`
          return (
            <div key={section.key} className="rounded-lg border border-gray-100">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => toggle(section.key)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold hover:bg-gray-50 ${
                  activeSection === section.key ? 'text-[#355C46]' : 'text-gray-700'
                }`}
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="flex-1">{section.label}</span>
                <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen ? (
                <ul id={panelId} className="space-y-0.5 pb-2 pl-5 pr-2">
                  {itemsFor(section).map((item) => {
                    if (!item.href) {
                      return (
                        <li key={item.label} aria-disabled="true" className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-gray-400">
                          <span>{item.label}</span>
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">規劃中</span>
                        </li>
                      )
                    }
                    const isActive = item.href === activeHref
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={isActive ? 'page' : undefined}
                          className={`block rounded-md border-l-2 px-3 py-2 text-sm ${
                            isActive
                              ? 'border-[#355C46] bg-[#EEF3EC] font-medium text-[#355C46]'
                              : 'border-transparent text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
