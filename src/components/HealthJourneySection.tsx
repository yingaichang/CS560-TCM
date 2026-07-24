import Image from 'next/image'
import { healthJourneyCards } from '@/data/homepage'

const iconMap = {
  insight: (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M12 3.5C7.31 3.5 3.5 7.31 3.5 12C3.5 16.69 7.31 20.5 12 20.5C16.69 20.5 20.5 16.69 20.5 12C20.5 7.31 16.69 3.5 12 3.5Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.25 12H15.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 8.25V15.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  clinic: (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3.5V6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 3.5V6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.5 10.25H16.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 13V17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10 15H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  topics: (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M6 5.5H18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6 9.5H13.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6 13.5H12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M15.5 13.5L17.4 15.4L20.5 11.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  tracking: (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M4 15.5C4 11.91 6.91 9 10.5 9H13.5C17.09 9 20 11.91 20 15.5V18.5H4V15.5Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 15H11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M13 15H15.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  courses: (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 4V20" stroke="currentColor" strokeWidth="1.7" />
      <path d="M11 8H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M11 12H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M11 16H14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
}

export default function HealthJourneySection() {
  const journeyImages = [
    '/images/bamboo-3.webp',
    '/images/bamboo-4.webp',
    '/images/bamboo-5.webp',
    '/images/bamboo-6.webp',
    '/images/bamboo-2.webp',
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f7f2e9] via-[#f6f1e7] to-[#f2ecdf] py-16 md:py-20">
      <div className="pointer-events-none absolute -top-16 left-8 h-44 w-44 rounded-full bg-[#d8c8ab]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-10 h-52 w-52 rounded-full bg-[#9fb89a]/25 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight text-[#2f4f3f] sm:text-4xl">
            從今天開始，選擇您的健康旅程
          </h2>
          <p className="mt-5 text-base leading-8 text-[#4e6054] md:text-lg">
            無論您想了解自己的體質、改善健康問題、安排專業診療，或進行長期追蹤，我們都會引導您找到適合的下一步。
          </p>
        </div>

        <div className="mt-10 rounded-[1.8rem] border border-[#dde3d7] bg-[#fffdf8]/92 p-4 shadow-[0_12px_28px_rgba(82,108,87,0.08)] md:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
          {healthJourneyCards.map((card, index) => {
            return (
              <article
                key={card.title}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#d9e0d3] bg-[#fefcf7] opacity-0 shadow-[0_8px_18px_rgba(86,116,95,0.06)] transition duration-300 [animation:revealUp_0.72s_ease-out_forwards] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(86,116,95,0.1)] lg:h-[366px]"
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <div className="relative h-36 overflow-hidden border-b border-[#dee5da] bg-[#eff4eb] md:h-40 lg:h-32">
                  <Image
                    src={journeyImages[index % journeyImages.length]}
                    alt={card.title}
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover saturate-[0.68] brightness-[1.03] contrast-[0.9] transition duration-500 group-hover:scale-105 group-hover:saturate-[0.74]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#24372b]/24 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#cedacc]/65 bg-[#f7fbf4]/94 text-[#3f6548]">
                    {iconMap[card.iconKey]}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4 lg:p-3.5">
                  <h3 className="font-display text-[1.36rem] font-semibold leading-[1.25] text-[#2f4f3f] lg:text-[1.22rem]">
                    {card.title}
                  </h3>

                  <p className="mt-2.5 min-h-[72px] text-[13px] leading-[1.65] text-[#4f5f55] lg:min-h-[96px]">
                    {card.description}
                  </p>

                  <a
                    href={card.href}
                    className="mt-auto inline-flex items-center justify-between rounded-full border border-[#47674f]/25 bg-[#f7fbf4] px-3.5 py-2 text-[13px] font-semibold text-[#375d42] transition group-hover:border-[#47674f]/45 group-hover:bg-[#eef7ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e6648] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff9f0]"
                  >
                    <span>{card.buttonText}</span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#8ea88a]/40 bg-white/90">
                      →
                    </span>
                  </a>
                </div>
              </article>
            )
          })}
          </div>
        </div>
      </div>
    </section>
  )
}