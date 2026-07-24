export interface HealthAcademyTopic {
  id: string
  category: string
  title: string
  summary: string
  image: string
  href: string
}

export const healthAcademyTopics: HealthAcademyTopic[] = [
  {
    id: 'sleep-improvement',
    category: '日常調理',
    title: '睡眠改善',
    summary: '從入睡習慣、夜間醒來與晨起狀態，建立可持續的睡眠優化節奏。',
    image: '/images/health-academy/sleep.svg',
    href: '/health-academy?topic=sleep-improvement',
  },
  {
    id: 'hypertension-management',
    category: '慢性管理',
    title: '高血壓管理',
    summary: '結合飲食、活動與壓力調節，協助穩定血壓趨勢並降低日常波動。',
    image: '/images/health-academy/hypertension.svg',
    href: '/health-academy?topic=hypertension-management',
  },
  {
    id: 'blood-sugar-health',
    category: '慢性管理',
    title: '血糖健康',
    summary: '學習餐盤搭配與作息節律，逐步建立更平穩的血糖管理方式。',
    image: '/images/health-academy/blood-sugar.svg',
    href: '/health-academy?topic=blood-sugar-health',
  },
  {
    id: 'womens-health',
    category: '女性照護',
    title: '女性健康',
    summary: '從週期、體質與生活壓力出發，提供不同人生階段的調理方向。',
    image: '/images/health-academy/womens-health.svg',
    href: '/health-academy?topic=womens-health',
  },
  {
    id: 'acupressure-care',
    category: '居家保健',
    title: '穴位保健',
    summary: '以簡單可實作的穴位按壓與伸展，支持日常放鬆與自我照護。',
    image: '/images/health-academy/acupressure.svg',
    href: '/health-academy?topic=acupressure-care',
  },
  {
    id: 'seasonal-wellness',
    category: '節氣養生',
    title: '四季養生',
    summary: '依季節變化調整飲食與作息，讓身體在不同時節保持平衡穩定。',
    image: '/images/health-academy/seasonal-wellness.svg',
    href: '/health-academy?topic=seasonal-wellness',
  },
]