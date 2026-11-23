'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { IntegrationContract } from '@/lib/integrations/contracts'
import type { TestRun, TestStatus, TestStep } from '@/lib/architectureTests/types'

type Scenario = { id: string; name: string; fixture: unknown; steps: TestStep[] }
type Catalog = { simulationEnabled: boolean; contracts: IntegrationContract[]; schemas: Record<string, object>; scenarios: Scenario[]; history: TestRun[]; historyStatus: string; receipts: { service: string; at: string; status: 'Planned' }[]; recordedSoftwareVerification: { at: string | null; result: string; scope: string; connections: string[] } }
const styles: Record<TestStatus, string> = { Passed: 'bg-green-50 text-green-900 border-green-300', Failed: 'bg-red-50 text-red-900 border-red-300', 'Not Tested': 'bg-blue-50 text-blue-900 border-blue-300', Planned: 'bg-amber-50 text-amber-900 border-amber-300', 'Not Applicable': 'bg-gray-100 text-gray-700 border-gray-300' }
function Badge({ status }: { status: TestStatus }) { return <span className={`inline-block rounded border px-2 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span> }
function time(value: string) { return new Intl.DateTimeFormat('zh-TW', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value)) }

export default function ArchitectureTestCenter() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [selected, setSelected] = useState('kiosk-arrival')
  const [run, setRun] = useState<TestRun | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useRef<{ selection: string; runId: string } | null>(null)
  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/development/architecture-tests', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '無法載入測試中心。')
      setCatalog(data)
    } catch (reason) { setError(reason instanceof Error ? reason.message : '無法載入測試中心。') }
  }, [])
  useEffect(() => { void load() }, [load])
  async function execute(live = false) {
    if (busy) return
    const scenario = catalog?.scenarios.find(x => x.id === selected)
    if (!catalog || (!live && (!catalog.simulationEnabled || !scenario))) return
    const selection = live ? 'live-readonly' : selected
    const runId = pending.current?.selection === selection ? pending.current.runId : crypto.randomUUID()
    pending.current = { selection, runId }
    setBusy(true); setError('')
    try {
      const response = await fetch(live ? '/api/admin/development/architecture-tests/live' : '/api/admin/development/architecture-tests/simulate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(live ? { runId } : { runId, source: 'Development Simulation', scenario: selected, input: scenario!.fixture }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法確認測試結果；重試會保留同一識別碼。')
      setRun(result); pending.current = null
      await load()
    } catch (reason) { setError(reason instanceof Error ? reason.message : '無法確認測試結果。') }
    finally { setBusy(false) }
  }
  const scenario = catalog?.scenarios.find(x => x.id === selected)
  const steps = run?.scenario === selected || run?.scenario === 'live-readonly' ? run.steps : scenario?.steps || []
  return <section className="space-y-6">
    <div aria-label="結果圖例" className="flex flex-wrap items-center gap-2"><span className="text-sm">結果圖例：</span>{(Object.keys(styles) as TestStatus[]).map(status => <Badge key={status} status={status} />)}</div>
    <header><h1 className="text-3xl font-semibold text-[#355C46]">Architecture Test Center</h1><p className="mt-3 text-gray-700">管理員專用。格式與記憶體 sandbox 測試、已記錄的隔離資料庫測試及真實唯讀檢查分開顯示。Passed 只代表該步驟所列範圍。</p><Link href="/admin/development/architecture-status" className="mt-3 inline-block underline">返回系統架構狀態</Link></header>
    {error && <p role="alert" className="rounded border border-red-300 bg-red-50 p-4">{error}<button className="ml-3 underline" onClick={() => { setError(''); void load() }}>重新載入</button></p>}
    {!catalog ? <p role="status">{error ? '資料尚未載入。' : '載入中…'}</p> : <>
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-xl font-semibold">Development Simulation</h2>
        <p>僅傳送固定虛構輸入，不發送簡訊／郵件、不扣款、不寫入病人或臨床資料；只有安全的測試結果寫入稽核。每次測試使用獨立記憶體 sandbox。</p>
        {!catalog.simulationEnabled && <p className="rounded bg-amber-50 p-3">模擬器停用。需在開發環境設定 ARCHITECTURE_SIMULATION_ENABLED=true；正式環境永遠不啟用。</p>}
        <label className="block">測試流程<select className="ml-3 rounded border p-2" value={selected} disabled={busy} onChange={e => { setSelected(e.target.value); setRun(null) }}>{catalog.scenarios.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <div className="flex flex-wrap gap-3"><button className="rounded bg-[#355C46] px-4 py-2 text-white disabled:opacity-40" disabled={busy || !catalog.simulationEnabled} onClick={() => void execute()}>{busy ? '執行中…' : '執行虛構流程'}</button><button className="rounded border px-4 py-2 disabled:opacity-40" disabled={busy} onClick={() => void execute(true)}>執行真實唯讀連線檢查</button></div>
        <p className="text-sm text-gray-600">簡訊拒絕案例會刻意顯示 Failed，並確認後續報到安全停止。真實唯讀檢查會查詢現有服務，不代表實際登入、投遞或付款。</p>
        {run && <p role="status"><strong>來源：{run.source}</strong> · {time(run.checkedAt)}（洛杉磯時間） · <Badge status={run.status} />{run.duplicate && ' · 已還原既有紀錄，沒有重複寫入稽核。'}</p>}
        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr><th className="p-2">步驟</th><th>結果</th><th>範圍</th><th>說明</th></tr></thead><tbody>{steps.map(step => <tr key={step.id} className="border-t"><td className="p-3">{step.name}</td><td><Badge status={step.status} /></td><td>{step.scope}</td><td className="max-w-md p-2">{step.detail}</td></tr>)}</tbody></table></div>
        <details><summary className="cursor-pointer font-medium">查看實際送出的虛構輸入</summary><pre className="mt-3 overflow-auto rounded bg-gray-50 p-4 text-xs">{JSON.stringify({ source: 'Development Simulation', scenario: selected, input: scenario?.fixture }, null, 2)}</pre></details>
      </section>
      <section className="space-y-3 rounded-xl border bg-white p-5"><h2 className="text-xl font-semibold">收送契約與可準備的接收介面</h2><p className="text-sm">Receipt Only 只安全保存接收證據；applied=false，不更新本人、臨床、付款或權益紀錄。既有 Stripe／Clerk 繼續使用原生簽章端點。</p>{catalog.contracts.map(item => <details key={item.id} className="rounded border p-3"><summary className="cursor-pointer font-semibold">{item.name} · {item.readiness}</summary><dl className="mt-3 space-y-2 text-sm"><div><dt className="font-semibold">傳送</dt><dd>{item.sends}</dd></div><div><dt className="font-semibold">接收</dt><dd>{item.receives}</dd></div><div><dt className="font-semibold">端點／介面</dt><dd className="break-all font-mono text-xs">{item.endpoint}</dd></div><div><dt className="font-semibold">尚缺條件</dt><dd>{item.limitation}</dd></div></dl>{catalog.schemas[item.id] && <details className="mt-3"><summary>精確 JSON Schema v1</summary><pre className="overflow-auto bg-gray-50 p-3 text-xs">{JSON.stringify(catalog.schemas[item.id], null, 2)}</pre></details>}</details>)}</section>
      <section className="space-y-3 rounded-xl border bg-white p-5"><h2 className="text-xl font-semibold">最近測試與接收證據</h2>{catalog.historyStatus === 'Failed' ? <p role="alert">稽核紀錄無法載入，不能視為沒有測試。</p> : <>{!catalog.history.length && <p>尚無測試紀錄。所有未執行步驟維持 Not Tested。</p>}{catalog.history.map(item => <button key={item.runId} className="block w-full rounded border p-3 text-left" onClick={() => { setRun(item); if (item.scenario !== 'live-readonly') setSelected(item.scenario) }}><strong>{item.source}</strong> · {item.scenario} · {time(item.checkedAt)} · <Badge status={item.status} /></button>)}{catalog.receipts.map((receipt, index) => <p key={index} className="text-sm">External Adapter · {receipt.service} · {time(receipt.at)} · <Badge status="Planned" /> 接收證據已保存，業務尚未套用。</p>)}</>}</section>
      <section className="rounded-xl border bg-white p-5"><h2 className="text-xl font-semibold">已記錄的隔離 PostgreSQL 驗證</h2><p className="mt-2 text-sm">{catalog.recordedSoftwareVerification.result === 'passed' ? 'Passed（已記錄的隔離測試）' : 'Not Tested'}{catalog.recordedSoftwareVerification.at && ` · ${time(catalog.recordedSoftwareVerification.at)}`}</p><p className="mt-2 text-sm">{catalog.recordedSoftwareVerification.scope}</p><p className="mt-2 text-sm">此紀錄與現在的模擬、真實設備及服務檢查分開，不會因模擬 Passed 而把正式連線改成成功。</p></section>
    </>}
  </section>
}
