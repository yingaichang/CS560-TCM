import { coreServices } from '@/data/homepage'

const iconMap = {
  acupuncture: (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M12 3.5V20.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8.5 8.5C9.4 7.7 10.6 7.25 12 7.25C13.4 7.25 14.6 7.7 15.5 8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 14.5H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  analysis: (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 12H15.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 8.5V15.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  sleep: (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M6.5 17.5C7.6 18.6 9.2 19.25 11 19.25C14.45 19.25 17.25 16.45 17.25 13C17.25 11.2 16.6 9.6 15.5 8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.5 6.5C10.3 5.7 11.4 5.25 12.6 5.25C15.03 5.25 17 7.22 17 9.65" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5 12.5H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5 15.5H8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  women: (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <circle cx="12" cy="9.5" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 13.5V20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 17H15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  chronic: (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M5 15.5H8L9.75 11.25L12.25 16L14.25 12.75H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3.75" y="4.5" width="16.5" height="15" rx="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  senior: (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <circle cx="9" cy="9" r="2.75" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="15.5" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 18C4.5 15.51 6.51 13.5 9 13.5C11.49 13.5 13.5 15.51 13.5 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M13.5 18C13.5 16.07 15.07 14.5 17 14.5C18.93 14.5 20.5 16.07 20.5 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
}

export default function CoreServicesSection() {
  return (
    <section id="core-services" className="relative overflow-hidden bg-[#f7f2e9] py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(214,195,165,0.24),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(113,146,112,0.16),transparent_42%)]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl font-semibold leading-tight text-[#2f4f3f] sm:text-4xl">
            以中醫為核心，結合科技與長期陪伴
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {coreServices.map((service) => (
            <article
              key={service.title}
              className="group flex h-full flex-col rounded-3xl border border-[#b8c8b4]/45 bg-[#fffbf5] p-7 shadow-[0_12px_28px_rgba(76,103,80,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(76,103,80,0.13)]"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#9cb398]/45 bg-[#f2f7ee] text-[#3f6548]">
                {iconMap[service.iconKey]}
              </div>

              <h3 className="mt-5 font-display text-2xl font-semibold leading-snug text-[#2f4f3f]">
                {service.title}
              </h3>

              <p className="mt-4 max-w-[30ch] text-[15px] leading-7 text-[#506056]">
                {service.description}
              </p>

              <a
                href={service.href}
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-[#46644d]/20 bg-white/70 px-4 py-2.5 text-sm font-semibold text-[#3a6044] transition group-hover:border-[#46644d]/40 group-hover:bg-[#f6faf3] group-hover:gap-2.5"
              >
                了解更多
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}