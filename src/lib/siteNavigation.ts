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

export const ADMIN_NAV_ITEM: MainNavItem = {
  key: 'clinic',
  label: '診所管理',
  href: '/admin',
  children: [
    { label: '帳單與付款', href: '/admin/billing' },
    { label: '診所管理系統', href: '/admin' },
  ],
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
  },
  {
    key: 'services',
    label: '健康服務',
    href: homeAnchor('#services'),
    children: [
      { label: '診療服務', href: homeAnchor('#services') },
      { label: 'AI 健康分析', href: '/ai-health-analysis' },
      { label: '健康評估', href: '/ai-health-analysis' },
    ],
  },
  {
    key: 'wellness',
    label: '健康生活',
    href: homeAnchor('#articles'),
    children: [
      { label: '健康學院', href: homeAnchor('#articles') },
      { label: '課程與活動', href: homeAnchor('#team') },
      { label: '健康商城', href: '/payment' },
    ],
  },
  {
    key: 'member-center',
    label: '我的健康',
    href: '/sign-in',
    children: [
      { label: '預約管理', href: '/sign-in' },
      { label: '健康檔案', href: '/sign-in' },
    ],
  },
]
