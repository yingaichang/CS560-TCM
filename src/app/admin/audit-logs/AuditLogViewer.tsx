'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

type AuditEvent = {
  id: string
  userId: string | null
  externalUserId: string | null
  serviceId: string | null
  action: string
  resource: string
  resourceId: string | null
  module: string
  actorRole: string
  source: string
  outcome: string
  sessionId: string | null
  summary: string
  previousHash: string | null
  entryHash: string | null
  createdAt: string
}

const pageSize = 50

export default function AuditLogViewer() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [action, setAction] = useState('')
  const [resource, setResource] = useState('')
  const [source, setSource] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [verifyState, setVerifyState] = useState<'idle' | 'checking' | 'valid' | 'failed'>('idle')

  useEffect(() => {
    const params = new URLSearchParams({ take: String(pageSize), skip: String(skip) })
    if (action.trim()) params.set('action', action.trim())
    if (resource.trim()) params.set('resource', resource.trim())
    if (source.trim()) params.set('source', source.trim())
    if (from) params.set('from', from)
    if (to) params.set('to', to)

    let active = true
    setLoading(true)
    fetch(`/api/admin/audit-logs?${params.toString()}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load audit events')
        if (active) {
          setEvents(data.events)
          setTotal(data.total)
          setError('')
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load audit events')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [action, resource, source, from, to, skip])

  const resetFilters = () => {
    setAction('')
    setResource('')
    setSource('')
    setFrom('')
    setTo('')
    setSkip(0)
  }

  const verifyChain = async () => {
    setVerifyState('checking')
    try {
      const response = await fetch('/api/admin/audit-logs/verify-chain', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Chain verification failed')
      setVerifyState(data.valid ? 'valid' : 'failed')
    } catch {
      setVerifyState('failed')
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-[#718078]">Administration / Security</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#203c33]">Audit log</h1>
          <p className="mt-1 text-sm text-gray-600">Recorded access and changes across clinic operations.</p>
          <p className="mt-1 max-w-3xl text-xs text-gray-500">Hash verification provides tamper evidence only; it does not replace access controls, secure storage, monitoring, backups, or compliance procedures.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {verifyState === 'valid' ? <span className="text-sm font-semibold text-green-700" role="status">Verify Chain: Valid</span> : null}
          {verifyState === 'failed' ? <span className="text-sm font-semibold text-red-700" role="alert">Verify Chain: Failed</span> : null}
          <button className="rounded border border-[#426451] px-3 py-2 text-sm font-semibold text-[#426451] disabled:opacity-50" type="button" disabled={verifyState === 'checking'} onClick={verifyChain}>
            {verifyState === 'checking' ? 'Verifying…' : 'Verify Chain'}
          </button>
          <span className="rounded border border-[#dce3dd] bg-white px-3 py-2 text-xs text-gray-600">{total} events</span>
        </div>
      </header>

      <section className="rounded border border-gray-200 bg-white p-4" aria-label="Audit log filters">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="flex items-center gap-2 rounded border border-gray-200 px-3 lg:col-span-2">
            <Search size={15} className="text-gray-500" />
            <input className="min-w-0 flex-1 py-2 text-sm outline-none" value={action} onChange={(event) => { setAction(event.target.value); setSkip(0) }} placeholder="Filter action" aria-label="Filter action" />
          </label>
          <input className="rounded border border-gray-200 px-3 py-2 text-sm" value={resource} onChange={(event) => { setResource(event.target.value); setSkip(0) }} placeholder="Resource" aria-label="Filter resource" />
          <input className="rounded border border-gray-200 px-3 py-2 text-sm" value={source} onChange={(event) => { setSource(event.target.value); setSkip(0) }} placeholder="Source" aria-label="Filter source" />
          <input className="rounded border border-gray-200 px-3 py-2 text-sm" type="date" value={from} onChange={(event) => { setFrom(event.target.value); setSkip(0) }} aria-label="From date" />
          <input className="rounded border border-gray-200 px-3 py-2 text-sm" type="date" value={to} onChange={(event) => { setTo(event.target.value); setSkip(0) }} aria-label="To date" />
        </div>
        <button className="mt-3 text-xs font-semibold text-[#426451] hover:underline" type="button" onClick={resetFilters}>Clear filters</button>
      </section>

      <section className="overflow-hidden rounded border border-gray-200 bg-white">
        {error ? <p className="p-6 text-sm text-red-700" role="alert">{error}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1900px] border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>
              <th className="px-4 py-3">UTC date and time</th><th className="px-4 py-3">Event ID</th><th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">User / service ID</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Related record ID</th><th className="px-4 py-3">Result</th><th className="px-4 py-3">Session ID</th>
              <th className="px-4 py-3">Safe change summary</th><th className="px-4 py-3">Previous hash</th><th className="px-4 py-3">Entry hash</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => <tr key={event.id}>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{new Date(event.createdAt).toISOString().replace('T', ' ').replace('Z', ' UTC')}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{event.id}</td>
                <td className="px-4 py-3 text-gray-700">{event.module}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{event.userId || event.externalUserId || event.serviceId || '—'}</td>
                <td className="px-4 py-3 text-gray-700">{event.actorRole}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{event.action}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{event.resourceId || '—'}</td>
                <td className="px-4 py-3">{event.outcome}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{event.sessionId || '—'}</td>
                <td className="px-4 py-3 text-gray-700">{event.summary}</td>
                <td className="max-w-64 break-all px-4 py-3 font-mono text-[10px] text-gray-600">{event.previousHash || '—'}</td>
                <td className="max-w-64 break-all px-4 py-3 font-mono text-[10px] text-gray-600">{event.entryHash || '—'}</td>
              </tr>)}
              {!loading && events.length === 0 ? <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={12}>No audit events match these filters.</td></tr> : null}
              {loading ? <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={12}>Loading audit events…</td></tr> : null}
            </tbody>
          </table>
        </div>
        <footer className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-600">
          <span>{total ? `${skip + 1}–${Math.min(skip + pageSize, total)} of ${total}` : '0 events'}</span>
          <div className="flex gap-2">
            <button className="rounded border border-gray-200 p-2 disabled:opacity-40" type="button" aria-label="Previous page" disabled={skip === 0 || loading} onClick={() => setSkip(Math.max(0, skip - pageSize))}><ChevronLeft size={16} /></button>
            <button className="rounded border border-gray-200 p-2 disabled:opacity-40" type="button" aria-label="Next page" disabled={skip + pageSize >= total || loading} onClick={() => setSkip(skip + pageSize)}><ChevronRight size={16} /></button>
          </div>
        </footer>
      </section>
    </div>
  )
}