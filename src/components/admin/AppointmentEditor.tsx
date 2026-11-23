'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'

type Appointment = { id: string; name: string; date: string; appointmentTime: string; status: string; message: string | null; updatedAt: string }
export default function AppointmentEditor({ id }: { id: string }) {
  const [record, setRecord] = useState<Appointment | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  async function load() {
    setError('')
    try {
      const response = await fetch(`/api/appointments/${encodeURIComponent(id)}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || '無法載入預約。')
      setRecord(payload)
    } catch (reason) { setError(reason instanceof Error ? reason.message : '無法載入預約。') }
  }
  useEffect(() => { setRecord(null); void load() }, [id])
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!record) return
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())
    setBusy(true); setError(''); setSaved(false)
    try {
      const response = await fetch(`/api/appointments/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedUpdatedAt: record.updatedAt, date: values.date, appointmentTime: values.appointmentTime, message: values.message || null, ...(values.status !== record.status ? { status: values.status } : {}) }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || '無法保存預約。')
      setRecord(payload); setSaved(true)
    } catch (reason) { setError(reason instanceof Error ? reason.message : '無法確認保存結果。') }
    finally { setBusy(false) }
  }
  return <>
    {error && <p role="alert" className="mb-4 rounded border bg-red-50 p-3">{error} <button onClick={() => void load()} className="underline">重新載入</button></p>}
    {saved && <p role="status">預約已保存，管理清單會顯示更新結果；郵件通知結果請另行查看。</p>}
    {record ? <form key={record.updatedAt} className="grid gap-4 rounded border bg-white p-5" onSubmit={save}><h2>{record.name}</h2>
      <label>日期<input className="ml-2 rounded border p-2" type="date" name="date" required defaultValue={record.date.slice(0, 10)} /></label>
      <label>時段<select className="ml-2 rounded border p-2" name="appointmentTime" defaultValue={record.appointmentTime}>{['09:00', '09:30', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '15:30', '16:00', '17:00'].map(time => <option key={time}>{time}</option>)}</select></label>
      <label>狀態<select className="ml-2 rounded border p-2" name="status" defaultValue={record.status}>{Array.from(new Set([record.status, 'pending', 'confirmed', 'cancelled', 'completed', 'waitlist', 'no_show'])).map(status => <option key={status}>{status}</option>)}</select></label>
      <label>預約備註<textarea className="mt-2 block w-full rounded border p-2" name="message" maxLength={3000} defaultValue={record.message || ''} /></label>
      <p>已報到預約不可更換時段。完成狀態需先完成對應看診。病人關聯與通知追蹤請使用預約清單。</p>
      <button disabled={busy} className="rounded bg-[#355C46] p-3 text-white">{busy ? '保存中…' : '保存修改'}</button><Link href="/admin/appointments" className="underline">返回預約清單</Link>
    </form> : !error && <p>載入中…</p>}
  </>
}
