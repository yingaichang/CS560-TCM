import Image from 'next/image'
import { healthAcademyTopics } from '@/data/homepage'

export default function HealthAcademySection() {
  return (
    <section className="relative overflow-hidden bg-[#f6f1e7] py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(212,194,162,0.22),transparent_38%),radial-gradient(circle_at_84%_78%,rgba(120,153,117,0.14),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
        <div className="rounded-[1.8rem] border border-[#d8ddcf] bg-[#fffdf8]/92 p-6 shadow-[0_14px_34px_rgba(82,108,87,0.1)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-[0.14em] text-[#476a4d]">健康學院</p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-[#2f4f3f] sm:text-4xl">
                把健康知識，變成每天做得到的生活方式
              </h2>
            </div>

            <a
              href="/health-academy"
              className="inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-[#46644d]/28 bg-[#f5faf1] px-6 py-2.5 text-sm font-semibold text-[#3b6246] transition hover:bg-[#edf5e8]"
            >
              進入健康學院
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {healthAcademyTopics.map((topic) => (
            <article
              key={topic.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#d5ddcf] bg-[#fefcf6] shadow-[0_8px_20px_rgba(75,103,80,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(75,103,80,0.13)]"
            >
              <div className="relative h-28 border-b border-[#d8e2d5] bg-[#eef4ea] md:h-32">
                {/* TODO: Replace mock topic image with production asset, e.g. /images/health-academy-sleep.webp */}
                <Image
                  src={topic.image}
                  alt={topic.title}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-grow flex-col p-4">
                <h3 className="font-display text-xl font-semibold text-[#2e4c3d]">
                  {topic.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#506056]">
                  {topic.summary}
                </p>

                <a
                  href={topic.href}
                  className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#3c6346] transition group-hover:gap-2.5"
                >
                  查看
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                    <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}