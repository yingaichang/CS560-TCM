'use client'

import { useEffect, useState } from 'react'
import AdminPageScaffold from '@/components/AdminPageScaffold'

type Registration = {
  id: string
  checkoutSessionId: string
  topicId: string
  topicName: string
  amountTwd: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'expired'
  customerEmail: string | null
  createdAt: string
  updatedAt: string
}

const statusLabels: Record<Registration['status'], string> = {
  pending: '待付款服務確認',
  paid: '已由簽章事件確認付款',
  failed: '付款失敗',
  expired: '工作階段逾期',
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRegistrations = async () => {
    setError('')
    try {
      const response = await fetch('/api/admin/registrations', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法載入報名紀錄。')
      setRegistrations(result.registrations)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '無法載入報名紀錄。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadRegistrations() }, [])

  return (
    <AdminPageScaffold title="講座報名紀錄" description="狀態僅依簽章驗證後的付款事件更新；付款回跳網址不會自行標記成功。" backHref="/admin" backLabel="返回後台首頁">
      {error ? <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}<button type="button" className="ml-2 underline" onClick={() => void loadRegistrations()}>重試</button></p> : null}
      {loading ? <p role="status">正在載入報名紀錄…</p> : registrations.length === 0 ? <p className="rounded border bg-white p-5 text-sm text-gray-600">目前沒有講座報名紀錄。</p> : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="p-3">講座</th><th>報名者電子郵件</th><th>金額</th><th>付款／報名狀態</th><th>建立時間</th><th>付款工作階段編號</th></tr></thead>
            <tbody>{registrations.map((registration) => (
              <tr className="border-t" key={registration.id}>
                <td className="p-3">{registration.topicName}</td>
                <td>{registration.customerEmail || '付款平台尚未提供'}</td>
                <td>{registration.currency.toUpperCase()} {registration.amountTwd.toLocaleString()}</td>
                <td>{statusLabels[registration.status] || '未知'}</td>
                <td>{new Date(registration.createdAt).toLocaleString('zh-TW')}</td>
                <td className="font-mono text-xs">{registration.checkoutSessionId}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </AdminPageScaffold>
  )
}
