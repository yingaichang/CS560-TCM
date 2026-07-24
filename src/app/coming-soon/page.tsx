'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const featureLabels: Record<string, string> = {
  'doctor-introduction': '醫師介紹',
  'clinic-philosophy': '診所理念',
  'professional-certifications': '專業證照',
  specialties: '專長項目',
  'success-cases': '成功案例',
  'clinic-environment': '診所環境',
  'first-visit': '初診服務',
  'follow-up-visit': '複診服務',
  acupuncture: '針灸治療',
  'tcm-regulation': '中醫調理',
  'pain-management': '疼痛管理',
  'sleep-support': '睡眠調理',
  'womens-health': '女性健康',
  'chronic-health-management': '慢性病健康管理',
  'ai-health-analysis': 'AI 健康分析',
  'ai-body-constitution': 'AI 體質分析',
  'ai-health-assessment': 'AI 健康評估',
  'ai-wellness-advice': 'AI 養生建議',
  'ai-diet-advice': 'AI 飲食建議',
  'ai-acupoint-advice': 'AI 穴位建議',
  'ai-health-report': 'AI 健康報告',
  'seasonal-wellness': '四季養生',
  baduanjin: '八段錦',
  'academy-womens-health': '女性健康',
  'academy-diabetes': '糖尿病專區',
  'academy-hypertension': '高血壓專區',
  'academy-sleep': '睡眠專區',
  'academy-emotion-stress': '情緒壓力管理',
  'academy-acupoint-care': '穴位保健',
  'academy-wellness-tea': '養生茶專區',
  'online-courses': '線上課程',
  'health-seminars': '健康講座',
  'senior-wellness-courses': '銀髮養生課程',
  'womens-regulation-courses': '女性調理課程',
  'baduanjin-courses': '八段錦課程',
  'live-streaming': '線上直播',
  'community-events': '社區活動',
  'wellness-tea': '養生茶',
  'herbal-meal-pack': '藥膳包',
  'mugwort-products': '艾草產品',
  'heat-therapy-products': '熱敷產品',
  'healthcare-products': '保健產品',
  'wellness-gift-boxes': '健康禮盒',
  'patient-center': '病人中心',
  'personal-health-records': '個人健康檔案',
  'visit-records': '就診紀錄',
  'sleep-tracking': '睡眠追蹤',
  'blood-sugar-tracking': '血糖追蹤',
  'blood-pressure-tracking': '血壓追蹤',
  'weight-management': '體重管理',
  'health-journal': '健康日誌',
  'medication-records': '用藥紀錄',
  'follow-up-reminders': '回診提醒',
}

function ComingSoonContent() {
  const searchParams = useSearchParams()
  const feature = searchParams.get('feature') || ''
  const featureLabel = featureLabels[feature] || '此功能'

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#f8f4ec_0%,#f2ecdf_100%)] px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-primary/15 bg-white/85 p-8 text-center shadow-[0_18px_45px_rgba(63,101,72,0.14)] backdrop-blur-sm md:p-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-wood">COMING SOON</p>
        <h1 className="mt-4 font-display text-3xl text-primary md:text-4xl">{featureLabel}</h1>
        <p className="mt-4 text-base leading-8 text-ink/80">
          我們正在建置此頁面，將提供完整的 AI 全人健康管理內容與服務體驗。
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#395440]"
          >
            回首頁
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center rounded-full border border-primary/25 bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            聯絡我們
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function ComingSoonPage() {
  return (
    <Suspense
      fallback={(
        <main className="min-h-screen bg-[linear-gradient(160deg,#f8f4ec_0%,#f2ecdf_100%)] px-4 py-16">
          <div className="mx-auto max-w-2xl rounded-3xl border border-primary/15 bg-white/85 p-8 text-center shadow-[0_18px_45px_rgba(63,101,72,0.14)] backdrop-blur-sm md:p-10">
            <p className="text-sm text-ink/75">載入中...</p>
          </div>
        </main>
      )}
    >
      <ComingSoonContent />
    </Suspense>
  )
}
