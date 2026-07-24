export default function AboutSection() {
  const pillars = [
    {
      title: 'AI 健康分析',
      detail: '從問卷、生活習慣與生理數據建立個人化健康輪廓。',
    },
    {
      title: '中醫診療',
      detail: '由中醫師結合脈診、問診與現代檢測，制定調理處方。',
    },
    {
      title: '預防醫學',
      detail: '針對高血壓、血糖、壓力與睡眠提供早期介入策略。',
    },
    {
      title: '健康教育',
      detail: '透過健康學院課程，建立可實踐的飲食與作息知識。',
    },
    {
      title: '長期管理',
      detail: '按月追蹤改善指標，陪伴個人與家庭持續優化生活型態。',
    },
  ]

  const audiences = [
    '希望改善睡眠、疼痛、壓力或婦科困擾者',
    '需要中醫診療與針灸服務的使用者',
    '關心高血壓、血糖與銀髮健康的家庭',
    '想要長期健康管理與預防方案的個人',
    '對養生課程與健康教育有興趣的學習者',
  ]

  return (
    <section id="about" className="relative bg-white py-20 md:py-28">
      <div className="absolute left-0 top-8 h-44 w-44 rounded-full bg-primary/5 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:px-8">
        <div>
          <span className="text-sm font-medium tracking-[0.18em] text-primary">
            PLATFORM POSITIONING
          </span>
          <h2 className="section-title mt-4">從診所網站，升級為全人健康管理平台</h2>
          <p className="section-subtitle mb-8 max-w-2xl">
            我們不是單次看診頁面，而是一個可持續擴充的照護平台。每位使用者都能得到專屬健康地圖、
            可追蹤計畫與跨領域照護服務。
          </p>

          <div className="space-y-4">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-2xl border border-primary/10 bg-surface px-5 py-4 transition hover:border-primary/25 hover:bg-[#f7f4ec]">
                <h3 className="text-base font-semibold text-primary">{pillar.title}</h3>
                <p className="mt-1 text-sm leading-7 text-ink/80">{pillar.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-3xl border border-primary/10 bg-gradient-to-br from-[#f7f3ea] via-white to-[#f0ebdd] p-7 shadow-[0_15px_40px_rgba(52,74,57,0.08)]">
          <p className="text-xs font-semibold tracking-[0.2em] text-wood">WHO WE SERVE</p>
          <h3 className="mt-3 font-display text-2xl text-primary">主要使用者場景</h3>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-ink/85">
            {audiences.map((audience) => (
              <li key={audience} className="flex gap-3 rounded-2xl border border-primary/10 bg-white/75 px-4 py-3">
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span>{audience}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-2xl border border-primary/10 bg-white/80 p-5">
            <p className="text-sm font-semibold text-primary">品牌核心理念</p>
            <p className="mt-2 text-sm leading-7 text-ink/80">
              AI 健康分析 × 中醫診療 × 預防醫學 × 健康教育 × 長期健康管理
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
