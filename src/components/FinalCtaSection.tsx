import Image from 'next/image'

export default function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-24">
      <Image
        // TODO: Replace with final CTA background asset, e.g. /images/hero-wellness-bamboo.webp
        src="/images/bamboo-2.webp"
        alt="晨光中的柔和竹林"
        fill
        sizes="100vw"
        className="object-cover object-center brightness-[1.08] saturate-[0.82]"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#f7f3ea]/90 via-[#f8f5ee]/82 to-[#f4efe5]/78" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#f5f0e6]/70 via-transparent to-[#faf7f1]/44" />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10 lg:px-12">
        <div className="mx-auto rounded-3xl border border-[#bfd0bc]/45 bg-[#fffaf2]/92 p-8 text-center shadow-[0_14px_32px_rgba(72,98,76,0.12)] md:p-12">
          <h2 className="font-display text-3xl font-semibold leading-tight text-[#2e4c3d] sm:text-4xl">
            從了解自己的健康開始
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#4f6056] md:text-lg">
            完成簡單的 AI 體質分析，或預約專業中醫健康評估，開始建立適合自己的長期健康計畫。
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <a
              href="/ai-health-analysis"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#3c6346] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(60,99,70,0.24)] transition hover:-translate-y-0.5 hover:bg-[#33563c]"
            >
              免費 AI 體質分析
            </a>

            <a
              href="/appointments"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#46644d]/30 bg-[#f5faf1] px-7 py-3.5 text-sm font-semibold text-[#3c6346] transition hover:bg-[#eaf4e5]"
            >
              立即預約
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}