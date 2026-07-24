import { healthStoreCategories } from '@/data/healthStorePreview'

export default function HealthStorePreviewSection() {
  return (
    <section className="relative overflow-hidden bg-[#f6f0e5] py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(214,195,165,0.2),transparent_40%),radial-gradient(circle_at_84%_80%,rgba(117,151,114,0.14),transparent_42%)]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight text-[#2e4c3d] sm:text-4xl">
            精選日常養生與居家健康用品
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#536258] md:text-base">
            商品資訊將以日常保養與生活使用情境為主，不涉及療效保證或醫療宣稱。
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {healthStoreCategories.map((category) => (
            <article
              key={category.id}
              className="flex h-full flex-col rounded-3xl border border-[#bfd0bc]/45 bg-[#fffbf5] p-6 shadow-[0_12px_28px_rgba(75,103,80,0.1)]"
            >
              <h3 className="font-display text-2xl font-semibold text-[#2f4f3f]">
                {category.title}
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-[#4f5f55]">
                {category.summary}
              </p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-[#bfd0bc]/45 bg-[#fffaf2] p-6 text-center shadow-[0_12px_26px_rgba(75,103,80,0.09)] md:p-8">
          <p className="text-base font-semibold text-[#3f6548]">商城籌備中</p>
          <p className="mt-2 text-sm leading-7 text-[#59675f] md:text-base">
            商品上架與購物流程正在規劃中，將優先提供清楚透明的品項資訊與使用建議。
          </p>

          <a
            href="/coming-soon?feature=health-store"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-[#46644d]/30 bg-[#f3f9ef] px-7 py-3.5 text-sm font-semibold text-[#3c6346] transition hover:bg-[#eaf4e5]"
          >
            了解產品規劃
          </a>
        </div>
      </div>
    </section>
  )
}