export type NavSubItem = {
  label: string
  href: string
  comingSoon?: boolean
}

export type MainNavItem = {
  key: string
  label: string
  href: string
  children?: NavSubItem[]
}

const comingSoonHref = (feature: string) => `/coming-soon?feature=${feature}`

const homeAnchor = (anchor: string) => `/${anchor}`

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  {
    key: 'home',
    label: '首頁',
    href: '/#home',
  },
  {
    key: 'about',
    label: '關於我們',
    href: homeAnchor('#about'),
    children: [
      { label: '醫師介紹', href: comingSoonHref('doctor-introduction'), comingSoon: true },
      { label: '診所理念', href: comingSoonHref('clinic-philosophy'), comingSoon: true },
      { label: '專業證照', href: comingSoonHref('professional-certifications'), comingSoon: true },
      { label: '專長項目', href: comingSoonHref('specialties'), comingSoon: true },
      { label: '成功案例', href: comingSoonHref('success-cases'), comingSoon: true },
      { label: '診所環境', href: comingSoonHref('clinic-environment'), comingSoon: true },
    ],
  },
  {
    key: 'services',
    label: '診療服務',
    href: homeAnchor('#services'),
    children: [
      { label: '初診服務', href: comingSoonHref('first-visit'), comingSoon: true },
      { label: '複診服務', href: comingSoonHref('follow-up-visit'), comingSoon: true },
      { label: '針灸治療', href: comingSoonHref('acupuncture'), comingSoon: true },
      { label: '中醫調理', href: comingSoonHref('tcm-regulation'), comingSoon: true },
      { label: '疼痛管理', href: comingSoonHref('pain-management'), comingSoon: true },
      { label: '睡眠調理', href: comingSoonHref('sleep-support'), comingSoon: true },
      { label: '女性健康', href: comingSoonHref('womens-health'), comingSoon: true },
      { label: '慢性病健康管理', href: comingSoonHref('chronic-health-management'), comingSoon: true },
    ],
  },
  {
    key: 'ai-analysis',
    label: 'AI 健康分析',
    href: comingSoonHref('ai-health-analysis'),
    children: [
      { label: 'AI 體質分析', href: comingSoonHref('ai-body-constitution'), comingSoon: true },
      { label: 'AI 健康評估', href: comingSoonHref('ai-health-assessment'), comingSoon: true },
      { label: 'AI 養生建議', href: comingSoonHref('ai-wellness-advice'), comingSoon: true },
      { label: 'AI 飲食建議', href: comingSoonHref('ai-diet-advice'), comingSoon: true },
      { label: 'AI 穴位建議', href: comingSoonHref('ai-acupoint-advice'), comingSoon: true },
      { label: 'AI 健康報告', href: comingSoonHref('ai-health-report'), comingSoon: true },
    ],
  },
  {
    key: 'academy',
    label: '健康學院',
    href: homeAnchor('#articles'),
    children: [
      { label: '四季養生', href: comingSoonHref('seasonal-wellness'), comingSoon: true },
      { label: '八段錦', href: comingSoonHref('baduanjin'), comingSoon: true },
      { label: '女性健康', href: comingSoonHref('academy-womens-health'), comingSoon: true },
      { label: '糖尿病專區', href: comingSoonHref('academy-diabetes'), comingSoon: true },
      { label: '高血壓專區', href: comingSoonHref('academy-hypertension'), comingSoon: true },
      { label: '睡眠專區', href: comingSoonHref('academy-sleep'), comingSoon: true },
      { label: '情緒壓力管理', href: comingSoonHref('academy-emotion-stress'), comingSoon: true },
      { label: '穴位保健', href: comingSoonHref('academy-acupoint-care'), comingSoon: true },
      { label: '養生茶專區', href: comingSoonHref('academy-wellness-tea'), comingSoon: true },
    ],
  },
  {
    key: 'events',
    label: '課程與活動',
    href: homeAnchor('#team'),
    children: [
      { label: '線上課程', href: comingSoonHref('online-courses'), comingSoon: true },
      { label: '健康講座', href: comingSoonHref('health-seminars'), comingSoon: true },
      { label: '銀髮養生課程', href: comingSoonHref('senior-wellness-courses'), comingSoon: true },
      { label: '女性調理課程', href: comingSoonHref('womens-regulation-courses'), comingSoon: true },
      { label: '八段錦課程', href: comingSoonHref('baduanjin-courses'), comingSoon: true },
      { label: '線上直播', href: comingSoonHref('live-streaming'), comingSoon: true },
      { label: '社區活動', href: comingSoonHref('community-events'), comingSoon: true },
    ],
  },
  {
    key: 'shop',
    label: '健康商城',
    href: '/payment',
    children: [
      { label: '養生茶', href: comingSoonHref('wellness-tea'), comingSoon: true },
      { label: '藥膳包', href: comingSoonHref('herbal-meal-pack'), comingSoon: true },
      { label: '艾草產品', href: comingSoonHref('mugwort-products'), comingSoon: true },
      { label: '熱敷產品', href: comingSoonHref('heat-therapy-products'), comingSoon: true },
      { label: '保健產品', href: comingSoonHref('healthcare-products'), comingSoon: true },
      { label: '健康禮盒', href: comingSoonHref('wellness-gift-boxes'), comingSoon: true },
    ],
  },
  {
    key: 'patient-center',
    label: '病人中心',
    href: '/patient-center',
    children: [
      { label: '個人健康檔案', href: '/patient-center#personal-health-records' },
      { label: '就診紀錄', href: '/patient-center#visit-records' },
      { label: '睡眠追蹤', href: '/patient-center#sleep-tracking' },
      { label: '血糖追蹤', href: '/patient-center#blood-sugar-tracking' },
      { label: '血壓追蹤', href: '/patient-center#blood-pressure-tracking' },
      { label: '體重管理', href: '/patient-center#weight-management' },
      { label: '健康日誌', href: '/patient-center#health-journal' },
      { label: '用藥紀錄', href: '/patient-center#medication-records' },
      { label: '回診提醒', href: '/patient-center#follow-up-reminders' },
    ],
  },
]
