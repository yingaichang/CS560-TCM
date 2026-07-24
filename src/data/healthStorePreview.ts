export interface HealthStoreCategory {
  id: string
  title: string
  summary: string
}

export const healthStoreCategories: HealthStoreCategory[] = [
  {
    id: 'wellness-tea',
    title: '養生茶',
    summary: '以日常飲用情境為主，提供不同時段與季節的茶飲選擇規劃。',
  },
  {
    id: 'herbal-meal-pack',
    title: '藥膳包',
    summary: '以居家料理便利性為核心，規劃多元的養生湯品與食補搭配方向。',
  },
  {
    id: 'mugwort-heat-care',
    title: '艾草與熱敷產品',
    summary: '聚焦放鬆與日常保養使用情境，提供居家自我照護用品規劃。',
  },
  {
    id: 'health-gift-box',
    title: '健康禮盒',
    summary: '以節慶與家庭關懷需求為出發，組合適合贈禮與日常使用的品項。',
  },
]