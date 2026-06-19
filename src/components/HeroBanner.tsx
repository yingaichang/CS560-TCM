'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HeroBanner() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-tcm-beige/30 to-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Bamboo and nature elements as SVG patterns */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-tcm-green/10 to-tcm-light-green/5 rounded-full blur-3xl"></div>
        <div className="absolute left-0 bottom-0 w-72 h-72 bg-gradient-to-tr from-tcm-beige/30 to-transparent rounded-full blur-3xl"></div>

        {/* Subtle watercolor effect */}
        <svg
          className="absolute right-10 top-20 w-64 h-64 opacity-20"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50,100 Q75,50 100,100 Q125,150 100,100 Q75,50 50,100"
            fill="none"
            stroke="#4a7c59"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        {/* Top accent */}
        <div className="mb-6 inline-block">
          <span className="text-tcm-green font-medium text-sm tracking-widest">
            傳統中醫 × 現代智慧
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-tcm-dark mb-6 leading-tight">
          以中醫智慧
          <br />
          守護您與家人的健康
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          結合古老智慧與現代科技，提供您最專業的中醫診療服務。我們致力於幫助您實現健康的生活方式。
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/#booking" className="btn-primary text-lg">
            立即預約
          </Link>
          <Link href="/#about" className="btn-secondary text-lg">
            了解診所
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 pt-12 border-t border-gray-200">
          <div>
            <p className="text-3xl font-bold text-tcm-green mb-2">15+</p>
            <p className="text-sm text-gray-600">執業年資</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-tcm-green mb-2">10K+</p>
            <p className="text-sm text-gray-600">服務患者</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-tcm-green mb-2">95%</p>
            <p className="text-sm text-gray-600">滿意度</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-tcm-green"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  )
}
