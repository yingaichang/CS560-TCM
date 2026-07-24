import { testimonialCategories, testimonials } from '@/data/testimonials'

export default function PatientTestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-[#f6f1e7] py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(214,195,165,0.18),transparent_38%),radial-gradient(circle_at_84%_82%,rgba(120,153,117,0.14),transparent_42%)]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold leading-tight text-[#2e4c3d] sm:text-4xl">
            真實健康歷程與生活改變
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#536258] md:text-base">
            我們重視個人隱私與醫療倫理，僅展示經明確授權可公開之病人經驗內容。
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {testimonialCategories.map((item) => {
            const categoryTestimonials = testimonials.filter(
              (testimonial) => testimonial.categoryId === item.id && testimonial.consentGiven,
            )

            return (
              <article
                key={item.id}
                className="flex h-full flex-col rounded-3xl border border-[#bfd0bc]/45 bg-[#fffbf5] p-7 shadow-[0_12px_28px_rgba(75,103,80,0.1)]"
              >
                <span className="inline-flex w-fit rounded-full border border-[#9fb498]/45 bg-[#f1f7ee] px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[#3f6548]">
                  {item.category}
                </span>

                {categoryTestimonials.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {categoryTestimonials.slice(0, 1).map((testimonial) => (
                      <p key={testimonial.id} className="text-[15px] leading-7 text-[#4f5f55]">
                        {testimonial.content}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 rounded-2xl border border-dashed border-[#b5c6b2] bg-[#f7fbf4] px-4 py-4 text-[15px] leading-7 text-[#5a675f]">
                    {item.placeholder}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}