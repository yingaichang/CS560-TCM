export interface MembershipPreviewFeature {
  id: string
  label: string
  comingSoon?: boolean
}

export const membershipPreviewFeatures: MembershipPreviewFeature[] = [
  { id: 'personal-profile', label: '個人健康檔案', comingSoon: true },
  { id: 'bp-sugar-sleep-tracking', label: '血壓、血糖與睡眠追蹤', comingSoon: true },
  { id: 'monthly-summary', label: '每月健康摘要', comingSoon: true },
  { id: 'follow-up-reminder', label: '回診提醒', comingSoon: true },
  { id: 'health-courses', label: '健康課程', comingSoon: true },
  { id: 'family-care', label: '家庭關懷功能', comingSoon: true },
]