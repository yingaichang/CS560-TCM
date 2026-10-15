"use client"

import { useEffect, useRef, useState } from 'react'

type Appointment = {
  id: string
  name: string
  service: string
  date: string
  appointmentTime: string
  doctorId: string
  phone: string
  email: string
  message?: string | null
  status: string
  createdAt: string
  checkedIn: boolean
  checkedInAt?: string | null
}

type AppointmentUpdates = {
  status?: string
  date?: string
  appointmentTime?: string
  message?: string | null
}

function toCsv(rows: Appointment[]) {
  const headers = [
    '預約編號',
    '病人姓名',
    '預約類型',
    '預約日期',
    '預約時間',
    '指定醫師',
    '電話',
    'Email',
    '問卷完成',
    '預約狀態',
    '送出時間',
  ]

  const lines = rows.map((r) => [
    r.id,
    r.name,
    r.service,
    new Date(r.date).toISOString().slice(0, 10),
    r.appointmentTime,
    r.doctorId,
    r.phone,
    r.email,
    r.message ? '已填寫' : '未填寫',
    r.status,
    new Date(r.createdAt).toISOString(),
  ])

  const csv = [headers, ...lines].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  return csv
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [hasMore, setHasMore] = useState(false)
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const pollInFlight = useRef(false)

  const fetchAppointments = async (status = 'pending', pageArg = 1, size = 10) => {
    setLoading(true)
    try {
      const skip = (pageArg - 1) * size
      const res = await fetch(`/api/appointments?status=${encodeURIComponent(status)}&take=${size}&skip=${skip}`)
      const data = await res.json()
      if (!res.ok || !Array.isArray(data)) {
        console.error('Failed to load appointments', res.status, JSON.stringify(data))
        setAppointments([])
        setHasMore(false)
        return
      }
      setAppointments(data)
      setHasMore(data.length === size)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [filter, pageSize])

  // A single fetch effect avoids concurrent duplicate requests, each of which writes an audit-log entry.
  useEffect(() => {
    fetchAppointments(filter, page, pageSize)
  }, [filter, page, pageSize])

  // Poll so kiosk self check-ins show up here without a manual refresh.
  // Skip a tick while a request is still running so slow responses don't pile up.
  useEffect(() => {
    const interval = setInterval(() => {
      if (pollInFlight.current) return
      pollInFlight.current = true
      fetchAppointments(filter, page, pageSize).finally(() => { pollInFlight.current = false })
    }, 15000)
    return () => clearInterval(interval)
  }, [filter, page, pageSize])

  useEffect(() => {
    if (selected) {
      setEditDate(new Date(selected.date).toISOString().slice(0, 10))
      setEditTime(selected.appointmentTime)
    } else {
      setEditDate('')
      setEditTime('')
    }
  }, [selected])

  const updateAppointment = async (id: string, updates: AppointmentUpdates) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        fetchAppointments(filter, page, pageSize)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const exportCsv = () => {
    const csv = toCsv(appointments)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appointments_${filter}_${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-[#355C46]">預約管理</h1>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-md border px-3 py-2">
            <option value="all">全部預約</option>
            <option value="pending">待確認預約</option>
            <option value="new">初診預約</option>
            <option value="followup">複診預約</option>
            <option value="ai_initial">AI 初診預約</option>
            <option value="waitlist">候補名單</option>
            <option value="confirmed">已確認預約</option>
            <option value="completed">已完成預約</option>
            <option value="cancelled">已取消預約</option>
            <option value="no_show">未到診預約</option>
          </select>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-md border px-3 py-2">
            <option value={5}>5 / 頁</option>
            <option value={10}>10 / 頁</option>
            <option value={25}>25 / 頁</option>
          </select>
          <button onClick={exportCsv} className="rounded bg-sky-600 px-3 py-2 text-white text-sm">匯出 CSV</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white p-4 shadow-sm">
        {loading ? (
          <p>讀取中…</p>
        ) : (
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="py-2">預約編號</th>
                <th>病人姓名</th>
                <th>預約類型</th>
                <th>日期</th>
                <th>時間</th>
                <th>指定醫師</th>
                <th>電話</th>
                <th>Email</th>
                <th>問卷完成</th>
                <th>狀態</th>
                <th>報到</th>
                <th>送出時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-t align-top">
                  <td className="py-3 align-top">{a.id}</td>
                  <td className="align-top">{a.name}</td>
                  <td className="align-top">{a.service}</td>
                  <td className="align-top">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="align-top">{a.appointmentTime}</td>
                  <td className="align-top">{a.doctorId}</td>
                  <td className="align-top">{a.phone}</td>
                  <td className="align-top">{a.email}</td>
                  <td className="align-top">{a.message ? '已填寫' : '未填寫'}</td>
                  <td className="align-top">{a.status}</td>
                  <td className="align-top">
                    {a.checkedIn ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        已報到 {a.checkedInAt ? new Date(a.checkedInAt).toLocaleTimeString() : ''}
                      </span>
                    ) : (
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">尚未報到</span>
                    )}
                  </td>
                  <td className="align-top">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="space-y-2 py-3 align-top">
                    <div className="flex flex-col gap-2">
                      <button onClick={() => updateAppointment(a.id, { status: 'confirmed' })} className="rounded bg-green-600 px-2 py-1 text-white text-xs">確認預約</button>
                      <button onClick={() => setSelected(a)} className="rounded bg-blue-600 px-2 py-1 text-white text-xs">查看詳細</button>
                      <button onClick={() => {
                        const newDate = prompt('新的預約日期 (YYYY-MM-DD)', new Date(a.date).toISOString().slice(0,10))
                        const newTime = prompt('新的預約時間 (HH:MM)', a.appointmentTime)
                        if (newDate && newTime) updateAppointment(a.id, { date: newDate, appointmentTime: newTime })
                      }} className="rounded bg-yellow-500 px-2 py-1 text-white text-xs">修改日期/時間</button>
                      <button onClick={() => updateAppointment(a.id, { status: 'cancelled' })} className="rounded bg-red-600 px-2 py-1 text-white text-xs">取消預約</button>
                      <button onClick={() => updateAppointment(a.id, { status: 'ai_sent' })} className="rounded bg-indigo-600 px-2 py-1 text-white text-xs">發送 AI 問卷</button>
                      <button onClick={() => updateAppointment(a.id, { status: 'waitlist' })} className="rounded bg-slate-500 px-2 py-1 text-white text-xs">加入候補名單</button>
                      <button onClick={() => updateAppointment(a.id, { status: 'completed' })} className="rounded bg-teal-600 px-2 py-1 text-white text-xs">標記已完成</button>
                      <button onClick={() => updateAppointment(a.id, { status: 'no_show' })} className="rounded bg-gray-700 px-2 py-1 text-white text-xs">標記未到診</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">第 {page} 頁</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded border px-3 py-1">上一頁</button>
          <button onClick={() => setPage((p) => p + 1)} disabled={!hasMore} className="rounded border px-3 py-1">下一頁</button>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">預約詳細 — {selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-sm text-gray-600">關閉</button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">預約編號</p>
                <p className="font-medium">{selected.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">聯絡電話</p>
                <p className="font-medium">{selected.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selected.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">指定醫師</p>
                <p className="font-medium">{selected.doctorId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">預約類型</p>
                <p className="font-medium">{selected.service}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">問卷狀態</p>
                <p className="font-medium">{selected.message ? '已填寫' : '未填寫'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">預約日期</p>
                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="mt-1 rounded border px-3 py-2 w-full" />
              </div>
              <div>
                <p className="text-sm text-gray-500">預約時間</p>
                <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="mt-1 rounded border px-3 py-2 w-full" />
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">看診原因 / 問卷內容</p>
                <textarea value={selected.message || ''} readOnly className="mt-1 h-28 w-full rounded border px-3 py-2" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={() => { updateAppointment(selected.id, { status: 'confirmed' }); setSelected(null) }} className="rounded bg-green-600 px-4 py-2 text-white">確認預約</button>
              <button onClick={() => { updateAppointment(selected.id, { date: editDate, appointmentTime: editTime }); setSelected(null) }} className="rounded bg-yellow-500 px-4 py-2 text-white">儲存日期/時間</button>
              <button onClick={() => { updateAppointment(selected.id, { status: 'cancelled' }); setSelected(null) }} className="rounded bg-red-600 px-4 py-2 text-white">取消預約</button>
              <button onClick={() => { updateAppointment(selected.id, { status: 'ai_sent' }); setSelected(null) }} className="rounded bg-indigo-600 px-4 py-2 text-white">發送 AI 問卷</button>
              <button onClick={() => { updateAppointment(selected.id, { status: 'waitlist' }); setSelected(null) }} className="rounded bg-slate-500 px-4 py-2 text-white">加入候補</button>
              <button onClick={() => { updateAppointment(selected.id, { status: 'completed' }); setSelected(null) }} className="rounded bg-teal-600 px-4 py-2 text-white">標記已完成</button>
              <button onClick={() => { updateAppointment(selected.id, { status: 'no_show' }); setSelected(null) }} className="rounded bg-gray-700 px-4 py-2 text-white">標記未到診</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
