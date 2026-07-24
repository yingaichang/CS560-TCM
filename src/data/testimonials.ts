export interface TestimonialCategory {
  id: string
  category: string
  placeholder: string
}

export interface TestimonialItem {
  id: string
  categoryId: string
  content: string
  consentGiven: boolean
  publishedAt?: string
  ageRange?: string
  region?: string
}

export const testimonialCategories: TestimonialCategory[] = [
  {
    id: 'pain-relief',
    category: '疼痛改善',
    placeholder: '經本人授權後，病人經驗分享將顯示於此。',
  },
  {
    id: 'sleep-improvement',
    category: '睡眠改善',
    placeholder: '經本人授權後，病人經驗分享將顯示於此。',
  },
  {
    id: 'womens-health',
    category: '女性健康',
    placeholder: '經本人授權後，病人經驗分享將顯示於此。',
  },
  {
    id: 'chronic-health-management',
    category: '慢性健康管理',
    placeholder: '經本人授權後，病人經驗分享將顯示於此。',
  },
  {
    id: 'wellness-experience',
    category: '養生心得',
    placeholder: '經本人授權後，病人經驗分享將顯示於此。',
  },
]

export const testimonials: TestimonialItem[] = []