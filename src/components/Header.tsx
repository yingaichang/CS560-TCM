'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/#services' },
    { name: 'About', href: '/#about' },
    { name: 'Team', href: '/#team' },
    { name: 'Articles', href: '/#articles' },
    { name: 'Contact', href: '/#contact' },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname === href.split('#')[0]
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-tcm-green to-tcm-light-green rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:shadow-lg transition-shadow">
              元
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-tcm-dark">YUAN</h1>
              <p className="text-xs text-gray-500">中醫診所</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-tcm-green bg-tcm-beige/50'
                    : 'text-gray-700 hover:text-tcm-green hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-2">
            <Link href="/#booking" className="hidden sm:inline-block btn-primary">
              立即預約
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-lg font-medium ${
                  isActive(item.href)
                    ? 'text-tcm-green bg-tcm-beige/50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link href="/#booking" className="block w-full btn-primary text-center">
              立即預約
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
