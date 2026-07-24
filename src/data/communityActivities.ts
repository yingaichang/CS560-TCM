export interface CommunityActivity {
  id: string
  title: string
  image: string
  dateLabel: string
  format: string
  href: string
}

export const communityActivities: CommunityActivity[] = [
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