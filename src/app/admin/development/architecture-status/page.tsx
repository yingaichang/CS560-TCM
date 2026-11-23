import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { canViewArchitectureStatus } from '@/lib/architectureStatusAccess'
import ArchitectureMap from '@/components/admin/ArchitectureMap'
import { readKioskTestReport } from '@/lib/readKioskTestReport'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '系統架構狀態｜開發工具',
  robots: { index: false, follow: false },
}

export default async function ArchitectureStatusPage() {
  // Enforce access before rendering status data, including direct and RSC requests.
  if (!(await canViewArchitectureStatus())) notFound()

  const configuration = [
    { name: '身分驗證服務', configured: Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) },
    { name: '資料庫', configured: Boolean(process.env.DATABASE_URL) },
    { name: '付款結帳與回呼服務', configured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) },
  ]

  return (
    <section className="space-y-6" aria-labelledby="architecture-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#355C46]">開發工具／系統狀態</p>
          <h1 id="architecture-title" className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">系統架構狀態總覽</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">供管理員檢視元件、連線、交換資料、證據及尚未完成的條件。</p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">臨時開發工具</span>
      </div>

      <ArchitectureMap kioskTest={readKioskTestReport()} />

      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="config-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="config-title" className="text-xl font-semibold text-gray-900">設定狀態快照</h2>
          <a href="/admin/development/architecture-status" className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46]">重新整理快照</a>
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-600">僅檢查設定是否存在。重新整理不會執行外部連線或付款測試；不顯示憑證值或病人資料。</p>
        <dl className="mt-4 divide-y divide-gray-100">
          {configuration.map((item) => (
            <div key={item.name} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="font-medium text-gray-900">{item.name}</dt>
              <dd className="text-blue-950">未知：{item.configured ? '設定存在，實際連線尚未驗證' : '設定不完整，實際連線尚未驗證'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex flex-wrap gap-4 text-sm font-medium text-[#355C46]">
        <Link href="/admin" className="underline underline-offset-4">返回後台首頁</Link>
        <Link href="/admin/audit-logs" className="underline underline-offset-4">查看稽核紀錄</Link>
      </div>
    </section>
  )
}
