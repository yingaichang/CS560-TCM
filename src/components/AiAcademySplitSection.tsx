import Image from 'next/image'
import { healthAcademyTopics } from '@/data/homepage'

const aiHighlights = [
  'AI 體質分析',
  'AI 健康評估',
  'AI 飲食建議',
  'AI 養生建議',
  'AI 健康報告',
]

export default function AiAcademySplitSection() {
  return (
    <section className="relative overflow-hidden bg-[#f5f0e5] py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(214,195,165,0.2),transparent_38%),radial-gradient(circle_at_84%_82%,rgba(120,153,117,0.14),transparent_42%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-5 px-6 md:px-10 lg:grid-cols-2 lg:px-12">
        <article className="rounded-[1.8rem] border border-[#d8ddcf] bg-[#fffdf8]/92 p-6 shadow-[0_14px_34px_rgba(82,108,87,0.1)] md:p-8">
          <p className="text-sm font-semibold tracking-[0.14em] text-[#476a4d]">AI 健康分析中心</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-[#2f4f3f] sm:text-4xl">
            科技結合中醫智慧，
            <br />
            為您提供個人化健康建議
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#506056] md:text-base">
            AI 整合問卷與日常紀錄，提供健康教育與生活管理方向，後續可銜接專業中醫評估。
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {aiHighlights.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#c8d6c4] bg-[#f3f8ef] px-4 py-3 text-sm font-medium text-[#3f5f47]"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="relative mt-6 h-48 overflow-hidden rounded-2xl border border-[#d7dfd2] bg-[#f4f8ef]">
            <Image
              src="/images/bamboo-4.webp"
              alt="AI 健康分析視覺"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#eff6ea]/80 via-transparent to-[#f5efe2]/75" />
          </div>

          <a
            href="/ai-health-analysis"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#3d6448] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(61,100,72,0.22)] transition hover:bg-[#34563d]"
          >
            開始 AI 分析
          </a>
        </article>

        <article className="rounded-[1.8rem] border border-[#d8ddcf] bg-[#fffdf8]/92 p-6 shadow-[0_14px_34px_rgba(82,108,87,0.1)] md:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.14em] text-[#476a4d]">健康學院</p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-[#2f4f3f] sm:text-4xl">
                學習中醫養生觀念，
                <br />
                提升健康生活品質
              </h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {healthAcademyTopics.slice(0, 6).map((topic) => (
              <a
                key={topic.id}
                href={topic.href}
                className="group overflow-hidden rounded-2xl border border-[#d5ddcf] bg-[#fefcf6] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(75,103,80,0.12)]"
              >
                <div className="relative h-24 border-b border-[#d8e2d5] bg-[#eef4ea] md:h-28">
                  <Image
                    src={topic.image}
                    alt={topic.title}
                    fill
                    sizes="(min-width: 1280px) 16vw, (min-width: 768px) 24vw, 48vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="font-display text-lg font-semibold text-[#2e4c3d]">{topic.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#5a675f]">{topic.category}</p>
                </div>
              </a>
            ))}
          </div>

          <a
            href="/health-academy"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#46644d]/28 bg-[#f5faf1] px-7 py-3 text-sm font-semibold text-[#3b6246] transition hover:bg-[#edf5e8]"
          >
            瀏覽更多學程
          </a>
        </article>
      </div>
    </section>
  )
}
