'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import AdminPageScaffold from '@/components/AdminPageScaffold'

type Holiday = { id: string; holidayDate: string; name: string; isClosed: boolean }

export default function AdminHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [date, setDate] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadHolidays = useCallback(async (yearValue = year) => {
    setError('')
    try {
      const response = await fetch(`/api/holidays?year=${encodeURIComponent(yearValue)}`, { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法載入休診日。')
      setHolidays(result)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '無法載入休診日。')
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => { void loadHolidays() }, [loadHolidays])

  const addHoliday = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, name, isClosed: true }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法新增休診日。')
      setDate('')
      setName('')
      setMessage('休診日已保存並記錄稽核事件。')
      await loadHolidays()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '無法新增休診日。')
    } finally {
      setSaving(false)
    }
  }

  const seedYear = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(`/api/holidays/seed?year=${encodeURIComponent(year)}`, { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法匯入休診日。')
      setMessage(`已處理 ${result.year} 年假日；新增 ${result.created} 筆，略過 ${result.skipped} 筆既有資料。`)
      await loadHolidays(year)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '無法匯入休診日。')
    } finally {
      setSaving(false)
    }
  }

  const deleteHoliday = async (holiday: Holiday) => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(`/api/holidays?id=${encodeURIComponent(holiday.id)}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法刪除休診日。')
      setMessage('休診日已刪除並記錄稽核事件。')
      await loadHolidays()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '無法刪除休診日。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageScaffold title="休診日管理" description="新增或移除休診日；預約服務會拒絕落在已關閉日期的時段。" backHref="/admin/appointments" backLabel="返回預約管理">
      {message ? <p className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800" role="status">{message}</p> : null}
      {error ? <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}<button type="button" className="ml-2 underline" onClick={() => void loadHolidays()}>重試</button></p> : null}
      <section className="mb-5 rounded-lg border bg-white p-5">
        <form className="grid gap-3 md:grid-cols-3" onSubmit={addHoliday}>
          <label className="text-sm font-medium">日期<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 block w-full rounded border px-3 py-2" /></label>
          <label className="text-sm font-medium">名稱<input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 block w-full rounded border px-3 py-2" /></label>
          <button type="submit" disabled={saving} className="self-end rounded bg-[#355C46] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">新增休診日</button>
        </form>
        <div className="mt-5 flex flex-wrap items-end gap-3 border-t pt-4">
          <label className="text-sm font-medium">年度<input type="number" min={1900} max={3000} value={year} onChange={(event) => setYear(event.target.value)} className="mt-1 block w-36 rounded border px-3 py-2" /></label>
          <button type="button" disabled={saving} onClick={() => void loadHolidays(year)} className="rounded border px-4 py-2 text-sm">載入年度</button>
          <button type="button" disabled={saving} onClick={() => void seedYear()} className="rounded border px-4 py-2 text-sm">匯入美國聯邦假日（不覆蓋既有資料）</button>
        </div>
      </section>
      <section className="overflow-x-auto rounded-lg border bg-white">
        {loading ? <p className="p-5" role="status">正在載入休診日…</p> : holidays.length === 0 ? <p className="p-5 text-sm text-gray-600">此年度沒有休診日資料。</p> : (
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="p-3">日期</th><th>名稱</th><th>預約狀態</th><th>操作</th></tr></thead>
            <tbody>{holidays.map((holiday) => (
              <tr className="border-t" key={holiday.id}>
                <td className="p-3">{new Date(holiday.holidayDate).toLocaleDateString('zh-TW')}</td>
                <td>{holiday.name}</td>
                <td>{holiday.isClosed ? '停止預約' : '照常營業'}</td>
                <td><button type="button" disabled={saving} onClick={() => void deleteHoliday(holiday)} className="text-red-700 underline disabled:opacity-50">刪除</button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </section>
    </AdminPageScaffold>
  )
}
