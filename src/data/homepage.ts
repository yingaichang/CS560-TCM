export interface TrustIndicator {
  title: string
  subtitle: string
}

export interface HealthJourneyCardData {
  id: string
  title: string
  description: string
  buttonText: string
  href: string
  iconKey: 'insight' | 'clinic' | 'topics' | 'tracking' | 'courses'
}

export interface CoreServiceData {
  id: string
  title: string
  description: string
  href: string
  iconKey: 'acupuncture' | 'analysis' | 'sleep' | 'women' | 'chronic' | 'senior'
}

export interface HealthAcademyTopicData {
  id: string
  category: string
  title: string
  summary: string
  image: string
  href: string
}

export interface CommunityActivityData {
  id: string
  title: string
  image: string
  dateLabel: string
  format: string
  href: string
}

export const trustIndicators: TrustIndicator[] = [
  { title: '專業中醫團隊', subtitle: '豐富臨床經驗' },
  { title: 'AI 智慧分析', subtitle: '精準健康評估' },
  { title: '個人化管理', subtitle: '量身健康計畫' },
  { title: '專業追蹤', subtitle: '完整健康紀錄' },
]

export const healthJourneyCards: HealthJourneyCardData[] = [
  {
    id: 'health-insight',
    title: '我想了解自己的健康',
    description: '透過 AI 體質分析與健康問卷，認識目前的身體狀態。',
    buttonText: '開始免費分析',
    href: '/ai-health-analysis',
    iconKey: 'insight',
  },
  {
    id: 'clinical-care',
    title: '我需要專業診療',
    description: '預約初診、複診或中醫健康諮詢。',
    buttonText: '線上預約',
    href: '/appointments',
    iconKey: 'clinic',
  },
  {
    id: 'improve-problems',
    title: '我想改善健康問題',
    description: '依照睡眠、疼痛、壓力、女性健康及慢性健康需求，找到適合的內容。',
    buttonText: '查看健康主題',
    href: '/health-academy',
    iconKey: 'topics',
  },
  {
    id: 'continuous-tracking',
    title: '我想持續追蹤健康',
    description: '記錄血壓、血糖、睡眠、體重及日常健康變化。',
    buttonText: '進入病人中心',
    href: '/patient-center',
    iconKey: 'tracking',
  },
  {
    id: 'courses-events',
    title: '我想參加課程與活動',
    description: '參加線上課程、健康講座、八段錦與社區養生活動。',
    buttonText: '查看課程',
    href: '/courses-events',
    iconKey: 'courses',
  },
]

export const coreServices: CoreServiceData[] = [
  {
    id: 'acupuncture-care',
    title: '中醫診療與針灸',
    description: '由專業中醫師評估體質，搭配針灸與調理建議，改善核心不適。',
    href: '/appointments',
    iconKey: 'acupuncture',
  },
  {
    id: 'ai-analysis',
    title: 'AI 體質與健康分析',
    description: '透過 AI 問卷與體質模型，快速掌握目前健康輪廓與優先改善方向。',
    href: '/ai-health-analysis',
    iconKey: 'analysis',
  },
  {
    id: 'sleep-stress',
    title: '睡眠與情緒壓力管理',
    description: '從睡眠品質、壓力節律與生活習慣出發，建立可持續的修復計畫。',
    href: '/health-academy',
    iconKey: 'sleep',
  },
  {
    id: 'women-care',
    title: '女性健康與體質調理',
    description: '針對週期、荷爾蒙與體質變化提供個人化調理，陪伴每個階段更穩定。',
    href: '/health-academy',
    iconKey: 'women',
  },
  {
    id: 'chronic-care',
    title: '高血壓與血糖健康管理',
    description: '整合門診與日常數據，追蹤血壓血糖趨勢，協助建立長期穩定節奏。',
    href: '/patient-center',
    iconKey: 'chronic',
  },
  {
    id: 'family-care',
    title: '銀髮與家庭健康關懷',
    description: '以家庭為單位建立照護節奏，支援長輩日常監測與跨世代健康支持。',
    href: '/patient-center',
    iconKey: 'senior',
  },
]

export const healthAcademyTopics: HealthAcademyTopicData[] = [
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

export const communityActivities: CommunityActivityData[] = [
  {
    id: 'senior-wellness-community-care',
    title: '銀髮養生與社區關懷',
    image: '/images/bamboo-3.webp',
    dateLabel: '活動規劃中',
    format: '社區實體活動',
    href: '/courses-events?category=senior-wellness',
  },
  {
    id: 'baduanjin-daily-exercise',
    title: '八段錦與日常運動',
    image: '/images/bamboo-5.webp',
    dateLabel: '活動規劃中',
    format: '實體課程 + 居家練習',
    href: '/courses-events?category=exercise',
  },
  {
    id: 'health-talks-online-courses',
    title: '健康講座與線上課程',
    image: '/images/bamboo-6.webp',
    dateLabel: '活動規劃中',
    format: '線上直播 / 錄播',
    href: '/courses-events?category=lectures',
  },
]