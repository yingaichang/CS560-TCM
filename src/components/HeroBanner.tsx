import Image from 'next/image'
import TrustIndicators from '@/components/TrustIndicators'

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-[linear-gradient(160deg,#fbf8f1_0%,#f4eee2_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(214,195,165,0.28),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(126,158,121,0.16),transparent_42%)]" />
      <div className="pointer-events-none absolute -left-4 top-10 hidden h-72 w-48 opacity-26 lg:block">
        <Image
          src="/images/bamboo-1.webp"
          alt=""
          fill
          sizes="220px"
          className="object-cover object-left"
          aria-hidden="true"
        />
      </div>

      <div className="pointer-events-none absolute right-0 top-10 hidden h-72 w-52 opacity-34 lg:block">
        <Image
          src="/images/bamboo-2.webp"
          alt=""
          fill
          sizes="220px"
          className="object-cover object-right"
          aria-hidden="true"
        />
      </div>

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

        <aside className="reveal-up-delayed rounded-[2rem] border border-primary/12 bg-[#fffdf8]/94 p-5 shadow-[0_18px_38px_rgba(53,92,70,0.13)] lg:p-6">
          <div className="relative overflow-hidden rounded-[1.4rem] border border-primary/10 bg-[#f7f1e3]">
            <div className="absolute inset-0 bg-gradient-to-t from-[#f8f2e6]/58 via-[#f8f2e6]/8 to-transparent" />
            <div className="absolute left-3 top-3 rounded-full bg-[#faf8f2]/90 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-primary">
              東方茶空間
            </div>
            <Image
              // TODO: Replace with final hero visual asset, e.g. /images/hero-wellness-bamboo.webp
              src="/images/bamboo-7.webp"
              alt="晨光中的竹林與東方茶空間"
              width={820}
              height={560}
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-[260px] w-full object-cover object-center md:h-[300px]"
            />
          </div>

          <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-wood">HEALTH PULSE</p>
          <h2 className="mt-3 font-display text-2xl text-primary">個人健康儀表板</h2>
          <p className="mt-2 text-sm leading-7 text-ink/80">
            首次完成問卷後，系統會整合睡眠、壓力、疼痛、血壓與血糖趨勢，生成您的 90 天改善路徑。
          </p>

          <div className="mt-6 space-y-3">
            {[
              ['睡眠品質分數', '完成問卷後顯示', '依個人日常紀錄更新'],
              ['壓力平衡指數', '連動資料後顯示', '提供呼吸與作息建議'],
              ['慢性風險提醒', '醫師評估後顯示', '搭配定期複評追蹤'],
            ].map(([name, value, hint]) => (
              <div key={name} className="rounded-2xl border border-primary/10 bg-[#ffffff] p-4">
                <div className="flex items-end justify-between gap-3">
                  <p className="text-sm font-medium text-ink">{name}</p>
                  <p className="text-lg font-semibold text-primary">{value}</p>
                </div>
                <p className="mt-1 text-xs text-ink/70">{hint}</p>
              </div>
            ))}
          </div>

          <a
            href="#services"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-primary/15 bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2f503d]"
          >
            查看完整平台方案
          </a>
        </aside>
      </div>
    </section>
  )
}


