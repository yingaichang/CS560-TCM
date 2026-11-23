import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  CalendarDays,
  Check,
  CircleHelp,
  Clock3,
  MapPin,
  Users,
} from 'lucide-react'

export const metadata: Metadata = {
  title: '繼續教育課程與報名資訊',
  description: '了解中醫臨床進修課程規劃、學分認證資訊與報名流程。',
}

const courseHighlights = [
  { icon: BookOpenCheck, label: '課程主題', value: '臨床辨證與病例紀錄' },
  { icon: Award, label: '繼續教育學分', value: '依認證核定公告' },
  { icon: CalendarDays, label: '開課時間', value: '即將公布' },
  { icon: MapPin, label: '課程形式', value: '線上或實體，依課程公告' },
]

const learningPoints = [
  '整理四診資訊，建立清楚、可追溯的病例紀錄架構。',
  '練習將辨證思路轉化為合宜的照護目標與追蹤計畫。',
  '討論臨床溝通、紀錄品質與病人安全的實務要點。',
]

const registrationSteps = [
  { number: '01', title: '確認課程公告', text: '查看課程日期、授課方式、適用對象與 繼續教育認證狀態。' },
  { number: '02', title: '提交報名資料', text: '正式開放後，依課程頁指示填寫必要資料並確認個資用途。' },
  { number: '03', title: '完成課程與簽到', text: '依規定完成出席與課後要求，作為後續學分或證明核發依據。' },
]

const faqs = [
  {
    question: '這堂課目前已取得 繼續教育認證了嗎？',
    answer: '目前仍是課程內容規劃示意，認證單位與核定時數尚待確認。正式招生前會在此頁明確標示認證狀態。',
  },
  {
    question: '完成課程就一定會取得學分或證書嗎？',
    answer: '學分與證明須依認證規範、出席紀錄及課後要求核發；未完成核定前，本頁不承諾學分或證書。',
  },
  {
    question: '現在可以報名或付款嗎？',
    answer: '正式報名、收費與證書流程尚未開放。請先洽詢課程規劃，待公告正式資訊後再依指示報名。',
  },
]

export default function CoursesEventsPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <section className="relative overflow-hidden border-b border-primary/10 bg-[radial-gradient(circle_at_85%_10%,rgba(167,141,96,0.18),transparent_32%),linear-gradient(135deg,#faf8f2_0%,#eef3ec_100%)] px-5 py-16 sm:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-primary">
              <Award size={15} aria-hidden="true" /> 專業進修・繼續教育
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight text-primary sm:text-5xl md:text-6xl">
              讓臨床經驗，成為持續精進的力量
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-ink/75 sm:text-lg">
              以中醫臨床實務為核心，規劃重視辨證思考、病例紀錄與病人安全的進修課程。課程資訊、認證狀態與報名方式將於正式核定後公告。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#course-details" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2f503d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2">
                查看課程規劃 <ArrowRight size={16} aria-hidden="true" />
              </a>
              <Link href="/#contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary/25 bg-white/70 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2">
                洽詢課程資訊
              </Link>
            </div>
            <p className="mt-4 text-xs leading-6 text-ink/60">此頁為課程內容設計稿；尚未開放正式報名、收費或 繼續教育學分核發。</p>
          </div>

          <aside className="rounded-[2rem] border border-primary/10 bg-white/90 p-6 shadow-[0_22px_60px_rgba(53,92,70,0.12)] backdrop-blur sm:p-8" aria-label="課程資訊摘要">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-[#f5efe4] px-3 py-1 text-xs font-semibold text-[#806b46]">課程規劃中</span>
                <h2 className="mt-4 font-display text-2xl font-semibold leading-snug text-primary">臨床辨證與病例紀錄</h2>
                <p className="mt-2 text-sm leading-6 text-ink/65">從四診資訊整理到照護計畫的實務工作坊</p>
              </div>
              <div className="hidden rounded-2xl bg-[#e9efe7] p-3 text-primary sm:block"><BookOpenCheck size={25} aria-hidden="true" /></div>
            </div>
            <div className="mt-6 divide-y divide-primary/10">
              {courseHighlights.map(({ icon: Icon, label, value }) => (
                <div className="flex items-center gap-3 py-4" key={label}>
                  <span className="rounded-xl bg-[#f5f7f3] p-2.5 text-primary"><Icon size={17} aria-hidden="true" /></span>
                  <div className="min-w-0"><p className="text-xs text-ink/55">{label}</p><p className="mt-1 text-sm font-medium text-ink">{value}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
              <CircleHelp size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>學分時數、認證單位、日期、費用與證書條件，須依正式核定公告為準。</p>
            </div>
          </aside>
        </div>
      </section>

      <section id="course-details" className="scroll-mt-8 px-5 py-16 sm:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a7651]">課程總覽</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-primary sm:text-4xl">把學習帶回日常臨床</h2>
            <p className="mt-5 leading-8 text-ink/70">以案例討論與實務練習，協助醫事人員回顧辨證、紀錄與追蹤流程。課程設計著重專業反思與病人安全，不取代個別診療判斷或主管機關規範。</p>
            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-primary/10 bg-white p-5">
              <Users className="mt-1 shrink-0 text-primary" size={19} aria-hidden="true" />
              <div><h3 className="font-semibold text-primary">適合對象</h3><p className="mt-1 text-sm leading-6 text-ink/70">中醫師及相關醫事人員；實際報名資格以正式課程與認證規範為準。</p></div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-primary/10 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="font-display text-2xl font-semibold text-primary">預計學習重點</h3>
            <ul className="mt-6 space-y-4">
              {learningPoints.map((point) => <li className="flex gap-3 text-sm leading-7 text-ink/75" key={point}><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e9efe7] text-primary"><Check size={13} aria-hidden="true" /></span>{point}</li>)}
            </ul>
            <div className="mt-7 grid gap-3 border-t border-primary/10 pt-6 sm:grid-cols-2">
              <div className="flex gap-3 rounded-xl bg-[#f7f8f5] p-4"><Clock3 size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" /><div><p className="text-xs text-ink/55">課程時數</p><p className="mt-1 text-sm font-semibold text-primary">待認證核定</p></div></div>
              <div className="flex gap-3 rounded-xl bg-[#f7f8f5] p-4"><Award size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" /><div><p className="text-xs text-ink/55">學分與證明</p><p className="mt-1 text-sm font-semibold text-primary">依正式公告辦理</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#edf2eb] px-5 py-16 sm:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a7651]">報名資訊</p><h2 className="mt-3 font-display text-3xl font-semibold text-primary sm:text-4xl">報名流程設計</h2><p className="mt-4 leading-7 text-ink/70">正式課程開放後，依序完成以下步驟。報名頁將清楚說明所需資料、個資用途、退費規則與學分核發條件。</p></div>
          <ol className="mt-9 grid gap-4 md:grid-cols-3">
            {registrationSteps.map((step) => <li className="rounded-2xl border border-primary/10 bg-white p-6" key={step.number}><span className="font-brand text-3xl font-semibold text-[#a78d60]">{step.number}</span><h3 className="mt-4 text-lg font-semibold text-primary">{step.title}</h3><p className="mt-2 text-sm leading-7 text-ink/70">{step.text}</p></li>)}
          </ol>
          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl bg-primary p-6 text-white sm:flex-row sm:items-center sm:p-8">
            <div><p className="text-xs font-semibold tracking-[0.12em] text-white/70">目前狀態</p><h3 className="mt-2 text-xl font-semibold">正式報名資訊尚待核定</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">有課程規劃或合作需求，歡迎先聯絡我們；此聯絡不代表已完成課程報名。</p></div>
            <Link href="/#contact" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-[#f5f2e9]">聯絡課程團隊 <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#8a7651]">常見問題</p>
          <h2 className="mt-3 text-center font-display text-3xl font-semibold text-primary">常見問題</h2>
          <div className="mt-8 divide-y divide-primary/10 rounded-2xl border border-primary/10 bg-white px-6">
            {faqs.map((faq) => <details className="group py-5" key={faq.question}><summary className="cursor-pointer list-none pr-8 text-base font-semibold text-primary marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">{faq.question}<span className="float-right text-primary transition group-open:rotate-45">＋</span></summary><p className="mt-3 max-w-3xl text-sm leading-7 text-ink/70">{faq.answer}</p></details>)}
          </div>
          <p className="mt-6 text-center text-xs leading-6 text-ink/55">課程時數、認證、報名資格、費用與核發方式，請以正式公告及認證單位規範為準。</p>
        </div>
      </section>
    </main>
  )
}