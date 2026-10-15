'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import MobileMenu from '@/components/MobileMenu'
import ClerkAuthControls from '@/components/ClerkAuthControls'
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
    if (pathname === '/appointments') {
      setActiveKey('appointments')
      return
    }

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

    if (pathname === '/appointments') {
      setActiveKey('appointments')
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
          mx-auto flex h-[72px] max-w-[1320px]
          items-center justify-between
          px-4 md:px-6 lg:px-8
        "
      >
        <Link href="/#home" className="flex items-center gap-2 xl:gap-2.5">
          <Image
            src="/images/ai-tcm-health-management-center-logo.png"
            alt="愛中醫健康管理中心 Logo"
            width={36}
            height={36}
            className="h-8 w-8 rounded-full border border-primary/20 bg-white object-contain shadow-sm xl:h-9 xl:w-9"
          />
          <span className="hidden md:block">
            <strong className="block text-[11px] font-semibold tracking-[0.12em] text-primary xl:text-xs xl:tracking-[0.14em]">
              愛中醫健康管理中心
            </strong>
            <span className="font-brand block text-[9px] tracking-[0.06em] text-wood xl:text-[10px] xl:tracking-[0.08em]">
              AI TCM HEALTH MANAGEMENT CENTER
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
                      rounded-3xl border border-[#d8e1cf] bg-[#fcf7ee] p-4 shadow-[0_18px_38px_rgba(62,80,57,0.12)]
                      opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100
                      group-focus-within:visible group-focus-within:opacity-100
                    "
                    style={{ width: item.children.length > 6 ? '520px' : '280px' }}
                  >
                    <p className="px-2 pb-3 text-[11px] font-semibold tracking-[0.14em] text-[#365e45]">
                      {item.label}
                    </p>
                    <ul className={`gap-2 ${item.children.length > 6 ? 'grid grid-cols-2' : 'space-y-2'}`}>
                      {item.children.map((child) => (
                        <li key={`${item.key}-${child.label}`}>
                          <Link
                            href={child.href}
                            onClick={() => handleNavClick(item.key)}
                            className="flex items-center justify-between rounded-2xl border border-[#d9e4d1] bg-white px-3 py-2 text-sm font-medium text-[#264432] transition hover:bg-[#ebf4e8] hover:text-[#1f3e2e]"
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

        <ClerkAuthControls className="ml-auto mr-3 lg:ml-0 lg:mr-0" />

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
