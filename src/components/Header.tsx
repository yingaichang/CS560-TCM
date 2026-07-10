'use client'

import { useState } from 'react'

const navigation = [
  { label: "關於我們", href: "#about" },
  { label: "養生服務", href: "#services" },
  { label: "醫師團隊", href: "#team" },
  { label: "健康專欄", href: "#articles" },
  { label: "聯繫我們", href: "#contact" },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-primary/8
        bg-cream/88
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto flex h-20 max-w-7xl
          items-center justify-between
          px-5 md:px-8
        "
      >
        <a href="#home" className="flex items-center gap-3">
          <span
            className="
              text-xl font-semibold tracking-[0.18em]
              text-primary
            "
          >
            瀛爱
          </span>

          <span
            className="
              hidden text-xs tracking-[0.12em]
              text-wood
              sm:block
            "
          >
            全人健康管理中心
          </span>
        </a>

        <nav className="hidden items-center gap-12 lg:flex">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="
                group relative py-2
                text-sm font-medium tracking-[0.05em]
                text-ink
                transition-colors duration-300 hover:text-primary
              "
            >
              {item.label}
              <span
                className="
                  absolute bottom-0 left-1/2 h-0.5 w-0
                  -translate-x-1/2
                  bg-wood-light
                  transition-all duration-300
                  group-hover:w-full
                "
              />
            </a>
          ))}
        </nav>

        <a
          href="#appointment"
          className="
            hidden rounded-full bg-primary
            px-5 py-2.5 text-sm font-medium text-white
            transition hover:bg-[#395440]
            lg:inline-flex
          "
        >
          預約諮詢
        </a>

        <button
          type="button"
          aria-label="開啟選單"
          className="
            flex h-11 w-11 items-center justify-center
            text-primary
            lg:hidden
          "
        >
          <span className="text-2xl">☰</span>
        </button>
      </div>
    </header>
  )
}
