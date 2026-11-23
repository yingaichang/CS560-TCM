'use client'

import { chineseText } from '@/lib/chinese'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import {
  ArrowRight, AudioLines, CalendarClock, Check, ClipboardCheck, Clock3,
  FilePlus2, Plus, Search, ShieldCheck, UsersRound,
} from 'lucide-react'
import { cptCodes, medicalConditions, symptomGroups } from '@/lib/ehr/catalog'
import { demoPatients, type DemoPatient } from '@/lib/ehr/demoPatients'
import EncounterQueueScreen from './EncounterQueueScreen'

function DemoBanner({ children = 'Synthetic development records only. Do not enter real patient information.' }: { children?: string }) {
  return <div className="ehr-demo-banner"><ShieldCheck aria-hidden="true" />{chineseText(children)}</div>
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="ehr-page-heading">
      <div><div className="ehr-eyebrow">{chineseText(eyebrow)}</div><h1>{chineseText(title)}</h1><p>{chineseText(description)}</p></div>
      {action}
    </div>
  )
}

export function DashboardScreen() {
  return (
    <>
      <PageHeading eyebrow="2026 年 9 月 28 日・星期一" title="診所總覽" description="查看今日看診安排及待追蹤事項。" action={<Link className="ehr-button" href="/ehr/intake"><Plus /> 新增初診問卷</Link>} />
      <DemoBanner />
      <section className="ehr-stats" aria-label="診所摘要">
        {[
          { label: 'Active patients', value: '128', detail: 'Across the clinic', icon: UsersRound },
          { label: 'Today’s encounters', value: '12', detail: '4 remaining', icon: CalendarClock },
          { label: 'Intakes to review', value: '03', detail: 'Provider review required', icon: ClipboardCheck },
          { label: 'Open notes', value: '02', detail: 'Draft documentation', icon: FilePlus2 },
        ].map(({ label, value, detail, icon: Icon }) => <div className="ehr-stat" key={label}><div className="ehr-stat-label">{chineseText(label)}<span className="ehr-stat-icon"><Icon /></span></div><div className="ehr-stat-value">{chineseText(value)}</div><div className="ehr-stat-detail">{chineseText(detail)}</div></div>)}
      </section>
      <div className="ehr-dashboard-grid">
        <section className="ehr-panel">
          <div className="ehr-panel-head"><h2>今日排程</h2><Link href="/ehr/encounters">全部看診紀錄 <ArrowRight size={13} /></Link></div>
          <div className="ehr-panel-body">
            {[
              ['09:00', 'Avery Chen', 'Follow-up · Neck and shoulder tension', 'Checked in'],
              ['10:15', 'Jordan Lee', 'Initial evaluation · Intake due', 'Arriving'],
              ['11:30', 'Riley Wong', 'Treatment only · Low back discomfort', 'Confirmed'],
              ['13:00', 'Sam Patel', 'Follow-up · Digestive wellness', 'Confirmed'],
            ].map(([time, name, detail, status]) => <div className="ehr-visit-row" key={time}><div className="ehr-time">{chineseText(time)}</div><div><div className="ehr-visit-name">{chineseText(name)}</div><div className="ehr-visit-detail">{chineseText(detail)}</div></div><span className={`ehr-status${status === 'Arriving' ? ' ehr-status-warning' : ''}`}>{chineseText(status)}</span></div>)}
          </div>
        </section>
        <section className="ehr-panel">
          <div className="ehr-panel-head"><h2>待處理事項</h2><span className="ehr-eyebrow" style={{ margin: 0 }}>3 件事項</span></div>
          <div className="ehr-queue">
            <Link className="ehr-queue-item" href="/ehr/intake"><span className="ehr-queue-icon"><ClipboardCheck /></span><span><span className="ehr-queue-title">待審核初診問卷</span><span className="ehr-queue-sub">需醫療人員簽核</span></span><span className="ehr-queue-count">03</span></Link>
            <Link className="ehr-queue-item" href="/ehr/notes"><span className="ehr-queue-icon"><NotebookPenIcon /></span><span><span className="ehr-queue-title">病歷草稿</span><span className="ehr-queue-sub">完成臨床病歷記錄</span></span><span className="ehr-queue-count">02</span></Link>
            <Link className="ehr-queue-item" href="/ehr/billing"><span className="ehr-queue-icon"><Clock3 /></span><span><span className="ehr-queue-title">待審核帳務</span><span className="ehr-queue-sub">關聯看診紀錄</span></span><span className="ehr-queue-count">04</span></Link>
          </div>
        </section>
      </div>
      <nav className="ehr-workflow" aria-label="病人照護流程">
        {[
          ['Patients', '/ehr/patients'], ['Intake', '/ehr/intake'], ['Encounter', '/ehr/encounters'],
          ['TCM note', '/ehr/notes'], ['Treatment', '/ehr/treatments'], ['Billing', '/ehr/billing'],
        ].map(([label, href], index) => <Link key={href} href={href}><span>{index + 1}</span>{chineseText(label)}</Link>)}
      </nav>
    </>
  )
}

function NotebookPenIcon() {
  return <FilePlus2 aria-hidden="true" />
}

export function PatientDirectoryScreen() {
  const [search, setSearch] = useState('')
  const [records, setRecords] = useState<DemoPatient[]>(demoPatients)

  useEffect(() => {
    fetch('/api/ehr/patients').then(async (response) => response.ok ? response.json() : null).then((payload) => {
      if (!payload?.patients?.length) return
      setRecords(payload.patients.map((item: Record<string, unknown>) => {
        const profile = item.profile as Record<string, string | null> | null
        const birthDate = typeof item.dateOfBirth === 'string' ? new Date(item.dateOfBirth) : null
        const age = birthDate ? Math.max(0, new Date().getFullYear() - birthDate.getFullYear()) : 0
        const lastVisit = profile?.lastVisitAt ? new Date(profile.lastVisitAt).toLocaleDateString('zh-TW') : 'No visits'
        return {
          id: item.id as string,
          patientId: item.patientId as string,
          firstName: item.firstName as string,
          lastName: item.lastName as string,
          age,
          gender: (item.gender as string) || 'Not recorded',
          phone: (item.phone as string) || '',
          email: (item.email as string) || '',
          language: (item.preferredLanguage as string) || 'Not recorded',
          status: item.status === 'active' ? 'Active' : 'Follow-up',
          lastVisit,
          nextVisit: 'Not scheduled',
          complaint: 'No complaint recorded',
          emergencyContact: profile?.emergencyContact || '',
          relationship: profile?.emergencyRelationship || '',
          emergencyPhone: profile?.emergencyContactPhone || '',
          dateOfBirth: birthDate?.toLocaleDateString('zh-TW') || 'Not recorded',
          address: [profile?.address, profile?.city, profile?.state, profile?.postalCode].filter(Boolean).join(' · '),
          createdAt: item.createdAt ? new Date(item.createdAt as string).toLocaleDateString('zh-TW') : 'Not recorded',
        }
      }))
    }).catch(() => setRecords(demoPatients))
  }, [])

  const filtered = records.filter((patient) => `${patient.firstName} ${patient.lastName} ${patient.patientId} ${patient.complaint}`.toLowerCase().includes(search.toLowerCase()))
  return (
    <>
      <PageHeading eyebrow="病人病歷" title="病人管理" description="查詢並檢視病人的照護資料。" action={<Link className="ehr-button" href="/ehr/patients/new"><Plus /> 新增病人</Link>} />
      <DemoBanner />
      <div className="ehr-search-row"><label className="ehr-search"><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜尋模擬病人資料" aria-label="搜尋病人" /></label><span className="ehr-table-sub">{filtered.length} 筆模擬資料</span></div>
      <section className="ehr-panel"><div className="ehr-table-wrap"><table className="ehr-table"><thead><tr><th>病人</th><th>病歷編號</th><th>主要健康問題</th><th>上次看診</th><th>下次看診</th><th>狀態</th></tr></thead><tbody>
        {filtered.map((patient) => <tr key={patient.id}><td><div className="ehr-patient-cell"><span className="ehr-patient-initials">{chineseText(patient.firstName[0])}{chineseText(patient.lastName[0])}</span><span><Link href={`/ehr/patients/${patient.id}`}>{chineseText(patient.firstName)} {chineseText(patient.lastName)}</Link><div className="ehr-table-sub">{chineseText(patient.age)} 歲・ {chineseText(patient.gender)}</div></span></div></td><td>{chineseText(patient.patientId)}</td><td>{chineseText(patient.complaint)}</td><td>{chineseText(patient.lastVisit)}</td><td>{chineseText(patient.nextVisit)}</td><td><span className={`ehr-status${patient.status === 'Intake due' ? ' ehr-status-warning' : ''}`}>{chineseText(patient.status)}</span></td></tr>)}
        {filtered.length === 0 && <tr><td colSpan={6} className="ehr-empty">沒有符合條件的模擬資料。</td></tr>}
      </tbody></table></div></section>
    </>
  )
}

const tabs = ['Overview', 'Intake', 'Medical History', 'Symptoms', 'Medications', 'Allergies', 'Family History', "Women's Health", 'Encounters', 'Treatments', 'Billing', 'Documents']
const lifestyleCategories = ['Smoking', 'Alcohol use', 'Coffee / caffeine', 'Drug use', 'Restricted diet', 'Exercise', 'Other habits']

function hasStoredRecord(record: StoredPatientRecord | undefined) {
  return Boolean(record)
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="ehr-detail"><div className="ehr-detail-label">{chineseText(label)}</div><div className="ehr-detail-value">{chineseText(value || 'Not recorded')}</div></div>
}

type StoredPatientRecord = {
  intakes: Array<{ majorComplaints: string | null; frequency: string | null; symptomChange: string | null; painIntensity: number | null; selections: Array<{ kind: string; value: string }>; diagnosticTests: Array<{ testType: string; testDate: string | null; location: string | null }> }>
  medicalHistories: Array<{ category: string; condition: string; details: string | null }>
  familyHistories: Array<{ condition: string; relative: string | null; details: string | null }>
  allergies: Array<{ allergen: string; reaction: string | null; severity: string | null }>
  symptoms: Array<{ present: boolean; severity: number | null; symptom: { category: string; name: string } }>
  medications: Array<{ dosage: string | null; unit: string | null; frequency: string | null; route: string | null; active: boolean; medication: { name: string; category: string } }>
  interviews: Array<{ status: string; startedAt: string | null; completedAt: string | null; transcript: string | null; structuredResponses: string | null; aiSummary: string | null; reviewRequired: boolean; providerReviewed: boolean; providerReviewDate: string | null }>
  womensHealth: Record<string, string | number | boolean | null> | null
  encounters: Array<{
    encounterId: string; encounterDate: string; visitType: string; chiefComplaint: string | null; status: string
    clinicalNote: { status: string; assessment: { patternAssessment: string | null; treatmentPrinciple: string | null } | null } | null
    treatments: Array<{ treatmentId: string; treatmentType: string; durationMinutes: number | null; units: number }>
    billingRecords: Array<{ units: number; status: string; cptCode: { code: string; serviceName: string } }>
  }>
  documents: Array<{ name: string; documentType: string; createdAt: string }>
}

export function PatientProfileScreen({ patient, record }: { patient: DemoPatient; record?: StoredPatientRecord }) {
  const [tab, setTab] = useState('Overview')
  const detailFields = [
    ['Date of birth', patient.dateOfBirth], ['Gender', patient.gender], ['Phone', patient.phone], ['Email', patient.email],
    ['Preferred language', patient.language], ['Date created', patient.createdAt], ['Last visit', patient.lastVisit],
    ['Emergency contact', patient.emergencyContact], ['Relationship', patient.relationship], ['Emergency phone', patient.emergencyPhone],
  ]

  return (
    <>
      <PageHeading eyebrow="病人資料" title="照護紀錄" description="查看照護摘要及相關臨床紀錄。" action={<Link className="ehr-button ehr-button-light" href="/ehr/intake"><FilePlus2 /> 新增初診問卷</Link>} />
      <DemoBanner />
      <section className="ehr-profile-head">
        <div className="ehr-profile-avatar">{chineseText(patient.firstName[0])}{chineseText(patient.lastName[0])}</div>
        <div><div className="ehr-profile-name">{chineseText(patient.firstName)} {chineseText(patient.lastName)}</div><div className="ehr-profile-meta"><span>{chineseText(patient.patientId)}</span><span>{chineseText(patient.age)} 歲</span><span>{chineseText(patient.status)}</span><span>建檔於 {chineseText(patient.createdAt)}</span></div></div>
        <div className="ehr-profile-actions"><Link className="ehr-button ehr-button-light" href="/ehr/encounters"><CalendarClock /> 看診紀錄</Link></div>
      </section>
      {hasStoredRecord(record) ? <StoredProfileTabs patient={patient} record={record as StoredPatientRecord} tab={tab} setTab={setTab} /> : <>
      <div className="ehr-tabs" role="tablist" aria-label="病歷分頁">
        {tabs.map((item) => <button className="ehr-tab" key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{chineseText(item)}</button>)}
      </div>
      <section className="ehr-profile-content" role="tabpanel">
        {tab === 'Overview' && <><h2 className="ehr-section-title">病人資料</h2><div className="ehr-detail-grid">{detailFields.map(([label, value]) => <Detail key={label} label={label} value={value} />)}<Detail label="地址" value={patient.address} /><Detail label="主要健康問題" value={patient.complaint} /></div><h2 className="ehr-section-title">照護摘要</h2><div className="ehr-module-grid"><div className="ehr-module-item"><h3>初診問卷</h3><p>{record ? `${record.intakes.length} intake records on file.` : patient.status === 'Intake due' ? 'Initial intake not yet reviewed.' : 'Patient-reported intake on file · provider review recorded.'}</p></div><div className="ehr-module-item"><h3>臨床病歷</h3><p>{record ? `${record.encounters.filter((encounter) => encounter.clinicalNote).length} provider notes on file.` : 'Latest note remains separate from patient-reported information.'}</p></div><div className="ehr-module-item"><h3>下次預約</h3><p>{chineseText(patient.nextVisit)}{chineseText(record ? '' : ' · Follow-up visit')}</p></div></div></>}
        {tab === 'Intake' && <>{record ? <><h2 className="ehr-section-title">病人自述問卷</h2>{record.intakes.length ? <div className="ehr-detail-grid"><Detail label="主要不適" value={record.intakes[0].majorComplaints} /><Detail label="症狀頻率" value={record.intakes[0].frequency} /><Detail label="症狀變化" value={record.intakes[0].symptomChange} /><Detail label="疼痛程度" value={record.intakes[0].painIntensity === null ? null : `${record.intakes[0].painIntensity} / 10`} /><Detail label="疼痛部位" value={record.intakes[0].selections.filter((entry) => entry.kind === 'pain_location').map((entry) => entry.value).join(', ')} /><Detail label="診斷檢查" value={record.intakes[0].diagnosticTests.map((test) => test.testType).join(', ')} /></div> : <p className="ehr-empty">尚無初診問卷。</p>}<h2 className="ehr-section-title">智慧語音問診</h2>{record.interviews.length ? record.interviews.map((interview, index) => <div className="ehr-ai-panel" key={index}><div><h3>問診・ {chineseText(interview.status)}</h3><p>{chineseText(interview.aiSummary || 'No AI summary recorded.')}</p></div><div className="ehr-ai-meta"><span><strong>開始時間</strong>{chineseText(interview.startedAt || 'Not available')}</span><span><strong>完成時間</strong>{chineseText(interview.completedAt || 'Not available')}</span><span><strong>需要審核</strong>{chineseText(interview.reviewRequired ? 'Yes' : 'No')}</span><span><strong>醫療人員已審核</strong>{chineseText(interview.providerReviewed ? interview.providerReviewDate || 'Yes' : 'No')}</span></div></div>) : <p className="ehr-empty">尚未開始問診。智慧問診僅記錄病人自述資料，並須由醫療人員審核。</p>}</> : <><h2 className="ehr-section-title">病人自述問卷</h2><div className="ehr-detail-grid"><Detail label="主要不適" value={patient.complaint} /><Detail label="症狀頻率" value="Frequently · 51–75% of the day" /><Detail label="症狀變化" value="No change" /><Detail label="疼痛程度" value="4 / 10" /><Detail label="疼痛部位" value="Back · Left" /><Detail label="問卷狀態" value="Awaiting provider review" /></div><h2 className="ehr-section-title">智慧語音問診</h2><div className="ehr-ai-panel"><div><h3>尚未開始問診</h3><p>智慧問診僅收集及摘要病人自述資料，不會產生診斷或最終臨床評估。</p></div><div className="ehr-ai-meta"><span><strong>需要審核</strong>是</span><span><strong>醫療人員已審核</strong>否</span><span><strong>逐字稿</strong>尚無資料</span><span><strong>結構化回覆</strong>尚無資料</span></div></div></>}</>}
        {tab === 'Medical History' && <><h2 className="ehr-section-title">過去病史</h2>{record ? record.medicalHistories.length ? <ModuleTable headings={['Category', 'Condition / details']} rows={record.medicalHistories.map((entry) => [entry.category, entry.details ? `${entry.condition}: ${entry.details}` : entry.condition])} /> : <p className="ehr-empty">尚無過去病史紀錄。</p> : <><div className="ehr-option-grid">{medicalConditions.map((condition) => <label className="ehr-option" key={condition}><input type="checkbox" disabled />{chineseText(condition)} ・未提供</label>)}</div><h2 className="ehr-section-title">其他病史</h2><div className="ehr-detail-grid">{['Diseases & surgeries', 'Traumas', 'Car accidents', 'Falls'].map((name) => <Detail key={name} label={name} value="No synthetic entries recorded" />)}</div></>}</>}
        {tab === 'Symptoms' && <><h2 className="ehr-section-title">中醫症狀清單</h2>{Object.entries(symptomGroups).map(([category, symptoms]) => <div key={category}><h3 className="ehr-section-title">{chineseText(category)}</h3><div className="ehr-option-grid">{symptoms.map((symptom) => <label className="ehr-option" key={symptom}><input type="checkbox" disabled checked={record?.symptoms.some((entry) => entry.present && entry.symptom.name === symptom) ?? false} />{chineseText(symptom)}</label>)}</div></div>)}</>}
        {tab === 'Medications' && <><h2 className="ehr-section-title">目前用藥</h2>{record ? record.medications.length ? <ModuleTable headings={['Category', 'Name', 'Dose', 'Frequency', 'Route', 'Status']} rows={record.medications.map((entry) => [entry.medication.category, entry.medication.name, [entry.dosage, entry.unit].filter(Boolean).join(' '), entry.frequency || 'Not recorded', entry.route || 'Not recorded', entry.active ? 'Active' : 'Inactive'])} /> : <p className="ehr-empty">尚無用藥紀錄。</p> : <><div className="ehr-table-wrap ehr-panel"><table className="ehr-table"><thead><tr><th>類別</th><th>名稱</th><th>劑量</th><th>頻率</th><th>給藥途徑</th><th>狀態</th></tr></thead><tbody><tr><td>維生素／礦物質</td><td>模擬保健品</td><td>1 粒膠囊</td><td>每日</td><td>口服</td><td>有效</td></tr></tbody></table></div><div className="ehr-inline-list" style={{ marginTop: 12 }}><span className="ehr-tag">西藥</span><span className="ehr-tag">維生素／礦物質補充品</span><span className="ehr-tag">中藥與草藥</span></div></>}</>}
        {tab === 'Allergies' && <><h2 className="ehr-section-title">過敏紀錄</h2>{record ? record.allergies.length ? <ModuleTable headings={['Allergen', 'Reaction', 'Severity']} rows={record.allergies.map((entry) => [entry.allergen, entry.reaction || 'Not recorded', entry.severity || 'Not recorded'])} /> : <p className="ehr-empty">尚無過敏紀錄，不代表已完成過敏評估。</p> : <div className="ehr-detail-grid"><Detail label="狀態" value="No known allergies documented in this synthetic record" /><Detail label="上次審核" value="Sep 24, 2026" /></div>}</>}
        {tab === 'Family History' && <><h2 className="ehr-section-title">家族病史</h2>{record ? record.familyHistories.length ? <ModuleTable headings={['Condition', 'Relative', 'Notes']} rows={record.familyHistories.map((entry) => [entry.condition, entry.relative || 'Not recorded', entry.details || 'Not recorded'])} /> : <p className="ehr-empty">尚無家族病史。</p> : <div className="ehr-table-wrap ehr-panel"><table className="ehr-table"><thead><tr><th>疾病</th><th>親屬</th><th>備註</th></tr></thead><tbody>{medicalConditions.map((condition) => <tr key={condition}><td>{chineseText(condition)}</td><td>未提供</td><td>未提供</td></tr>)}</tbody></table></div>}</>}
        {tab === "Women's Health" && <><h2 className="ehr-section-title">月經</h2><div className="ehr-detail-grid">{['Menstrual status', 'Last period', 'Average period duration', 'Average cycle duration', 'Pain level (0–10)', 'Breast tenderness', 'Lower back pain', 'Abdominal cramps', 'Other'].map((field) => <Detail key={field} label={field} value="Not recorded" />)}</div><h2 className="ehr-section-title">經血特徵與分泌物</h2><div className="ehr-inline-list">{['Dark', 'Bright', 'Red', 'Pink', 'Thick', 'Thin', 'Clots', 'Watery', 'Clear', 'Milky', 'Yellow', 'Odor', 'NAD'].map((item) => <span className="ehr-tag" key={item}>{chineseText(item)}</span>)}</div><h2 className="ehr-section-title">孕產史與照護人員</h2><div className="ehr-detail-grid">{['Pregnancies', 'Births', 'Miscarriages', 'Abortions', 'Premature births', 'Currently pregnant', 'Weeks of pregnancy', 'Due date', 'Gynecologist / care giver', 'Address', 'Phone'].map((field) => <Detail key={field} label={field} value="Not recorded" />)}</div></>}
        {tab === 'Encounters' && <ModuleTable headings={['Date', 'Visit type', 'Chief complaint', 'Provider', 'Status']} rows={[[patient.lastVisit, 'Follow-up', patient.complaint, 'Clinic provider', 'Signed'], ['Aug 12, 2026', 'Initial evaluation', patient.complaint, 'Clinic provider', 'Signed']]} />}
        {tab === 'Treatments' && <ModuleTable headings={['Date', 'Treatment', 'Duration', 'Units', 'Provider']} rows={[[patient.lastVisit, 'Acupuncture', '30 min', '1', 'Clinic provider'], ['Sep 10, 2026', 'Manual therapy', '15 min', '1', 'Clinic provider']]} />}
        {tab === 'Billing' && <ModuleTable headings={['Service date', 'CPT', 'Service', 'Units', 'Status']} rows={[[patient.lastVisit, '97813', 'Electro-Acupuncture', '1', 'Draft'], ['Sep 10, 2026', '97140', 'Manual Therapy', '1', 'Reviewed']]} />}
        {tab === 'Documents' && <ModuleTable headings={['Document', 'Type', 'Date', 'Status']} rows={[["Patient intake form", 'Intake', 'Aug 12, 2026', 'On file'], ['Consent to treatment', 'Consent', 'Aug 12, 2026', 'On file']]} />}
      </section>
      </>}
    </>
  )
}

function StoredProfileTabs({ patient, record, tab, setTab }: { patient: DemoPatient; record: StoredPatientRecord; tab: string; setTab: (tab: string) => void }) {
  const observedSymptoms = new Set(record.symptoms.filter((entry) => entry.present).map((entry) => entry.symptom.name))
  const treatmentRows = record.encounters.flatMap((encounter) => encounter.treatments.map((treatment) => [new Date(encounter.encounterDate).toLocaleDateString('zh-TW'), treatment.treatmentType, treatment.durationMinutes ? `${treatment.durationMinutes} min` : 'Not recorded', String(treatment.units), 'Assigned provider']))
  const billingRows = record.encounters.flatMap((encounter) => encounter.billingRecords.map((billing) => [new Date(encounter.encounterDate).toLocaleDateString('zh-TW'), billing.cptCode.code, billing.cptCode.serviceName, String(billing.units), billing.status]))

  return <>
    <div className="ehr-tabs" role="tablist" aria-label="病歷分頁">
      {tabs.map((item) => <button className="ehr-tab" key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{chineseText(item)}</button>)}
    </div>
    <section className="ehr-profile-content" role="tabpanel">
      {tab === 'Overview' && <><h2 className="ehr-section-title">病人資料</h2><div className="ehr-detail-grid"><Detail label="主要健康問題" value={patient.complaint} /><Detail label="初診問卷紀錄" value={record.intakes.length} /><Detail label="看診紀錄" value={record.encounters.length} /><Detail label="目前使用藥物" value={record.medications.filter((entry) => entry.active).length} /><Detail label="過敏紀錄" value={record.allergies.length} /><Detail label="文件管理" value={record.documents.length} /></div></>}
      {tab === 'Intake' && <><h2 className="ehr-section-title">病人自述問卷</h2>{record.intakes.length ? record.intakes.map((intake, index) => <div className="ehr-form-section" key={index}><div className="ehr-detail-grid"><Detail label="主要不適" value={intake.majorComplaints} /><Detail label="頻率" value={intake.frequency} /><Detail label="症狀變化" value={intake.symptomChange} /><Detail label="疼痛程度" value={intake.painIntensity === null ? null : `${intake.painIntensity} / 10`} /><Detail label="疼痛部位" value={intake.selections.filter((entry) => entry.kind === 'pain_location').map((entry) => entry.value).join(', ')} /><Detail label="症狀性質" value={intake.selections.filter((entry) => entry.kind === 'symptom_nature').map((entry) => entry.value).join(', ')} /></div><h3 className="ehr-section-title">診斷檢查</h3>{intake.diagnosticTests.length ? <div className="ehr-inline-list">{intake.diagnosticTests.map((test, testIndex) => <span className="ehr-tag" key={testIndex}>{chineseText(test.testType)}{chineseText(test.location ? ` · ${test.location}` : '')}</span>)}</div> : <span className="ehr-table-sub">尚無檢查紀錄</span>}</div>) : <p className="ehr-empty">尚無初診問卷。</p>}<h2 className="ehr-section-title">智慧語音問診</h2>{record.interviews.length ? record.interviews.map((interview, index) => <div className="ehr-ai-panel" key={index}><div><h3>問診・ {chineseText(interview.status)}</h3><p>{chineseText(interview.aiSummary || 'No AI summary recorded.')}</p><details><summary>逐字稿與結構化回覆</summary><p>{chineseText(interview.transcript || 'Transcript not available.')}</p><pre>{chineseText(interview.structuredResponses || 'Structured responses not available.')}</pre></details></div><div className="ehr-ai-meta"><span><strong>開始時間</strong>{chineseText(interview.startedAt || 'Not available')}</span><span><strong>完成時間</strong>{chineseText(interview.completedAt || 'Not available')}</span><span><strong>需要審核</strong>{chineseText(interview.reviewRequired ? 'Yes' : 'No')}</span><span><strong>醫療人員已審核</strong>{chineseText(interview.providerReviewed ? interview.providerReviewDate || 'Yes' : 'No')}</span></div></div>) : <p className="ehr-empty">尚未開始問診。智慧問診僅記錄病人自述資料，並須由醫療人員審核。</p>}</>}
      {tab === 'Medical History' && <><h2 className="ehr-section-title">過去病史</h2>{record.medicalHistories.length ? <ModuleTable headings={['Category', 'Condition / details']} rows={record.medicalHistories.map((entry) => [entry.category, entry.details ? `${entry.condition}: ${entry.details}` : entry.condition])} /> : <p className="ehr-empty">尚無過去病史紀錄。</p>}</>}
      {tab === 'Symptoms' && <><h2 className="ehr-section-title">中醫症狀清單</h2>{Object.entries(symptomGroups).map(([category, names]) => <div key={category}><h3 className="ehr-section-title">{chineseText(category)}</h3><div className="ehr-option-grid">{names.map((name) => <label className="ehr-option" key={name}><input type="checkbox" disabled checked={observedSymptoms.has(name)} />{chineseText(name)}</label>)}</div></div>)}</>}
      {tab === 'Medications' && <><h2 className="ehr-section-title">目前用藥</h2>{record.medications.length ? <ModuleTable headings={['Category', 'Name', 'Dosage', 'Frequency', 'Route', 'Status']} rows={record.medications.map((entry) => [entry.medication.category, entry.medication.name, [entry.dosage, entry.unit].filter(Boolean).join(' '), entry.frequency || 'Not recorded', entry.route || 'Not recorded', entry.active ? 'Active' : 'Inactive'])} /> : <p className="ehr-empty">尚無用藥紀錄。</p>}</>}
      {tab === 'Allergies' && <><h2 className="ehr-section-title">過敏史</h2>{record.allergies.length ? <ModuleTable headings={['Allergen', 'Reaction', 'Severity']} rows={record.allergies.map((entry) => [entry.allergen, entry.reaction || 'Not recorded', entry.severity || 'Not recorded'])} /> : <p className="ehr-empty">尚無過敏紀錄，不代表已完成過敏評估。</p>}</>}
      {tab === 'Family History' && <><h2 className="ehr-section-title">家族病史</h2>{record.familyHistories.length ? <ModuleTable headings={['Condition', 'Relative', 'Notes']} rows={record.familyHistories.map((entry) => [entry.condition, entry.relative || 'Not recorded', entry.details || 'Not recorded'])} /> : <p className="ehr-empty">尚無家族病史。</p>}</>}
      {tab === "Women's Health" && <><h2 className="ehr-section-title">女性健康</h2>{record.womensHealth ? <div className="ehr-detail-grid">{Object.entries(record.womensHealth).filter(([key]) => !['id', 'patientId', 'createdAt', 'updatedAt'].includes(key)).map(([key, value]) => <Detail key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())} value={value === true ? 'Yes' : value === false ? 'No' : value?.toString()} />)}</div> : <p className="ehr-empty">尚無女性健康紀錄。</p>}</>}
      {tab === 'Encounters' && <><h2 className="ehr-section-title">看診紀錄</h2>{record.encounters.length ? <ModuleTable headings={['Date', 'Encounter ID', 'Visit type', 'Chief complaint', 'Status']} rows={record.encounters.map((entry) => [new Date(entry.encounterDate).toLocaleDateString('zh-TW'), entry.encounterId, entry.visitType, entry.chiefComplaint || 'Not recorded', entry.status])} /> : <p className="ehr-empty">尚無看診紀錄。</p>}</>}
      {tab === 'Treatments' && <><h2 className="ehr-section-title">治療紀錄</h2>{treatmentRows.length ? <ModuleTable headings={['Date', 'Treatment', 'Duration', 'Units', 'Provider']} rows={treatmentRows} /> : <p className="ehr-empty">尚無治療紀錄。</p>}</>}
      {tab === 'Billing' && <><h2 className="ehr-section-title">帳務紀錄</h2>{billingRows.length ? <ModuleTable headings={['Service date', 'CPT', 'Service', 'Units', 'Status']} rows={billingRows} /> : <p className="ehr-empty">尚無帳務紀錄。</p>}</>}
      {tab === 'Documents' && <><h2 className="ehr-section-title">文件管理</h2>{record.documents.length ? <ModuleTable headings={['Name', 'Type', 'Date']} rows={record.documents.map((document) => [document.name, document.documentType, new Date(document.createdAt).toLocaleDateString('zh-TW')])} /> : <p className="ehr-empty">尚無文件。</p>}</>}
    </section>
  </>
}

function ModuleTable({ headings, rows }: { headings: string[]; rows: string[][] }) {
  return <section className="ehr-panel"><div className="ehr-table-wrap"><table className="ehr-table"><thead><tr>{headings.map((heading) => <th key={heading}>{chineseText(heading)}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{chineseText(cell)}</td>)}</tr>)}</tbody></table></div></section>
}

function Field({ label, name, type = 'text', wide = false, options }: { label: string; name: string; type?: string; wide?: boolean; options?: string[] }) {
  return <div className={`ehr-field${wide ? ' ehr-field-full' : ''}`}><label htmlFor={name}>{chineseText(label)}</label>{options ? <select id={name} name={name}><option value="">請選擇</option>{options.map((item) => <option key={item} value={item}>{chineseText(item)}</option>)}</select> : type === 'textarea' ? <textarea id={name} name={name} /> : <input id={name} name={name} type={type} />}</div>
}

export function IntakeScreen() {
  const [patients, setPatients] = useState<{ id: string; patientId: string; firstName: string; lastName: string }[]>([])
  const [testRows, setTestRows] = useState([0])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/ehr/patients').then(async (response) => response.ok ? response.json() : null).then((payload) => {
      if (payload?.patients) setPatients(payload.patients)
    }).catch(() => setPatients([]))
  }, [])

  async function submitIntake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const values = Object.fromEntries(form.entries())
    const payload = {
      patientId: values.patientId,
      majorComplaints: values.majorComplaints,
      onsetDate: values.onsetDate || undefined,
      frequency: values.frequency || undefined,
      symptomNature: form.getAll('symptomNature'),
      symptomChange: values.symptomChange || undefined,
      painIntensity: values.painIntensity === '' ? undefined : Number(values.painIntensity),
      locations: form.getAll('locations'),
      workImpact: values.workImpact,
      socialImpact: values.socialImpact,
      overallHealth: values.overallHealth,
      previousProviders: values.previousProviders,
      patientQuestions: values.patientQuestions,
      patientConcerns: values.patientConcerns,
      additionalInformation: values.additionalInformation,
      signatureName: values.signatureName,
      signatureDate: values.signatureDate || undefined,
      medicalConditions: form.getAll('medicalHistory'),
      historyEntries: [
        ...(['diseasesSurgeries', 'traumas', 'carAccidents', 'falls', 'allergies'] as const).flatMap((key) => {
          const category = { diseasesSurgeries: 'disease_surgery', traumas: 'trauma', carAccidents: 'car_accident', falls: 'fall', allergies: 'allergy' }[key]
          return String(values[key] ?? '').split(/\r?\n|;/).map((details) => details.trim()).filter(Boolean).map((details) => ({ category, details }))
        }),
      ],
      diagnosticTests: testRows.flatMap((index) => {
        const testType = form.get(`diagnosticTest_${index}`)
        return testType ? [{ testType, testDate: form.get(`testDate_${index}`) || undefined, location: form.get(`testLocation_${index}`) }] : []
      }),
      lifestyleEntries: lifestyleCategories.map((category) => {
        const key = category.toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '')
        const uses = form.get(`${key}_uses`)
        return {
          category,
          uses: uses || undefined,
          frequency: form.get(`${key}_frequency`) || undefined,
          amount: form.get(`${key}_amount`) || undefined,
          notes: form.get(`${key}_notes`) || undefined,
        }
      }),
    }
    try {
      const response = await fetch('/api/ehr/intakes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      setMessage(response.ok ? 'Intake draft created. Provider review is still required.' : result.error ?? 'Unable to save intake.')
    } catch {
      setMessage('Unable to reach the development EHR API.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeading eyebrow="病人自述資料" title="初診問卷" description="分別記錄病人自述資料及醫療人員評估。" action={<span className="ehr-demo-chip">草稿・尚非診斷</span>} />
      <DemoBanner />
      <form onSubmit={submitIntake}>
        <section className="ehr-form-section"><h2>病人資料</h2><div className="ehr-form-grid"><div className="ehr-field"><label htmlFor="patientId">病人病歷</label><select id="patientId" name="patientId" required defaultValue=""><option value="">請選擇已建檔病人</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{chineseText(patient.patientId)} · {chineseText(patient.firstName)} {chineseText(patient.lastName)}</option>)}</select><small className="ehr-table-sub">請先建立模擬病人資料，再儲存問卷。</small></div><Field label="問卷日期" name="intakeDate" type="date" /><Field label="主要不適" name="majorComplaints" type="textarea" wide /><Field label="發病日期" name="onsetDate" type="date" /><div className="ehr-field"><label htmlFor="frequency">症狀頻率</label><select id="frequency" name="frequency"><option value="">請選擇頻率</option><option value="constant">持續・每日約 76–100% 的時間</option><option value="frequent">經常・51–75%</option><option value="occasional">偶爾・26–50%</option><option value="intermittent">間歇・0–25%</option></select></div><div className="ehr-field ehr-field-full"><label>症狀性質</label><div className="ehr-choice-row">{['Sharp', 'Shooting', 'Dull ache', 'Burning', 'Numb', 'Tingling'].map((item) => <label className="ehr-option" key={item}><input name="symptomNature" type="checkbox" value={item.toLowerCase().replace(' ', '_')} />{chineseText(item)}</label>)}</div></div><div className="ehr-field"><label htmlFor="symptomChange">症狀變化情形</label><select id="symptomChange" name="symptomChange"><option value="">請選擇</option><option value="improving">改善中</option><option value="no_change">沒有變化</option><option value="worsening">惡化中</option></select></div><div className="ehr-field"><label htmlFor="painIntensity">疼痛程度・0–10</label><input id="painIntensity" name="painIntensity" type="number" min="0" max="10" /></div><div className="ehr-field ehr-field-full"><label>疼痛部位</label><div className="ehr-choice-row">{['Front', 'Back', 'Left', 'Right'].map((item) => <label className="ehr-option" key={item}><input name="locations" type="checkbox" value={item.toLowerCase()} />{chineseText(item)}</label>)}</div></div><Field label="對日常工作的影響" name="workImpact" type="textarea" /><Field label="對社交生活的影響" name="socialImpact" type="textarea" /><Field label="整體健康狀況" name="overallHealth" options={['Excellent', 'Very good', 'Good', 'Fair', 'Poor']} /><Field label="曾就診的醫療人員" name="previousProviders" type="textarea" /></div></section>
        <section className="ehr-form-section"><h2>過去診斷檢查</h2>{testRows.map((index) => <div className="ehr-form-grid" key={index} style={{ marginBottom: 12 }}><Field label="檢查類型" name={`diagnosticTest_${index}`} options={['X-Ray', 'MRI', 'CT Scan', 'Other']} /><Field label="檢查日期" name={`testDate_${index}`} type="date" /><div className="ehr-field ehr-field-full"><Field label="地點" name={`testLocation_${index}`} /></div></div>)}<button type="button" className="ehr-button ehr-button-light" onClick={() => setTestRows((rows) => [...rows, Math.max(...rows) + 1])}><Plus /> 新增檢查</button></section>
        <section className="ehr-form-section"><h2>過去病史</h2><div className="ehr-option-grid">{medicalConditions.map((condition) => <label className="ehr-option" key={condition}><input type="checkbox" name="medicalHistory" value={condition} />{chineseText(condition)}</label>)}</div><div className="ehr-form-grid" style={{ marginTop: 15 }}><Field label="疾病與手術（每行一項）" name="diseasesSurgeries" type="textarea" /><Field label="外傷（每行一項）" name="traumas" type="textarea" /><Field label="車禍（每行一項）" name="carAccidents" type="textarea" /><Field label="跌倒（每行一項）" name="falls" type="textarea" /><Field label="過敏（每行一項）" name="allergies" type="textarea" /></div></section>
        <section className="ehr-form-section"><h2>目前健康狀況</h2><div className="ehr-table-wrap"><table className="ehr-table"><thead><tr><th>生活習慣</th><th>是／否</th><th>頻率</th><th>數量</th><th>備註</th></tr></thead><tbody>{lifestyleCategories.map((habit) => { const key = habit.toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, ''); return <tr key={habit}><td>{chineseText(habit)}</td><td><select name={`${key}_uses`} aria-label={`${chineseText(habit)}：是否使用`}><option value="">尚未記錄</option><option value="yes">是</option><option value="no">否</option></select></td><td><input name={`${key}_frequency`} aria-label={`${chineseText(habit)}：頻率`} /></td><td><input name={`${key}_amount`} aria-label={`${chineseText(habit)}：數量`} /></td><td><input name={`${key}_notes`} aria-label={`${chineseText(habit)}：備註`} /></td></tr>})}</tbody></table></div></section>
        <section className="ehr-form-section"><h2>病人備註與簽名</h2><div className="ehr-form-grid"><Field label="病人提問" name="patientQuestions" type="textarea" /><Field label="病人關注事項" name="patientConcerns" type="textarea" /><Field label="補充資料" name="additionalInformation" type="textarea" /><Field label="病人簽名（輸入姓名）" name="signatureName" /><Field label="簽名日期" name="signatureDate" type="date" /></div></section>
        <section className="ehr-form-section"><h2>智慧語音問診</h2><div className="ehr-ai-panel"><div><h3><AudioLines size={16} style={{ verticalAlign: 'middle', marginRight: 7 }} />尚未開始問診</h3><p>問診功能將於後續階段推出。智慧問診僅摘要病人自述資料，所有臨床病歷均須由醫療人員審核及核准。</p></div><div className="ehr-ai-meta"><span><strong>狀態</strong>尚未開始</span><span><strong>開始／完成</strong>尚無資料</span><span><strong>逐字稿／摘要</strong>尚無資料</span><span><strong>需要審核</strong>是・待醫療人員審核</span></div></div></section>
        <div className="ehr-form-actions"><span className="ehr-form-message" role="status">{chineseText(message)}</span><button className="ehr-button" type="submit" disabled={busy || patients.length === 0}>{busy ? 'Saving…' : <><Check /> 儲存問卷草稿</>}</button></div>
      </form>
    </>
  )
}

type ModuleKey = 'encounters' | 'notes' | 'treatments' | 'medications' | 'billing' | 'documents' | 'settings'

const moduleDetails: Record<ModuleKey, { eyebrow: string; title: string; description: string }> = {
  encounters: { eyebrow: 'Provider workflow', title: 'Encounters', description: 'Visit structure for provider documentation and treatment.' },
  notes: { eyebrow: 'Provider documentation', title: 'TCM clinical notes', description: 'Four examinations, provider assessment, and treatment plan.' },
  treatments: { eyebrow: 'Care delivery', title: 'Treatments', description: 'Track treatment type, timing, units, provider, and encounter.' },
  medications: { eyebrow: 'Patient profile', title: 'Medications', description: 'Reconcile prescriptions, supplements, and traditional medicines.' },
  billing: { eyebrow: 'Billing foundation', title: 'Billing / CPT', description: 'Project CPT catalog linked to encounters and treatment items.' },
  documents: { eyebrow: 'Patient records', title: 'Documents', description: 'Organize intake, consent, and encounter-linked records.' },
  settings: { eyebrow: 'Access foundation', title: 'Settings', description: 'Role boundaries and EHR configuration foundations.' },
}

export function ModuleScreen({ module }: { module: ModuleKey }) {
  if (module === 'encounters') return <EncounterQueueScreen />
  const details = moduleDetails[module]
  return (
    <>
      <PageHeading {...details} />
      <DemoBanner />
      {module === 'notes' && <><div className="ehr-module-grid">{[
        ['Look / Observation', 'Tongue · complexion · body appearance · other observations'],
        ['Listen / Smell', 'Voice · breathing · cough · odor · other findings'],
        ['Inquiry', 'Symptoms · sleep · appetite · digestion · bowel · urination · thirst · temperature · sweating · menstruation · emotional status · pain'],
        ['Palpation', 'Pulse · tenderness · abdomen · other findings'],
        ['Provider assessment', 'TCM pattern / assessment · treatment principle'],
        ['Plan', 'Acupuncture points · electro-acupuncture · manual therapy · herbs · lifestyle · follow-up'],
      ].map(([title, text]) => <div className="ehr-module-item" key={title}><h3>{chineseText(title)}</h3><p>{chineseText(text)}</p></div>)}</div><ModuleTable headings={['Encounter', 'Patient', 'Date', 'Provider', 'Note status']} rows={[["ENC-DEMO-260928-01", 'Avery Chen', 'Sep 28, 2026', 'Clinic provider', 'Draft · review required'], ["ENC-DEMO-260927-01", 'Riley Wong', 'Sep 27, 2026', 'Clinic provider', 'Signed']]} /></>}
      {module === 'treatments' && <><div className="ehr-module-grid">{['Acupuncture', 'Electro-Acupuncture', 'Manual Therapy', 'Herbal Medicine', 'Other'].map((kind) => <div className="ehr-module-item" key={kind}><h3>{chineseText(kind)}</h3><p>關聯看診紀錄・時間・時長・單位數・醫療人員・備註</p></div>)}</div><ModuleTable headings={['Treatment ID', 'Encounter', 'Patient', 'Treatment type', 'Duration', 'Units', 'Provider']} rows={[["TRT-DEMO-1001", "ENC-DEMO-260928-01", 'Avery Chen', 'Acupuncture', '30 min', '1', 'Clinic provider'], ["TRT-DEMO-1002", "ENC-DEMO-260927-01", 'Riley Wong', 'Manual Therapy', '15 min', '1', 'Clinic provider']]} /></>}
      {module === 'medications' && <><div className="ehr-module-grid">{['Pharmaceutical medications', 'Vitamin / mineral supplements', 'Traditional herbs & medicines'].map((category) => <div className="ehr-module-item" key={category}><h3>{chineseText(category)}</h3><p>分別記錄每位病人目前使用及已停用的藥物。</p></div>)}</div><ModuleTable headings={['Patient', 'Medication', 'Category', 'Dosage', 'Frequency', 'Route', 'Status']} rows={[["Avery Chen", 'Demo supplement', 'Vitamin / mineral', '1 capsule', 'Daily', 'Oral', 'Active'], ['Jordan Lee', 'No records', '—', '—', '—', '—', '—']]} /></>}
      {module === 'billing' && <><div className="ehr-form-section"><h2>診療代碼主檔</h2><p className="ehr-table-sub">以下代碼依專案提供內容保留，不會自動修改或移除。</p></div><ModuleTable headings={['CPT code', 'Service name', 'Service type', 'Initial / subsequent', 'Duration', 'Unit', 'Active']} rows={cptCodes.map((item) => [item.code, item.service, item.type, item.sequence, 'Not specified', 'Unit', 'Yes'])} /><div className="ehr-module-grid" style={{ marginTop: 15 }}><div className="ehr-module-item"><h3>帳務紀錄</h3><p>關聯病人、看診、治療、診療代碼、單位數及服務日期。</p></div><div className="ehr-module-item"><h3>計算狀態</h3><p>第一階段尚未啟用帳務或保險計算。</p></div><div className="ehr-module-item"><h3>待審核清單</h3><p>範例紀錄保留為草稿，供工作人員審核。</p></div></div></>}
      {module === 'documents' && <><div className="ehr-module-grid"><div className="ehr-module-item"><h3>病人文件</h3><p>同意書・初診問卷・上傳文件。</p></div><div className="ehr-module-item"><h3>看診文件</h3><p>與看診紀錄關聯的病歷附件。</p></div><div className="ehr-module-item"><h3>儲存方式</h3><p>病歷中僅儲存受保護的檔案索引，文件內容另行安全儲存。</p></div></div><ModuleTable headings={['Name', 'Document type', 'Patient', 'Date added', 'Status']} rows={[["Synthetic intake form", 'Patient intake', 'Avery Chen', 'Sep 24, 2026', 'Indexed'], ['Synthetic consent form', 'Consent', 'Riley Wong', 'Sep 18, 2026', 'Indexed']]} /></>}
      {module === 'settings' && <><div className="ehr-module-grid">{[['Patient', 'Own records only · patient portal not enabled'], ['Provider', 'Authorized patient records · clinical documentation'], ['Admin', 'System configuration · user management foundation'], ['Billing staff', 'Billing records only · clinical access blocked']].map(([role, description]) => <div className="ehr-module-item" key={role}><h3>{chineseText(role)}</h3><p>{chineseText(description)}</p></div>)}</div><div className="ehr-form-section"><h2>安全狀態</h2><div className="ehr-detail-grid"><Detail label="身分驗證" value="Clerk-managed sessions and identity" /><Detail label="開發環境寫入" value="Enabled only outside production" /><Detail label="智慧分析服務" value="Not connected; no patient information is sent externally" /><Detail label="稽核功能" value="Patient access and modification event model added" /><Detail label="病人資料儲存" value="Normalized relational Prisma schema" /><Detail label="臨床簽核" value="Provider review required for clinical documentation" /></div></div></>}
      <div className="ehr-workflow"><Link href="/ehr/patients"><span>1</span>病人管理</Link><Link href="/ehr/intake"><span>2</span>初診問卷</Link><Link href="/ehr/encounters"><span>3</span>看診紀錄</Link><Link href="/ehr/notes"><span>4</span>中醫病歷</Link></div>
    </>
  )
}

export function PatientRecordRoute({ id }: { id: string }) {
  const demoPatient = demoPatients.find((patient) => patient.id === id)
  const [patient, setPatient] = useState<DemoPatient | null>(demoPatient ?? null)
  const [record, setRecord] = useState<StoredPatientRecord | undefined>()
  const [loading, setLoading] = useState(!demoPatient)

  useEffect(() => {
    if (demoPatient) return
    fetch(`/api/ehr/patients/${encodeURIComponent(id)}`).then(async (response) => {
      if (!response.ok) throw new Error('Patient record unavailable')
      const payload = await response.json()
      const item = payload.patient
      setRecord(item as StoredPatientRecord)
      const birthDate = item.dateOfBirth ? new Date(item.dateOfBirth) : null
      const age = birthDate ? Math.max(0, new Date().getFullYear() - birthDate.getFullYear()) : 0
      setPatient({
        id: item.id,
        patientId: item.patientId,
        firstName: item.firstName,
        lastName: item.lastName,
        age,
        gender: item.gender || 'Not recorded',
        phone: item.phone || '',
        email: item.email || '',
        language: item.preferredLanguage || 'Not recorded',
        status: item.status === 'active' ? 'Active' : 'Follow-up',
        lastVisit: item.profile?.lastVisitAt ? new Date(item.profile.lastVisitAt).toLocaleDateString('zh-TW') : 'No visits',
        nextVisit: 'Not scheduled',
        complaint: item.intakes?.[0]?.majorComplaints || 'No complaint recorded',
        emergencyContact: item.profile?.emergencyContact || '',
        relationship: item.profile?.emergencyRelationship || '',
        emergencyPhone: item.profile?.emergencyContactPhone || '',
        dateOfBirth: birthDate?.toLocaleDateString('zh-TW') || 'Not recorded',
        address: [item.profile?.address, item.profile?.city, item.profile?.state, item.profile?.postalCode].filter(Boolean).join(' · '),
        createdAt: new Date(item.createdAt).toLocaleDateString('zh-TW'),
      })
    }).catch(() => setPatient(null)).finally(() => setLoading(false))
  }, [demoPatient, id])

  if (loading) return <div className="ehr-empty">正在載入病人病歷…</div>
  if (!patient) return <div className="ehr-empty">無法取得病人病歷，或尚未取得存取權限。</div>
  return <PatientProfileScreen patient={patient} record={record} />
}

export function NewPatientScreen() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function createPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const raw = Object.fromEntries(new FormData(event.currentTarget).entries())
    const payload = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, value === '' ? undefined : value]))
    try {
      const response = await fetch('/api/ehr/patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) {
        setMessage(result.error ?? 'Unable to create patient.')
        return
      }
      router.push(`/ehr/patients/${encodeURIComponent(result.patient.id)}`)
    } catch {
      setMessage('Unable to reach the development EHR API.')
    } finally {
      setBusy(false)
    }
  }

  return <>
    <PageHeading eyebrow="病人建檔" title="新增病人" description="建立病人基本資料，臨床資料另於初診問卷中收集。" action={<Link className="ehr-button ehr-button-light" href="/ehr/patients">返回病人清單</Link>} />
    <DemoBanner />
    <form onSubmit={createPatient}>
      <section className="ehr-form-section"><h2>病人資料</h2><div className="ehr-form-grid">
        <Field label="名字" name="firstName" /><Field label="中間名" name="middleName" />
        <Field label="姓氏" name="lastName" /><Field label="出生日期" name="dateOfBirth" type="date" />
        <Field label="性別" name="gender" options={['Female', 'Male', 'Non-binary', 'Prefer not to say', 'Other']} />
        <Field label="偏好語言" name="preferredLanguage" options={['English', 'Mandarin', 'Cantonese', 'Other']} />
        <Field label="電話" name="phone" type="tel" /><Field label="電子郵件" name="email" type="email" />
        <Field label="地址" name="address" /><Field label="緊急聯絡人" name="emergencyContact" />
        <Field label="關係" name="emergencyRelationship" /><Field label="緊急聯絡人電話" name="emergencyContactPhone" type="tel" />
      </div></section>
      <div className="ehr-form-actions"><span className="ehr-form-message" role="status">{chineseText(message)}</span><button className="ehr-button" type="submit" disabled={busy}>{busy ? 'Creating…' : <><Plus /> 新增病人</>}</button></div>
    </form>
  </>
}