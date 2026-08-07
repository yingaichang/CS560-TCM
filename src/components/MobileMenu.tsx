import Link from 'next/link'

import type { MainNavItem } from '@/lib/navigation'

type MobileMenuProps = {
  items: MainNavItem[]
  onClose: () => void
  onNavClick: (key: string) => void
}

export default function MobileMenu({ items, onClose, onNavClick }: MobileMenuProps) {
  return (
    <div className="border-t border-primary/10 bg-surface/95 px-5 py-4 lg:hidden">
      <nav className="max-h-[75vh] space-y-3 overflow-y-auto" aria-label="行動主導覽">
        {items.map((item) => (
          <details key={`mobile-${item.key}`} className="rounded-2xl border border-primary/10 bg-white/80 p-2">
            <summary className="list-none">
              <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-2">
                <span>{item.label}</span>
                <div className="flex items-center gap-2">
                  <Link
                    href={item.href}
                    onClick={() => onNavClick(item.key)}
                    className="rounded-full border border-primary/20 bg-white px-2.5 py-1 text-[11px] font-medium text-primary"
                  >
                    前往
                  </Link>
                  {item.children?.length ? (
                    <span className="rounded-full border border-primary/15 px-2 py-0.5 text-[10px] text-primary/80">子項目</span>
                  ) : null}
                </div>
              </div>
            </summary>

            {item.children?.length ? (
              <ul className="mt-2 space-y-1 px-2 pb-2">
                {item.children.map((child) => (
                  <li key={`mobile-${item.key}-${child.label}`}>
                    <Link
                      href={child.href}
                      onClick={onClose}
                      className="block rounded-xl px-3 py-2 text-sm text-ink/90 transition hover:bg-primary/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </details>
        ))}

        <div className="mt-2 grid grid-cols-1 gap-3 pb-1">
          <Link
            href="/#contact"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-white px-5 py-2.5 text-sm font-medium text-primary"
          >
            登入 / 註冊
          </Link>
          <Link
            href="/#appointment"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            立即預約
          </Link>
        </div>
      </nav>
    </div>
  )
}
