import { membershipPreviewFeatures } from '@/data/membershipPreview'

export default function MembershipPreviewSection() {
  return (
    <section className="relative overflow-hidden bg-[#f4eee2] py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(214,195,165,0.2),transparent_40%),radial-gradient(circle_at_86%_80%,rgba(117,151,114,0.14),transparent_42%)]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
        <div className="rounded-[1.8rem] border border-[#d8ddcf] bg-[#fffdf8]/92 p-6 shadow-[0_14px_34px_rgba(82,108,87,0.1)] md:p-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[#9fb498]/45 bg-[#f1f7ee] px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[#3f6548]">
              MEMBER PREVIEW
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-[#2e4c3d] sm:text-4xl">
              建立屬於您與家人的長期健康紀錄
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {membershipPreviewFeatures.map((feature) => (
              <div
                key={feature.id}
                className="flex items-center justify-between rounded-2xl border border-[#c7d7c4]/55 bg-white/75 px-4 py-3"
              >
                <span className="text-[15px] leading-7 text-[#4f5f55]">{feature.label}</span>
                {feature.comingSoon && (
                  <span className="ml-3 inline-flex flex-shrink-0 rounded-full border border-[#aac0a5]/45 bg-[#f2f8ef] px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] text-[#476b4d]">
                    預告
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <a
              href="/coming-soon?feature=membership-program"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#46644d]/30 bg-[#f5faf1] px-7 py-3.5 text-sm font-semibold text-[#3c6346] transition hover:bg-[#ebf4e6]"
            >
              了解會員方案
              <span className="rounded-full border border-[#aac0a5]/45 bg-white px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-[#4f6f55]">
                Coming Soon
              </span>
            </a>

            <a
              href="/patient-center"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#3d6448] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(61,100,72,0.24)] transition hover:-translate-y-0.5 hover:bg-[#34563d]"
            >
              登入病人中心
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}