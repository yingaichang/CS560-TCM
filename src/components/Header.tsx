'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import MobileMenu from '@/components/MobileMenu'
import { MAIN_NAV_ITEMS } from '@/lib/navigation'

const HASH_ACTIVE_MAP: Record<string, string> = {
  '#home': 'home',
  '#about': 'about',
  '#services': 'services',
  '#articles': 'academy',
  '#team': 'events',
  '#appointment': 'services',
  '#contact': 'home',
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeKey, setActiveKey] = useState('home')
  const pathname = usePathname()

  useEffect(() => {
    const updateScrollState = () => {
      setIsScrolled(window.scrollY > 8)
    }

    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  useEffect(() => {
    if (pathname === '/payment') {
      setActiveKey('shop')
      return
    }

    if (pathname === '/patient-center') {
      setActiveKey('patient-center')
      return
    }

    if (pathname === '/coming-soon') {
      const params = new URLSearchParams(window.location.search)
      const feature = params.get('feature')

      if (feature?.startsWith('ai-')) {
        setActiveKey('ai-analysis')
        return
      }

      if (feature === 'patient-center' || feature?.includes('tracking') || feature?.includes('records')) {
        setActiveKey('patient-center')
        return
      }

      if (feature?.includes('course') || feature?.includes('seminar') || feature?.includes('live') || feature?.includes('community')) {
        setActiveKey('events')
        return
      }

      if (feature?.includes('tea') || feature?.includes('products') || feature?.includes('gift')) {
        setActiveKey('shop')
        return
      }

      if (feature?.includes('academy') || feature === 'baduanjin' || feature?.includes('seasonal')) {
        setActiveKey('academy')
        return
      }

      if (feature?.includes('visit') || feature?.includes('management') || feature === 'acupuncture') {
        setActiveKey('services')
        return
      }

      setActiveKey('about')
      return
    }

    if (pathname === '/') {
      const hash = window.location.hash
      setActiveKey(HASH_ACTIVE_MAP[hash] || 'home')
      return
    }

    setActiveKey('home')
  }, [pathname])

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.pathname === '/') {
        setActiveKey(HASH_ACTIVE_MAP[window.location.hash] || 'home')
      }
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const handleNavClick = (key: string) => {
    setActiveKey(key)
    setIsOpen(false)
  }

  return (
    <header
      className="
        sticky top-0 z-50 border-b border-primary/10
        bg-[rgba(250,248,242,0.94)] backdrop-blur-sm
        transition-shadow duration-300
        data-[scrolled=true]:shadow-[0_6px_16px_rgba(53,92,70,0.1)]
      "
      data-scrolled={isScrolled}
    >
      <div
        className="
          mx-auto flex h-[82px] max-w-[1320px]
          items-center justify-between
          px-4 md:px-6 lg:px-8
        "
      >
        <Link href="/#home" className="flex items-center gap-2.5 xl:gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-white text-base font-semibold text-primary shadow-sm xl:h-11 xl:w-11 xl:text-lg">
            瀛
          </span>
          <span className="hidden md:block">
            <strong className="block text-xs font-semibold tracking-[0.14em] text-primary xl:text-sm xl:tracking-[0.16em]">
              瀛愛全人健康管理中心
            </strong>
            <span className="font-brand block text-[10px] tracking-[0.08em] text-wood xl:text-[12px] xl:tracking-[0.1em]">
              WELLSPRING Wellness Center
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-4 xl:gap-5 lg:flex" aria-label="主導覽">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = activeKey === item.key

            return (
              <div key={item.key} className="group relative">
                <Link
                  href={item.href}
                  onClick={() => handleNavClick(item.key)}
                  className="
                    relative inline-flex items-center py-2 text-[13px] font-medium tracking-[0.03em]
                    text-ink transition-colors duration-300 hover:text-primary
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35
                    focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f3eb]
                  "
                >
                  {item.label}
                  <span
                    className={`
                      absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-primary/55 transition-all duration-300
                      ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                    `}
                  />
                </Link>

                {item.children && item.children.length > 0 ? (
                  <div
                    aria-label={`${item.label} 子選單`}
                    className="
                      invisible absolute left-1/2 top-[calc(100%+10px)] z-50 -translate-x-1/2
                      rounded-2xl border border-primary/10 bg-[#faf8f2] p-4 opacity-0 shadow-[0_14px_30px_rgba(53,92,70,0.12)]
                      transition duration-200 group-hover:visible group-hover:opacity-100
                      group-focus-within:visible group-focus-within:opacity-100
                    "
                    style={{ width: item.children.length > 6 ? '480px' : '260px' }}
                  >
                    <p className="px-2 pb-2 text-[11px] font-semibold tracking-[0.14em] text-wood">{item.label}</p>
                    <ul className={`gap-1.5 ${item.children.length > 6 ? 'grid grid-cols-2' : 'space-y-1.5'}`}>
                      {item.children.map((child) => (
                        <li key={`${item.key}-${child.label}`}>
                          <Link
                            href={child.href}
                            onClick={() => handleNavClick(item.key)}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-ink transition hover:bg-primary/8 hover:text-primary"
                          >
                            <span>{child.label}</span>
                            {child.comingSoon ? (
                              <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium tracking-[0.06em] text-primary/75">
                                Soon
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Link
            href="/#contact"
            className="inline-flex min-w-[108px] items-center justify-center rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f3eb]"
          >
            登入 / 註冊
          </Link>
          <Link
            href="/#appointment"
            className="inline-flex min-w-[108px] items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(70,100,77,0.25)] transition hover:bg-[#395440] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f3eb]"
          >
            立即預約
          </Link>
        </div>

        <button
          type="button"
          aria-label="開啟選單"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="
            flex h-11 w-11 items-center justify-center
            rounded-full border border-primary/20 bg-white text-primary
            lg:hidden
          "
        >
          <span className="text-2xl">☰</span>
        </button>
      </div>

      {isOpen ? (
        <MobileMenu
          items={MAIN_NAV_ITEMS}
          onClose={() => setIsOpen(false)}
          onNavClick={handleNavClick}
        />
      ) : null}
    </header>
  )
}
