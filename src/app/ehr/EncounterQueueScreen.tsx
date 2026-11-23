'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'

type Encounter = {
  id: string
  encounterId: string
  patientId: string
  providerId: string | null
  encounterDate: string
  visitType: string
  chiefComplaint: string | null
  status: string
  patient: { id: string; patientId: string; firstName: string; lastName: string }
  provider: { id: string; name: string | null } | null
  appointment: { appointmentTime: string; doctorId: string; checkedInAt: string | null } | null
  clinicalNote: {
    id: string
    status: string
    signedAt: string | null
    observationTongue: string | null
    inquirySymptoms: string | null
    palpationPulse: string | null
    assessment: { patternAssessment: string | null; treatmentPrinciple: string | null; followUpPlan: string | null } | null
  } | null
}

type Provider = { id: string; name: string | null }

export default function EncounterQueueScreen() {
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [canWriteNotes, setCanWriteNotes] = useState(false)
  const [canManageQueue, setCanManageQueue] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [savingId, setSavingId] = useState('')

  const loadQueue = async () => {
    setError('')
    try {
      const response = await fetch('/api/ehr/encounters', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法載入看診工作清單。')
      setEncounters(result.encounters)
      setProviders(result.providers)
      setCanWriteNotes(result.canWriteNotes)
      setCanManageQueue(result.canManageQueue)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '無法載入看診工作清單。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadQueue() }, [])

  const updateEncounter = async (id: string, values: { providerId?: string | null; status?: string }) => {
    setSavingId(id)
    setError('')
    setMessage('')
    try {
      const response = await fetch(`/api/ehr/encounters/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法更新看診紀錄。')
      setMessage('看診紀錄已更新。')
      await loadQueue()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '無法更新看診紀錄。')
    } finally {
      setSavingId('')
    }
  }

  const saveDraft = async (event: FormEvent<HTMLFormElement>, encounter: Encounter) => {
    event.preventDefault()
    setSavingId(encounter.id)
    setError('')
    setMessage('')
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    try {
      const response = await fetch(`/api/ehr/encounters/${encodeURIComponent(encounter.id)}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法儲存病歷草稿。')
      setMessage('病歷草稿已儲存，尚未簽核。')
      await loadQueue()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '無法儲存病歷草稿。')
    } finally {
      setSavingId('')
    }
  }

  return (
    <>
      <header className="ehr-page-heading">
        <div><div className="ehr-eyebrow">醫療人員工作流程</div><h1>看診工作清單</h1><p>顯示已關聯病人資料的看診；報到不會自動指派醫師或完成臨床簽核。</p></div>
        <Link className="ehr-button" href="/ehr/patients">查看病人清單</Link>
      </header>
      <div className="ehr-demo-banner">僅使用開發資料。新報到紀錄會保持待指派／草稿狀態，不代表已完成診斷或治療。</div>
      {message ? <p className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800" role="status">{message}</p> : null}
      {error ? <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}<button type="button" className="ml-2 underline" onClick={() => void loadQueue()}>重試</button></p> : null}
      <section className="ehr-panel">
        {loading ? <p className="p-5" role="status">正在載入看診工作清單…</p> : encounters.length === 0 ? (
          <p className="ehr-empty">目前沒有已連結病人的看診。請先由預約管理員確認並連結病人，完成報到後此處才會建立看診。</p>
        ) : (
          <div className="ehr-table-wrap"><table className="ehr-table min-w-[980px]">
            <thead><tr><th>病歷／病人</th><th>日期與時間</th><th>看診項目／主訴</th><th>醫師指派</th><th>狀態</th><th>臨床草稿</th></tr></thead>
            <tbody>{encounters.map((encounter) => (
              <tr key={encounter.id}>
                <td><Link className="font-semibold text-[#355C46] underline" href={`/ehr/patients/${encodeURIComponent(encounter.patient.id)}`}>{encounter.patient.patientId} · {encounter.patient.firstName} {encounter.patient.lastName}</Link><div className="ehr-table-sub">{encounter.encounterId}</div></td>
                <td>{new Date(encounter.encounterDate).toLocaleDateString('zh-TW')}<div className="ehr-table-sub">{encounter.appointment?.appointmentTime || '時間待安排'}</div></td>
                <td>{encounter.visitType}<div className="ehr-table-sub">{encounter.chiefComplaint || '未提供主訴'}</div></td>
                <td>{providers.length ? <select aria-label={`${encounter.encounterId} 指派醫師`} value={encounter.providerId || ''} disabled={savingId === encounter.id || !canManageQueue} onChange={(event) => void updateEncounter(encounter.id, { providerId: event.target.value || null })}><option value="">待指派</option>{providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name || '未命名醫師'}</option>)}</select> : encounter.provider?.name || '待指派'}</td>
                <td><select aria-label={`${encounter.encounterId} 狀態`} value={encounter.status} disabled={savingId === encounter.id || !canManageQueue} onChange={(event) => void updateEncounter(encounter.id, { status: event.target.value })}><option value="checked_in">已報到・待看診</option><option value="scheduled">已排程</option><option value="in_progress">進行中</option><option value="completed">已完成</option><option value="cancelled">已取消</option></select></td>
                <td>{encounter.clinicalNote ? `${encounter.clinicalNote.status === 'signed' ? '已簽核' : '草稿'}` : '尚無病歷'}{encounter.clinicalNote?.signedAt ? <div className="ehr-table-sub">{new Date(encounter.clinicalNote.signedAt).toLocaleString('zh-TW')}</div> : null}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
      {canWriteNotes ? <section className="space-y-4">
        <h2 className="ehr-section-title">醫師病歷草稿</h2>
        {encounters.filter((encounter) => encounter.providerId && encounter.clinicalNote?.status !== 'signed').map((encounter) => (
          <details key={encounter.id} className="ehr-panel p-4">
            <summary className="cursor-pointer font-semibold text-[#355C46]">{encounter.encounterId} · {encounter.patient.firstName} {encounter.patient.lastName} · 草稿（未簽核）</summary>
            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => void saveDraft(event, encounter)}>
              <label className="ehr-field">望診・舌象<textarea name="observationTongue" maxLength={1000} defaultValue={encounter.clinicalNote?.observationTongue || ''} /></label>
              <label className="ehr-field">問診・症狀<textarea name="inquirySymptoms" maxLength={3000} defaultValue={encounter.clinicalNote?.inquirySymptoms || ''} /></label>
              <label className="ehr-field">切診・脈象<textarea name="palpationPulse" maxLength={1000} defaultValue={encounter.clinicalNote?.palpationPulse || ''} /></label>
              <label className="ehr-field">辨證<textarea name="patternAssessment" maxLength={2000} defaultValue={encounter.clinicalNote?.assessment?.patternAssessment || ''} /></label>
              <label className="ehr-field">治則<textarea name="treatmentPrinciple" maxLength={2000} defaultValue={encounter.clinicalNote?.assessment?.treatmentPrinciple || ''} /></label>
              <label className="ehr-field">追蹤計畫<textarea name="followUpPlan" maxLength={2000} defaultValue={encounter.clinicalNote?.assessment?.followUpPlan || ''} /></label>
              <div className="md:col-span-2"><button className="ehr-button" type="submit" disabled={savingId === encounter.id}>{savingId === encounter.id ? '儲存中…' : '儲存病歷草稿'}</button><span className="ml-3 text-sm text-gray-600">草稿不會簽核，也不會自動產生診斷或帳務。</span></div>
            </form>
          </details>
        ))}
        {encounters.every((encounter) => !encounter.providerId || encounter.clinicalNote?.status === 'signed') ? <p className="ehr-empty">尚無指派給您且可編輯的病歷草稿。</p> : null}
      </section> : null}
    </>
  )
}
