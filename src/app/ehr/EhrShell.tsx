'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import ClerkAuthControls from '@/components/ClerkAuthControls'
import {
  Activity, CalendarDays, ClipboardPlus, FileText, LayoutDashboard, Menu, NotebookPen,
  Pill, ReceiptText, Settings, UsersRound, X,
} from 'lucide-react'

const navigation = [
  { label: 'Dashboard', href: '/ehr', icon: LayoutDashboard },
  { label: 'Patients', href: '/ehr/patients', icon: UsersRound },
  { label: 'Patient Intake', href: '/ehr/intake', icon: ClipboardPlus },
  { label: 'Encounters', href: '/ehr/encounters', icon: CalendarDays },
  { label: 'TCM Clinical Notes', href: '/ehr/notes', icon: NotebookPen },
  { label: 'Treatments', href: '/ehr/treatments', icon: Activity },
  { label: 'Medications', href: '/ehr/medications', icon: Pill },
  { label: 'Billing / CPT', href: '/ehr/billing', icon: ReceiptText },
  { label: 'Documents', href: '/ehr/documents', icon: FileText },
  { label: 'Settings', href: '/ehr/settings', icon: Settings },
]

export default function EhrShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const active = navigation.find((item) => item.href === pathname || (item.href !== '/ehr' && pathname.startsWith(`${item.href}/`)))

  return (
    <div className="ehr-app">
      <div className="ehr-frame">
        <aside className={`ehr-sidebar${menuOpen ? ' ehr-sidebar-open' : ''}`}>
          <div className="ehr-brand">
            <div className="ehr-brand-mark">
              <div className="ehr-brand-icon">瀛</div>
              <div className="ehr-brand-name">YING AI <small>瀛愛 · CLINICAL WORKSPACE</small></div>
            </div>
          </div>
          <div className="ehr-nav-label">CLINICAL</div>
          <nav className="ehr-nav" aria-label="EHR navigation">
            {navigation.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="ehr-nav-link"
                aria-current={active?.href === href ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <Icon aria-hidden="true" />{label}
              </Link>
            ))}
          </nav>
          <div className="ehr-sidebar-foot">YING AI · 瀛愛<br />Clinical operations · Phase 1</div>
        </aside>
        <div className="ehr-main">
          <header className="ehr-topbar">
            <button className="ehr-mobile-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="ehr-top-title">Clinical workspace <span aria-hidden="true">/</span> {active?.label ?? 'Patient profile'}</div>
            <div className="ehr-top-actions">
              <span className="ehr-demo-chip">DEVELOPMENT · SYNTHETIC DATA</span>
              <ClerkAuthControls className="ehr-clerk-controls" />
            </div>
          </header>
          <main className="ehr-content">{children}</main>
        </div>
      </div>
    </div>
  )
}