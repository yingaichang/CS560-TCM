'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { findHealthTopicById, healthTopics } from '@/lib/healthTopics'

function PaymentContent() {
  const params = useSearchParams()
  const topicId = params.get('topic') || ''
  const status = params.get('status') || ''
  const sessionId = params.get('session_id') || ''

  const selectedTopic = useMemo(() => {
    return findHealthTopicById(topicId) || healthTopics[0]
  }, [topicId])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const checkoutKeys = useRef(new Map<string, string>())
  const [registrationStatus, setRegistrationStatus] = useState<'loading' | 'pending' | 'paid' | 'failed' | 'expired' | 'requires_review' | 'unknown'>('unknown')

  useEffect(() => {
    if (status !== 'success') return
    if (!sessionId) {
      setRegistrationStatus('unknown')
      return
    }

    let active = true
    setRegistrationStatus('loading')
    fetch(`/api/payment/registration?sessionId=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || '付款狀態尚未同步。')
        if (active) setRegistrationStatus(result.status)
      })
      .catch((error: unknown) => {
        console.error('Unable to verify returned payment status:', error)
        if (active) setRegistrationStatus('unknown')
      })
    return () => { active = false }
  }, [sessionId, status])

  const handleStripeCheckout = async () => {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const key = checkoutKeys.current.get(selectedTopic.id) || crypto.randomUUID()
      checkoutKeys.current.set(selectedTopic.id, key)
      const response = await fetch('/api/payment/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': key,
        },
        body: JSON.stringify({ topicId: selectedTopic.id }),
      })

      const data = await response.json()
      if (!response.ok || !data.sessionUrl) {
        setErrorMessage(data.error || '建立付款連結失敗，請稍後再試。')
        setIsSubmitting(false)
        return
      }

      window.location.assign(data.sessionUrl)
    } catch (error) {
      console.error('Checkout error:', error)
      setErrorMessage('付款流程發生錯誤，請稍後再試。')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-8 md:p-10">
        <p className="text-sm tracking-widest text-tcm-green font-medium">付款表單</p>
        <h1 className="text-3xl font-bold text-tcm-dark mt-3">健康專欄講座報名</h1>
        <p className="text-gray-600 mt-3">請確認講座資訊後點擊付款，系統會導向 付款測試環境完成刷卡流程。</p>

        {status === 'success' && (
          registrationStatus === 'paid'
            ? <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">已收到並核對付款平台事件，報名紀錄已建立。感謝您的參與。</div>
            : <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900" role="status">
                {registrationStatus === 'loading' || registrationStatus === 'pending' ? '已收到付款回跳，付款事件尚待伺服器確認；請稍後重新整理或聯絡診所。' : registrationStatus === 'failed' ? '付款未完成，尚未建立有效報名。' : registrationStatus === 'expired' ? '付款工作階段已逾期，尚未建立有效報名。' : '目前無法核對付款狀態；此頁面不代表付款成功，請聯絡診所確認。'}
              </div>
        )}

        {status === 'cancel' && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
            您已取消此次付款，若仍要報名可再次點擊付款。
          </div>
        )}

        <section className="mt-8 rounded-xl border border-gray-100 bg-tcm-beige/10 p-6">
          <h2 className="text-2xl font-semibold text-tcm-dark">{selectedTopic.topic}</h2>
          <p className="text-gray-700 mt-3 leading-relaxed">{selectedTopic.summary}</p>

          <div className="mt-5 space-y-2 text-sm text-gray-700">
            <p>日期: {selectedTopic.date}</p>
            <p>時間: {selectedTopic.time}</p>
            <p>講者: {selectedTopic.presenter}</p>
            <p>地點: {selectedTopic.location}</p>
            <p>報名費: TWD {selectedTopic.feeTwd}</p>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleStripeCheckout}
          disabled={isSubmitting}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-tcm-green px-6 py-3 text-white font-medium transition hover:bg-tcm-light-green disabled:opacity-60"
        >
          {isSubmitting ? '導向付款中...' : '使用 Stripe Sandbox 付款並完成報名'}
        </button>
      </div>
    </main>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={(
        <main className="min-h-screen bg-cream py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 text-gray-600 md:p-10">
            載入付款資訊中...
          </div>
        </main>
      )}
    >
      <PaymentContent />
    </Suspense>
  )
}
