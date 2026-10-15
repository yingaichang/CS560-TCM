import Link from 'next/link'
import TrustIndicators from '@/components/TrustIndicators'

export default function Hero() {
  return (
    <section
      id="home"
      className="relative isolate min-h-[400px] overflow-hidden bg-[url('/images/yingai-homepage-background.png')] bg-cover bg-center bg-no-repeat sm:min-h-[440px] lg:min-h-[480px]"
    >
      {/* subtle ivory wash so hero copy stays legible without darkening the artwork */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-white/10" />

      <div className="relative z-[2] mx-auto flex min-h-[400px] max-w-7xl items-center px-6 py-6 sm:min-h-[440px] md:px-10 lg:min-h-[480px] lg:py-8 lg:pl-24 lg:pr-12">
        <div className="reveal-up max-w-[32rem] text-left lg:max-w-[620px] lg:flex-none">
          <h1 className="font-display font-semibold leading-[1.2] text-[#355C46]">
            <span className="block text-xl sm:text-2xl lg:text-3xl">以中醫智慧，</span>
            <span className="mt-1 block text-2xl sm:text-3xl lg:text-4xl">
              守護您與家人的健康
            </span>
          </h1>

          <p className="mt-2.5 max-w-xl text-xs font-medium tracking-[0.02em] text-[#59615B] sm:text-sm lg:whitespace-nowrap lg:text-xs">
            AI 體質分析 × 中醫診療 × 預防醫學 × 健康教育 × 長期健康管理
          </p>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:gap-4">
            <Link
              href="/appointments"
              className="inline-flex min-h-9 w-full items-center justify-center rounded-full bg-[#355C46] px-4 py-1.5 text-sm font-semibold text-white shadow-[0_8px_16px_rgba(53,92,70,0.2)] transition hover:-translate-y-0.5 hover:bg-[#2f503d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8f2] sm:w-auto"
            >
              立即預約
            </Link>

            <Link
              href="/ai-health-analysis"
              className="inline-flex min-h-9 w-full items-center justify-center rounded-full border border-[#A78D60]/30 bg-[#FAF8F2] px-4 py-1.5 text-sm font-semibold text-[#355C46] transition hover:bg-[#f4f1e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78D60] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8f2] sm:w-auto"
            >
              免費 AI 體質分析
            </Link>
          </div>

          <TrustIndicators />
        </div>
      </div>
    </section>
  )
}


