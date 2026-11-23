import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { canViewArchitectureStatus } from '@/lib/architectureStatusAccess'
import ArchitectureMap from '@/components/admin/ArchitectureMap'
import { readKioskTestReport } from '@/lib/readKioskTestReport'
import { getSystemConnections } from '@/lib/systemConnections'
import { systemStatuses } from '@/lib/architectureMap'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '系統架構狀態｜開發工具',
  robots: { index: false, follow: false },
}

export default async function ArchitectureStatusPage() {
  // Enforce access before rendering status data, including direct and RSC requests.
  if (!(await canViewArchitectureStatus())) notFound()

  const liveReport = await getSystemConnections()

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

      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="config-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="config-title" className="text-xl font-semibold text-gray-900">目前部署的實際連線檢查</h2>
          <a href="/admin/development/architecture-status" className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46]">重新整理快照</a>
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-600">目前環境：{liveReport.environment === 'ubuntu' ? 'Ubuntu' : '本機開發'}。結果最多快取三十秒。檢查資料庫查詢、必要欄位、Clerk／Stripe 唯讀 API、SMTP 登入及正式網址版本；不寄信、不發簡訊、不建立付款，也不修改資料庫。</p>
        <p className="mt-2 text-sm text-gray-600">檢查時間：<time dateTime={liveReport.checkedAt}>{new Intl.DateTimeFormat('zh-TW', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'long' }).format(new Date(liveReport.checkedAt))}</time>（美國洛杉磯時間）。服務 API 連通不代表尚未實作的業務功能已完成。</p>
        <dl className="mt-4 divide-y divide-gray-100">
          {liveReport.checks.map((item) => (
            <div key={item.name} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="font-medium text-gray-900">{item.name}</dt>
              <dd className="max-w-2xl"><span className={`inline-flex rounded-full border px-3 py-1 font-medium ${systemStatuses[item.status].style}`}>{systemStatuses[item.status].label}</span><p className="mt-2 text-gray-600">{item.detail}</p></dd>
            </div>
          ))}
        </dl>
      </section>

      <ArchitectureMap kioskTest={readKioskTestReport()} liveReport={liveReport} />

      <div className="flex flex-wrap gap-4 text-sm font-medium text-[#355C46]">
        <Link href="/admin" className="underline underline-offset-4">返回後台首頁</Link>
        <Link href="/admin/audit-logs" className="underline underline-offset-4">查看稽核紀錄</Link>
        <Link href="/admin/development/architecture-tests" className="underline underline-offset-4">Architecture Test Center</Link>
      </div>
    </section>
  )
}
