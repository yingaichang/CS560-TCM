'use client'

import { useEffect, useState } from 'react'
import AdminPageScaffold from '@/components/AdminPageScaffold'

type ContactRecord = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'in_progress' | 'closed'
  emailDeliveryStatus: 'not_attempted' | 'not_configured' | 'sending' | 'sent' | 'failed' | 'unknown'
  emailDeliveryAttempts: number
  emailDeliveryAttemptedAt: string | null
  createdAt: string
}

const deliveryLabels: Record<ContactRecord['emailDeliveryStatus'], string> = {
  not_attempted: '未嘗試',
  not_configured: '郵件尚未設定',
  sending: '投遞處理中／結果待確認',
  sent: '郵件服務已接受',
  failed: '投遞失敗，請人工追蹤',
  unknown: '結果不明，請先向郵件服務查證，避免重複寄送',
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState('')

  const loadContacts = async () => {
    setError('')
    try {
      const response = await fetch('/api/contact', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法載入聯絡訊息。')
      setContacts(result)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '無法載入聯絡訊息。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadContacts() }, [])

  const retryNotification = async (contact: ContactRecord) => {
    if (!window.confirm('確認重新寄送通知？請先查證先前結果，重試可能產生重複郵件。')) return
    setSavingId(contact.id); setError('')
    try {
      const response = await fetch(`/api/admin/contacts/${encodeURIComponent(contact.id)}/retry`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedAttempts: contact.emailDeliveryAttempts, acknowledgePossibleDuplicate: true }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法確認寄送結果。')
      await loadContacts()
    } catch (reason) { setError(reason instanceof Error ? reason.message : '無法確認寄送結果。') }
    finally { setSavingId('') }
  }

  const updateStatus = async (contact: ContactRecord, status: ContactRecord['status']) => {
    setSavingId(contact.id)
    setError('')
    try {
      const response = await fetch(`/api/admin/contacts/${encodeURIComponent(contact.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法更新訊息狀態。')
      setContacts((current) => current.map((item) => item.id === contact.id ? { ...item, status: result.contact.status } : item))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '無法更新訊息狀態。')
    } finally {
      setSavingId('')
    }
  }

  return (
    <AdminPageScaffold title="聯絡訊息收件匣" description="已先保存的訊息可在此追蹤；郵件狀態不代表對方已閱讀。" backHref="/admin" backLabel="返回後台首頁">
      {error ? <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}<button type="button" className="ml-2 underline" onClick={() => void loadContacts()}>重試</button></p> : null}
      {loading ? <p role="status">正在載入聯絡訊息…</p> : contacts.length === 0 ? <p className="rounded border bg-white p-5 text-sm text-gray-600">目前沒有聯絡訊息。</p> : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <article key={contact.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-900">{contact.subject}</h2>
                  <p className="mt-1 text-sm text-gray-600">{contact.name} · <a className="underline" href={`mailto:${encodeURIComponent(contact.email)}`}>{contact.email}</a></p>
                  <time className="mt-1 block text-xs text-gray-500" dateTime={contact.createdAt}>{new Date(contact.createdAt).toLocaleString('zh-TW')}</time>
                </div>
                <label className="text-sm">處理狀態
                  <select className="ml-2 rounded border px-2 py-1" value={contact.status} disabled={savingId === contact.id} onChange={(event) => void updateStatus(contact, event.target.value as ContactRecord['status'])}>
                    <option value="new">新訊息</option><option value="in_progress">處理中</option><option value="closed">已結案</option>
                  </select>
                </label>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-800">{contact.message}</p>
              <p className={`mt-4 rounded px-3 py-2 text-sm ${contact.emailDeliveryStatus === 'sent' ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'}`}>
                通知狀態：{deliveryLabels[contact.emailDeliveryStatus] || '未知'}・嘗試次數：{contact.emailDeliveryAttempts}
                {contact.emailDeliveryAttemptedAt ? `・最近嘗試：${new Date(contact.emailDeliveryAttemptedAt).toLocaleString('zh-TW')}` : ''}
              </p>
              {['failed', 'not_configured'].includes(contact.emailDeliveryStatus) && <button className="mt-2 text-sm underline" disabled={savingId === contact.id} onClick={() => void retryNotification(contact)}>查證後重試通知</button>}
            </article>
          ))}
        </div>
      )}
    </AdminPageScaffold>
  )
}
