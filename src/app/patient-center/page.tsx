import Link from 'next/link'

type PatientModule = {
  id: string
  title: string
  summary: string
  status: string
}

const patientModules: PatientModule[] = [
  {
    id: 'personal-health-records',
    title: '個人健康檔案',
    summary: '整合基本資料、體質分類、過敏史與關鍵健康目標。',
    status: 'Beta 建置中',
  },
  {
    id: 'visit-records',
    title: '就診紀錄',
    summary: '查看歷次門診摘要、醫囑重點與後續照護安排。',
    status: 'Beta 建置中',
  },
  {
    id: 'sleep-tracking',
    title: '睡眠追蹤',
    summary: '紀錄入睡時間、睡眠品質與干擾因子，提供改善提醒。',
    status: 'Beta 建置中',
  },
  {
    id: 'blood-sugar-tracking',
    title: '血糖追蹤',
    summary: '追蹤餐前餐後血糖趨勢，協助辨識生活型態影響。',
    status: 'Beta 建置中',
  },
  {
    id: 'blood-pressure-tracking',
    title: '血壓追蹤',
    summary: '依時段紀錄血壓與脈搏，提供風險變化提醒。',
    status: 'Beta 建置中',
  },
  {
    id: 'weight-management',
    title: '體重管理',
    summary: '結合飲食與活動紀錄，支援長期體重與代謝管理。',
    status: 'Beta 建置中',
  },
  {
    id: 'health-journal',
    title: '健康日誌',
    summary: '每日記錄心情、壓力、症狀與生活習慣，便於醫師追蹤。',
    status: 'Beta 建置中',
  },
  {
    id: 'medication-records',
    title: '用藥紀錄',
    summary: '管理中藥與保健品使用時程，避免遺漏與重複。',
    status: 'Beta 建置中',
  },
  {
    id: 'follow-up-reminders',
    title: '回診提醒',
    summary: '自動提醒下一次回診、複評與重要健康任務。',
    status: 'Beta 建置中',
  },
]

export default function PatientCenterPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#f8f4ec_0%,#f2ecdf_100%)]">
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-wood">PATIENT CENTER</p>
        <h1 className="mt-3 font-display text-4xl text-primary md:text-5xl">病人中心</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-ink/80">
          以個人化健康檔案為核心，整合就診、追蹤與提醒功能，協助你在日常生活中持續管理健康狀態。
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#appointment"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#395440]"
          >
            立即預約回診
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            聯絡健康管理師
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patientModules.map((module) => (
            <article
              key={module.id}
              id={module.id}
              className="scroll-mt-28 rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-[0_12px_28px_rgba(63,101,72,0.1)] backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-primary">{module.title}</h2>
                <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-medium tracking-[0.05em] text-primary/80">
                  {module.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-ink/80">{module.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
