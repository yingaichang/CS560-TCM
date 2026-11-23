'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ArchitectureAutoRefresh() {
  const router = useRouter()
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') router.refresh() }
    const timer = window.setInterval(refresh, 30_000)
    document.addEventListener('visibilitychange', refresh)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh) }
  }, [router])
  return <p className="text-sm leading-6 text-gray-600">頁面顯示時每 30 秒自動讀取同一部署目錄的最新報到測試紀錄；回到此頁也會更新。來源掃描快照與服務測試分開計算，不會自動執行測試。</p>
}
