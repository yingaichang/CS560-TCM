import Image from 'next/image'
import { communityActivities } from '@/data/homepage'

export default function CoursesCommunitySection() {
  return (
    <section className="relative overflow-hidden bg-[#f5f0e5] py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(214,195,165,0.18),transparent_38%),radial-gradient(circle_at_84%_82%,rgba(120,153,117,0.14),transparent_42%)]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
        <div className="rounded-[1.8rem] border border-[#d8ddcf] bg-[#fffdf8]/92 p-6 shadow-[0_14px_34px_rgba(82,108,87,0.1)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-[0.14em] text-[#476a4d]">課程與活動</p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-[#2e4c3d] sm:text-4xl">
                一起學習，讓健康成為家庭與社區的共同習慣
              </h2>
            </div>

            <a
              href="/courses-events"
              className="inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-[#46644d]/28 bg-[#f5faf1] px-6 py-2.5 text-sm font-semibold text-[#3b6246] transition hover:bg-[#edf5e8]"
            >
              查看所有活動
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {communityActivities.map((activity) => (
            <article
              key={activity.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#d5ddcf] bg-[#fefcf6] shadow-[0_8px_20px_rgba(75,103,80,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(75,103,80,0.13)]"
            >
              <div className="relative h-40 md:h-44">
                {/* TODO: Replace mock activity image with production asset, e.g. /images/community-activity-senior-care.webp */}
                <Image
                  src={activity.image}
                  alt={activity.title}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#23382b]/40 via-transparent to-transparent" />
              </div>

              <div className="flex flex-grow flex-col p-5">
                <h3 className="font-display text-[1.55rem] font-semibold text-[#2f4f3f]">
                  {activity.title}
                </h3>

                <div className="mt-4 space-y-2 text-sm text-[#506056]">
                  <p>
                    日期：
                    <span className="ml-1 rounded-full border border-[#a5b99f]/45 bg-[#f1f7ee] px-2.5 py-1 text-xs font-semibold text-[#3f6548]">
                      {activity.dateLabel}
                    </span>
                  </p>
                  <p>形式：{activity.format}</p>
                </div>

                <a
                  href={activity.href}
                  className="mt-5 inline-flex w-fit items-center justify-center rounded-full border border-[#46644d]/30 bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#3c6346] transition hover:bg-[#f3f9ef]"
                >
                  查看活動
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