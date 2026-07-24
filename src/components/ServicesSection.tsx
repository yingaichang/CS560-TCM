interface Service {
  id: string
  icon: string
  title: string
  description: string
  tag: string
}

const services: Service[] = [
  {
    id: 'ai-health-profile',
    icon: '01',
    title: 'AI 健康分析引擎',
    tag: 'Assessment',
    description:
      '以 AI 與中醫體質理論整合問卷、生活型態與症狀資料，生成個人健康風險地圖與優先改善建議。',
  },
  {
    id: 'integrated-tcm-care',
    icon: '02',
    title: '中醫診療與針灸照護',
    tag: 'Clinical Care',
    description:
      '中醫師依個人狀態安排門診、針灸、推拿與藥膳建議，讓治療從單點處置轉為完整照護路徑。',
  },
  {
    id: 'chronic-monitoring',
    icon: '03',
    title: '慢性健康監測模組',
    tag: 'Monitoring',
    description:
      '追蹤血壓、血糖、睡眠、壓力與疼痛等關鍵指標，提供週期提醒與異常回報機制。',
  },
  {
    id: 'health-academy',
    icon: '04',
    title: '健康學院與課程系統',
    tag: 'Education',
    description:
      '透過主題講座、工作坊與影片學習，協助使用者把健康知識轉化為每天可實踐的習慣。',
  },
  {
    id: 'family-plan',
    icon: '05',
    title: '家庭健康管理帳戶',
    tag: 'Family Plan',
    description:
      '支援家庭共同追蹤與跨世代健康管理，特別適合銀髮照護與親子同步維護日常健康。',
  },
]

export default function ServicesSection() {
  return (
    <section id="services" className="bg-[linear-gradient(180deg,#f6f1e8_0%,#f1ecdf_100%)] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-medium tracking-[0.18em] text-primary">CORE MODULES</span>
          <h2 className="section-title mt-4">可持續擴充的五大平台模組</h2>
          <p className="section-subtitle mx-auto mb-14 max-w-3xl">
            每個模組可獨立運作，也可串接成完整健康旅程，從首次評估到長期照護都能持續擴充。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="group flex flex-col rounded-3xl border border-primary/10 bg-white/75 p-7 shadow-[0_12px_35px_rgba(70,100,77,0.1)] transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_20px_45px_rgba(70,100,77,0.16)]"
            >
              <div className="mb-5 flex items-start justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 text-lg font-semibold text-primary">
                  {service.icon}
                </div>
                <span className="rounded-full border border-primary/15 px-3 py-1 text-xs font-medium tracking-[0.08em] text-primary/80">
                  {service.tag}
                </span>
              </div>

              <h3 className="text-2xl font-semibold text-primary">
                {service.title}
              </h3>
              <p className="mt-4 flex-grow text-sm leading-7 text-ink/80">
                {service.description}
              </p>

              <a
                href="#appointment"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:gap-3"
              >
                了解模組方案
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl border border-primary/15 bg-[#FAF8F2] px-6 py-8 text-center md:px-10">
          <p className="text-base text-ink/85 md:text-lg">
            需要企業健康方案、社區課程或跨院區部署？我們提供平台型客製化服務。
          </p>
          <a href="#contact" className="btn-primary mt-5">
            與平台顧問洽談
          </a>
        </div>
      </div>
    </section>
  )
}
