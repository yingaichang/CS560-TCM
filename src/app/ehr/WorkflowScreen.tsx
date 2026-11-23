'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Bill = { id: string; updatedAt: string; status: string; units: number; patient: { patientId: string }; encounter: { encounterId: string }; cptCode: { code: string; serviceName: string } }
type MedicationRecord = { id: string; updatedAt: string; active: boolean; dosage: string | null; frequency: string | null; route: string | null; patient: { patientId: string }; medication: { name: string } }
type Workflow = {
  billingRecords: Bill[]
  treatments: { id: string; treatmentId: string; treatmentType: string; units: number; encounter: { encounterId: string; patient: { patientId: string } } }[]
  medications: MedicationRecord[]
  documents: { id: string; name: string; documentType: string; patient: { patientId: string } }[]
  cptCodes: { id: string; code: string; serviceName: string }[]
  medicationCatalog: { id: string; name: string }[]
  patients: { id: string; patientId: string; firstName: string; lastName: string }[]
  intakes: { id: string; completedAt: string | null }[]
  canWrite: boolean; canReviewBilling: boolean
}

export default function WorkflowScreen({ module }: { module: 'dashboard' | 'treatments' | 'billing' | 'medications' | 'documents' }) {
  const [data, setData] = useState<Workflow | null>(null)
  const [encounters, setEncounters] = useState<{ id: string; encounterId: string; status: string; clinicalNote: { status: string } | null }[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const keys = useRef(new Map<string, string>())
  const load = useCallback(async () => {
    setError('')
    try {
      const response = await fetch('/api/ehr/workflow', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || '無法載入資料。')
      setData(payload)
      if (module === 'dashboard' || module === 'treatments') {
        const response = await fetch('/api/ehr/encounters', { cache: 'no-store' })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || '無法載入看診清單。')
        setEncounters(payload.encounters)
      }
    } catch (error) { setError(error instanceof Error ? error.message : '連線失敗，請重試。') }
  }, [module])
  useEffect(() => { void load() }, [load])
  async function command(payload: Record<string, unknown>) {
    const signature = JSON.stringify(payload)
    const key = keys.current.get(signature) || crypto.randomUUID()
    keys.current.set(signature, key)
    setBusy(true); setError(''); setMessage('')
    try {
      const response = await fetch('/api/ehr/workflow', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: signature })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法確認結果，重試會保留同一送出識別碼。')
      setMessage(result.duplicate ? '這筆操作已經處理，沒有重複建立紀錄。' : '紀錄已保存，並已建立稽核事件。')
      await load()
    } catch (error) { setError(error instanceof Error ? error.message : '無法確認結果，請重試。') }
    finally { setBusy(false) }
  }
  function submit(event: FormEvent<HTMLFormElement>, action: string) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())
    void command({ action, ...values, ...(action === 'record_treatment' ? { units: Number(values.units) } : {}) })
  }
  const title = { dashboard: '診所總覽', treatments: '治療紀錄', billing: '帳務管理', medications: '用藥紀錄', documents: '文件索引' }[module]
  return <>
    <header className="ehr-page-heading"><div><h1>{title}</h1><p>顯示您有權限存取的已儲存紀錄。</p></div><button className="ehr-button ehr-button-light" onClick={() => void load()} disabled={busy}>重新整理</button></header>
    {error && <p role="alert" className="p-4 bg-red-50 text-red-800">{error} 最新結果尚未確認，請重新整理。</p>}
    {message && <p role="status" className="p-4 bg-green-50">{message}</p>}
    {!data ? <p>{error ? '資料尚未載入。' : '載入中…'}</p> : <>
      {module === 'dashboard' && <div className="ehr-module-grid">{[
        ['病人清單', data.patients.length, '/ehr/patients'], ['看診工作清單', encounters.length, '/ehr/encounters'], ['已儲存問卷', data.intakes.length, '/ehr/intake'], ['病歷草稿', encounters.filter(x => x.clinicalNote?.status === 'draft').length, '/ehr/notes'], ['待審核帳務', data.billingRecords.filter(x => x.status === 'draft').length, '/ehr/billing'],
      ].map(([label, count, href]) => <Link className="ehr-module-item" key={href} href={String(href)}><h2>{label}</h2><p>{count} 筆</p></Link>)}<p>數量來自目前可見清單；看診、問卷及帳務最多各顯示最近 100 筆。</p></div>}
      {module === 'treatments' && <>
        {data.canWrite && <form className="ehr-panel p-4 grid gap-3" onSubmit={e => submit(e, 'record_treatment')}>
          <h2>登錄開發用治療紀錄</h2><p>請先在看診工作清單儲存並簽核病歷。此操作只建立治療紀錄及帳務草稿，不會收費。</p>
          <label>看診<select name="encounterId" required><option value="">請選擇</option>{encounters.filter(x => x.clinicalNote?.status === 'signed' && x.status !== 'cancelled').map(x => <option key={x.id} value={x.id}>{x.encounterId}</option>)}</select></label>
          <label>CPT<select name="cptCodeId" required><option value="">請選擇</option>{data.cptCodes.map(x => <option key={x.id} value={x.id}>{x.code} · {x.serviceName}</option>)}</select></label>
          <label>單位數<input name="units" type="number" min={1} max={100} defaultValue={1} required /></label><label>備註<textarea name="notes" maxLength={2000} /></label><button className="ehr-button" disabled={busy}>保存治療與帳務草稿</button>
        </form>}
        <Rows headings={['治療編號', '看診', '病歷編號', '項目', '單位數']} rows={data.treatments.map(x => [x.treatmentId, x.encounter.encounterId, x.encounter.patient.patientId, x.treatmentType, x.units])} />
      </>}
      {module === 'billing' && <><p>帳務審核只更新內部紀錄，不代表付款成功或保險申報完成。</p><Rows headings={['病歷編號', '看診', 'CPT', '單位數', '狀態', '操作']} rows={data.billingRecords.map(x => [x.patient.patientId, x.encounter.encounterId, x.cptCode.code, x.units, x.status, data.canReviewBilling && x.status === 'draft' ? <button key={x.id} disabled={busy} onClick={() => void command({ action: 'review_billing', billingId: x.id, expectedUpdatedAt: x.updatedAt })}>確認審核</button> : '—'])} /></>}
      {module === 'medications' && <>
        {data.canWrite && <form className="ehr-panel p-4 grid gap-3" onSubmit={e => submit(e, 'record_medication')}><h2>登錄開發用用藥紀錄</h2><p>記錄病人目前用藥，不會開立或送出處方。</p>
          <label>病人<select name="patientId" required><option value="">請選擇</option>{data.patients.map(x => <option key={x.id} value={x.id}>{x.patientId} · {x.firstName} {x.lastName}</option>)}</select></label>
          <label>藥品<select name="medicationId" required><option value="">請選擇</option>{data.medicationCatalog.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label>劑量<input name="dosage" required maxLength={200} /></label><label>頻率<input name="frequency" maxLength={200} /></label><label>途徑<input name="route" maxLength={100} /></label><button className="ehr-button" disabled={busy}>保存紀錄</button></form>}
        <Rows headings={['病歷編號', '藥品', '劑量', '頻率', '途徑', '狀態', '操作']} rows={data.medications.map(x => [x.patient.patientId, x.medication.name, x.dosage, x.frequency, x.route, x.active ? '使用中' : '已停用', data.canWrite && x.active ? <button key={x.id} disabled={busy} onClick={() => void command({ action: 'stop_medication', medicationRecordId: x.id, expectedUpdatedAt: x.updatedAt })}>記錄停用</button> : '—'])} />
      </>}
      {module === 'documents' && <><p>此處顯示已保存的文件索引；不會把索引存在當成檔案已可下載。</p><Rows headings={['病歷編號', '文件', '類型']} rows={data.documents.map(x => [x.patient.patientId, x.name, x.documentType])} /></>}
    </>}
  </>
}

function Rows({ headings, rows }: { headings: string[]; rows: (React.ReactNode)[][] }) {
  return rows.length ? <div className="ehr-table-wrap ehr-panel"><table className="ehr-table"><thead><tr>{headings.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j}>{v ?? '未記錄'}</td>)}</tr>)}</tbody></table></div> : <p className="ehr-empty">目前沒有可見紀錄。</p>
}
