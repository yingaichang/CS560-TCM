import Link from 'next/link'

type RoutePlaceholderPageProps = {
  title: string
  description: string
  featureKey: string
}

export default function RoutePlaceholderPage({ title, description, featureKey }: RoutePlaceholderPageProps) {
  return (
    <main className="bg-[#faf8f2] px-6 py-20">
      <section className="mx-auto max-w-3xl rounded-3xl border border-primary/15 bg-white p-8 shadow-[0_12px_28px_rgba(53,92,70,0.1)] md:p-10">
        <span className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-primary">
          Coming Soon
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-primary md:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-8 text-ink/85">{description}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/coming-soon?feature=${featureKey}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2f503d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2"
          >
            查看功能規劃
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary/20 bg-[#faf8f2] px-6 py-3 text-sm font-semibold text-primary transition hover:bg-[#f3f0e7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
          >
            返回首頁
          </Link>
        </div>
      </section>
    </main>
  )
}
