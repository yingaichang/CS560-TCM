import Image from 'next/image'
import TrustIndicators from '@/components/TrustIndicators'

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-[linear-gradient(160deg,#fbf8f1_0%,#f4eee2_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(214,195,165,0.28),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(126,158,121,0.16),transparent_42%)]" />

      <div className="relative z-10 mx-auto grid min-h-[640px] max-w-7xl items-center gap-12 px-6 py-16 md:min-h-[720px] md:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-12">
        <div className="reveal-up max-w-[42rem]">
          <p className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-[#faf8f2]/94 px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-primary md:text-xs">
            AI 健康分析 × 中醫診療 × 預防醫學 × 健康教育 × 長期健康管理
          </p>

          <h1 className="font-display text-[2.35rem] font-semibold leading-[1.14] text-[#355C46] sm:text-5xl lg:text-[3.6rem]">
            以中醫智慧，
            <br />
            守護您與家人的健康
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#4f5d55] md:text-lg">
            結合 AI 智慧分析、中醫專業與長期健康管理，
            從了解體質開始，陪伴您建立更適合自己的健康生活。
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#appointment"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#355C46] px-7 py-3.5 font-semibold text-white shadow-[0_12px_26px_rgba(53,92,70,0.2)] transition hover:-translate-y-0.5 hover:bg-[#2f503d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8f2] sm:w-auto"
            >
              立即預約
            </a>

            <a
              href="#about"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#A78D60]/30 bg-[#FAF8F2] px-7 py-3.5 font-semibold text-[#355C46] transition hover:bg-[#f4f1e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78D60] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8f2] sm:w-auto"
            >
              免費 AI 體質分析
            </a>
          </div>

          <TrustIndicators />
        </div>
      </div>
    </section>
  )
}


