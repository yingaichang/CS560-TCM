'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Encounter = { id: string; encounterId: string; encounterDate: string; visitType: string; status: string; clinicalNote: { status: string } | null }
export default function PatientEncounterHistory({ patientId, recordId }: { patientId: string; recordId?: string }) {
  const [records, setRecords] = useState<Encounter[] | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    setRecords(null); setError('')
    fetch(`/api/ehr/patients/${encodeURIComponent(patientId)}`, { cache: 'no-store' }).then(async response => {
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '無法載入病歷。')
      const rows: Encounter[] = result.patient.encounters
      if (recordId && !rows.some(row => row.id === recordId)) throw new Error('這筆病歷不存在於目前可見的病人看診清單。')
      if (active) setRecords(recordId ? rows.filter(row => row.id === recordId) : rows)
    }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : '無法載入病歷。') })
    return () => { active = false }
  }, [patientId, recordId])
  return <>
    <p className="mb-4 text-sm">病歷編輯與簽核由已指派的醫師在看診工作清單操作；已簽核病歷保持唯讀。此處最多顯示最近 20 次看診。</p>
    {error ? <p role="alert">{error} 請重新整理後重試。</p> : !records ? <p>載入中…</p> : records.length ? <table className="w-full text-left text-sm"><thead><tr><th>看診</th><th>日期</th><th>項目</th><th>狀態</th><th>病歷</th><th>操作</th></tr></thead><tbody>{records.map(row => <tr key={row.id}><td className="py-3">{row.encounterId}</td><td>{new Date(row.encounterDate).toLocaleDateString('zh-TW')}</td><td>{row.visitType}</td><td>{row.status}</td><td>{row.clinicalNote?.status || '尚無病歷'}</td><td><Link className="underline" href={`/ehr/encounters#${encodeURIComponent(row.id)}`}>開啟看診工作清單</Link></td></tr>)}</tbody></table> : <p>尚無已儲存看診；請先連結預約與病人，完成報到後再指派醫師。</p>}
  </>
}
