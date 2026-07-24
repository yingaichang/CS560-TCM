import Image from 'next/image'

const centerFeatures = [
  '就診紀錄與用藥紀錄',
  'AI 健康趨勢圖',
  '血壓與血糖追蹤',
  '睡眠與體重管理',
  '回診提醒與健康日誌',
]

export default function LongTermHealthManagementSection() {
  return (
    <section className="relative overflow-hidden bg-[#f4efe4] py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(214,195,165,0.2),transparent_38%),radial-gradient(circle_at_86%_82%,rgba(116,149,112,0.16),transparent_42%)]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
        <div className="rounded-[1.8rem] border border-[#d8ddcf] bg-[#fffdf7]/92 p-6 shadow-[0_14px_34px_rgba(82,108,87,0.1)] md:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <article>
              <p className="text-sm font-semibold tracking-[0.14em] text-[#476a4d]">病人健康中心</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-[#2e4c3d] sm:text-4xl">
                長期健康追蹤，
                <br />
                讓每一次努力都看得見
              </h2>

              <p className="mt-5 text-base leading-8 text-[#506056]">
                從日常紀錄到回診追蹤，整合個人健康檔案、生活趨勢與中醫照護建議，建立可持續的全人健康管理節奏。
              </p>

              <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {centerFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-2xl border border-[#c7d4c4] bg-[#f5faef] px-4 py-2.5 text-sm font-medium text-[#3f5f47]"
                  >
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="/patient-center"
                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#3d6448] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(61,100,72,0.22)] transition hover:bg-[#34563d]"
              >
                進入病人中心
              </a>
            </article>

            <article className="rounded-3xl border border-[#d4dbc9] bg-[#f9f6ee] p-4 shadow-[0_10px_24px_rgba(77,105,84,0.1)] md:p-5">
              <div className="rounded-2xl border border-[#d8dfd1] bg-white p-3">
                <div className="flex items-center justify-between border-b border-[#e5eadf] pb-3">
                  <p className="text-xs font-semibold tracking-[0.1em] text-[#4a6a50]">健康儀表板</p>
                  <span className="rounded-full border border-[#c8d5c4] bg-[#f3f8ef] px-2.5 py-1 text-[10px] font-semibold text-[#4f6f56]">
                    每日更新
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-[#dde5d7] bg-[#fafcf8] p-3">
                    <p className="text-[#6d7c71]">睡眠</p>
                    <p className="mt-1 text-lg font-semibold text-[#335542]">85</p>
                  </div>
                  <div className="rounded-xl border border-[#dde5d7] bg-[#fafcf8] p-3">
                    <p className="text-[#6d7c71]">血壓</p>
                    <p className="mt-1 text-lg font-semibold text-[#335542]">120/80</p>
                  </div>
                  <div className="rounded-xl border border-[#dde5d7] bg-[#fafcf8] p-3">
                    <p className="text-[#6d7c71]">血糖</p>
                    <p className="mt-1 text-lg font-semibold text-[#335542]">98</p>
                  </div>
                  <div className="rounded-xl border border-[#dde5d7] bg-[#fafcf8] p-3">
                    <p className="text-[#6d7c71]">體重</p>
                    <p className="mt-1 text-lg font-semibold text-[#335542]">62.5</p>
                  </div>
                </div>

                <div className="relative mt-4 h-32 overflow-hidden rounded-xl border border-[#dae3d6] bg-[#f4f9f1]">
                  <Image
                    src="/images/bamboo-4.webp"
                    alt="健康管理趨勢視覺"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover opacity-30"
                  />
                  <div className="absolute inset-x-0 bottom-5 px-4">
                    <div className="h-0.5 w-full bg-[#a6b99e]/50" />
                    <div className="mt-2 h-10 rounded-lg border border-[#c9d6c4] bg-white/80" />
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}