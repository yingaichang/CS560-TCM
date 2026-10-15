'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import {
  ArrowRight, AudioLines, CalendarClock, Check, ClipboardCheck, Clock3,
  FilePlus2, Plus, Search, ShieldCheck, UsersRound,
} from 'lucide-react'
import { cptCodes, medicalConditions, symptomGroups } from '@/lib/ehr/catalog'
import { demoPatients, type DemoPatient } from '@/lib/ehr/demoPatients'

function DemoBanner({ children = 'Synthetic development records only. Do not enter real patient information.' }: { children?: string }) {
  return <div className="ehr-demo-banner"><ShieldCheck aria-hidden="true" />{children}</div>
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="ehr-page-heading">
      <div><div className="ehr-eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
      {action}
    </div>
  )
}

export function DashboardScreen() {
  return (
    <>
      <PageHeading eyebrow="Monday · September 28, 2026" title="Clinic overview" description="A clear view of today’s patient flow and follow-up work." action={<Link className="ehr-button" href="/ehr/intake"><Plus /> New intake</Link>} />
      <DemoBanner />
      <section className="ehr-stats" aria-label="Clinic summary">
        {[
          { label: 'Active patients', value: '128', detail: 'Across the clinic', icon: UsersRound },
          { label: 'Today’s encounters', value: '12', detail: '4 remaining', icon: CalendarClock },
          { label: 'Intakes to review', value: '03', detail: 'Provider review required', icon: ClipboardCheck },
          { label: 'Open notes', value: '02', detail: 'Draft documentation', icon: FilePlus2 },
        ].map(({ label, value, detail, icon: Icon }) => <div className="ehr-stat" key={label}><div className="ehr-stat-label">{label}<span className="ehr-stat-icon"><Icon /></span></div><div className="ehr-stat-value">{value}</div><div className="ehr-stat-detail">{detail}</div></div>)}
      </section>
      <div className="ehr-dashboard-grid">
        <section className="ehr-panel">
          <div className="ehr-panel-head"><h2>Today’s schedule</h2><Link href="/ehr/encounters">All encounters <ArrowRight size={13} /></Link></div>
          <div className="ehr-panel-body">
            {[
              ['09:00', 'Avery Chen', 'Follow-up · Neck and shoulder tension', 'Checked in'],
              ['10:15', 'Jordan Lee', 'Initial evaluation · Intake due', 'Arriving'],
              ['11:30', 'Riley Wong', 'Treatment only · Low back discomfort', 'Confirmed'],
              ['13:00', 'Sam Patel', 'Follow-up · Digestive wellness', 'Confirmed'],
            ].map(([time, name, detail, status]) => <div className="ehr-visit-row" key={time}><div className="ehr-time">{time}</div><div><div className="ehr-visit-name">{name}</div><div className="ehr-visit-detail">{detail}</div></div><span className={`ehr-status${status === 'Arriving' ? ' ehr-status-warning' : ''}`}>{status}</span></div>)}
          </div>
        </section>
        <section className="ehr-panel">
          <div className="ehr-panel-head"><h2>Needs attention</h2><span className="ehr-eyebrow" style={{ margin: 0 }}>03 ITEMS</span></div>
          <div className="ehr-queue">
            <Link className="ehr-queue-item" href="/ehr/intake"><span className="ehr-queue-icon"><ClipboardCheck /></span><span><span className="ehr-queue-title">Intakes awaiting review</span><span className="ehr-queue-sub">Provider sign-off needed</span></span><span className="ehr-queue-count">03</span></Link>
            <Link className="ehr-queue-item" href="/ehr/notes"><span className="ehr-queue-icon"><NotebookPenIcon /></span><span><span className="ehr-queue-title">Clinical notes in draft</span><span className="ehr-queue-sub">Complete provider documentation</span></span><span className="ehr-queue-count">02</span></Link>
            <Link className="ehr-queue-item" href="/ehr/billing"><span className="ehr-queue-icon"><Clock3 /></span><span><span className="ehr-queue-title">Billing review queue</span><span className="ehr-queue-sub">Linked encounter records</span></span><span className="ehr-queue-count">04</span></Link>
          </div>
        </section>
      </div>
      <nav className="ehr-workflow" aria-label="Patient workflow">
        {[
          ['Patients', '/ehr/patients'], ['Intake', '/ehr/intake'], ['Encounter', '/ehr/encounters'],
          ['TCM note', '/ehr/notes'], ['Treatment', '/ehr/treatments'], ['Billing', '/ehr/billing'],
        ].map(([label, href], index) => <Link key={href} href={href}><span>{index + 1}</span>{label}</Link>)}
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
        const lastVisit = profile?.lastVisitAt ? new Date(profile.lastVisitAt).toLocaleDateString() : 'No visits'
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
          dateOfBirth: birthDate?.toLocaleDateString() || 'Not recorded',
          address: [profile?.address, profile?.city, profile?.state, profile?.postalCode].filter(Boolean).join(' · '),
          createdAt: item.createdAt ? new Date(item.createdAt as string).toLocaleDateString() : 'Not recorded',
        }
      }))
    }).catch(() => setRecords(demoPatients))
  }, [])

  const filtered = records.filter((patient) => `${patient.firstName} ${patient.lastName} ${patient.patientId} ${patient.complaint}`.toLowerCase().includes(search.toLowerCase()))
  return (
    <>
      <PageHeading eyebrow="Patient records" title="Patients" description="Find and review a patient’s care profile." action={<Link className="ehr-button" href="/ehr/patients/new"><Plus /> Add patient</Link>} />
      <DemoBanner />
      <div className="ehr-search-row"><label className="ehr-search"><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search synthetic patients" aria-label="Search patients" /></label><span className="ehr-table-sub">{filtered.length} demo records</span></div>
      <section className="ehr-panel"><div className="ehr-table-wrap"><table className="ehr-table"><thead><tr><th>Patient</th><th>Patient ID</th><th>Primary concern</th><th>Last visit</th><th>Next visit</th><th>Status</th></tr></thead><tbody>
        {filtered.map((patient) => <tr key={patient.id}><td><div className="ehr-patient-cell"><span className="ehr-patient-initials">{patient.firstName[0]}{patient.lastName[0]}</span><span><Link href={`/ehr/patients/${patient.id}`}>{patient.firstName} {patient.lastName}</Link><div className="ehr-table-sub">{patient.age} years · {patient.gender}</div></span></div></td><td>{patient.patientId}</td><td>{patient.complaint}</td><td>{patient.lastVisit}</td><td>{patient.nextVisit}</td><td><span className={`ehr-status${patient.status === 'Intake due' ? ' ehr-status-warning' : ''}`}>{patient.status}</span></td></tr>)}
        {filtered.length === 0 && <tr><td colSpan={6} className="ehr-empty">No matching synthetic records.</td></tr>}
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
  return <div className="ehr-detail"><div className="ehr-detail-label">{label}</div><div className="ehr-detail-value">{value || 'Not recorded'}</div></div>
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
      <PageHeading eyebrow="Patient profile" title="Care record" description="A concise overview with linked clinical sections." action={<Link className="ehr-button ehr-button-light" href="/ehr/intake"><FilePlus2 /> New intake</Link>} />
      <DemoBanner />
      <section className="ehr-profile-head">
        <div className="ehr-profile-avatar">{patient.firstName[0]}{patient.lastName[0]}</div>
        <div><div className="ehr-profile-name">{patient.firstName} {patient.lastName}</div><div className="ehr-profile-meta"><span>{patient.patientId}</span><span>{patient.age} years</span><span>{patient.status}</span><span>Created {patient.createdAt}</span></div></div>
        <div className="ehr-profile-actions"><Link className="ehr-button ehr-button-light" href="/ehr/encounters"><CalendarClock /> Encounter</Link></div>
      </section>
      {hasStoredRecord(record) ? <StoredProfileTabs patient={patient} record={record as StoredPatientRecord} tab={tab} setTab={setTab} /> : <>
      <div className="ehr-tabs" role="tablist" aria-label="Patient record sections">
        {tabs.map((item) => <button className="ehr-tab" key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{item}</button>)}
      </div>
      <section className="ehr-profile-content" role="tabpanel">
        {tab === 'Overview' && <><h2 className="ehr-section-title">Patient information</h2><div className="ehr-detail-grid">{detailFields.map(([label, value]) => <Detail key={label} label={label} value={value} />)}<Detail label="Address" value={patient.address} /><Detail label="Primary concern" value={patient.complaint} /></div><h2 className="ehr-section-title">Care summary</h2><div className="ehr-module-grid"><div className="ehr-module-item"><h3>Intake</h3><p>{record ? `${record.intakes.length} intake records on file.` : patient.status === 'Intake due' ? 'Initial intake not yet reviewed.' : 'Patient-reported intake on file · provider review recorded.'}</p></div><div className="ehr-module-item"><h3>Clinical notes</h3><p>{record ? `${record.encounters.filter((encounter) => encounter.clinicalNote).length} provider notes on file.` : 'Latest note remains separate from patient-reported information.'}</p></div><div className="ehr-module-item"><h3>Next appointment</h3><p>{patient.nextVisit}{record ? '' : ' · Follow-up visit'}</p></div></div></>}
        {tab === 'Intake' && <>{record ? <><h2 className="ehr-section-title">Patient-reported intake</h2>{record.intakes.length ? <div className="ehr-detail-grid"><Detail label="Major complaint" value={record.intakes[0].majorComplaints} /><Detail label="Symptom frequency" value={record.intakes[0].frequency} /><Detail label="Change over time" value={record.intakes[0].symptomChange} /><Detail label="Pain intensity" value={record.intakes[0].painIntensity === null ? null : `${record.intakes[0].painIntensity} / 10`} /><Detail label="Pain location" value={record.intakes[0].selections.filter((entry) => entry.kind === 'pain_location').map((entry) => entry.value).join(', ')} /><Detail label="Diagnostic tests" value={record.intakes[0].diagnosticTests.map((test) => test.testType).join(', ')} /></div> : <p className="ehr-empty">No intake information recorded.</p>}<h2 className="ehr-section-title">AI Voice Intake</h2>{record.interviews.length ? record.interviews.map((interview, index) => <div className="ehr-ai-panel" key={index}><div><h3>Interview · {interview.status}</h3><p>{interview.aiSummary || 'No AI summary recorded.'}</p></div><div className="ehr-ai-meta"><span><strong>Started</strong>{interview.startedAt || 'Not available'}</span><span><strong>Completed</strong>{interview.completedAt || 'Not available'}</span><span><strong>Review required</strong>{interview.reviewRequired ? 'Yes' : 'No'}</span><span><strong>Provider reviewed</strong>{interview.providerReviewed ? interview.providerReviewDate || 'Yes' : 'No'}</span></div></div>) : <p className="ehr-empty">No interview started. AI intake must remain patient-reported and provider-reviewed.</p>}</> : <><h2 className="ehr-section-title">Patient-reported intake</h2><div className="ehr-detail-grid"><Detail label="Major complaint" value={patient.complaint} /><Detail label="Symptom frequency" value="Frequently · 51–75% of the day" /><Detail label="Change over time" value="No change" /><Detail label="Pain intensity" value="4 / 10" /><Detail label="Pain location" value="Back · Left" /><Detail label="Intake status" value="Awaiting provider review" /></div><h2 className="ehr-section-title">AI Voice Intake</h2><div className="ehr-ai-panel"><div><h3>Interview not started</h3><p>AI intake will collect and summarize patient-reported information only. It will not create a diagnosis or final clinical assessment.</p></div><div className="ehr-ai-meta"><span><strong>Review required</strong>Yes</span><span><strong>Provider reviewed</strong>No</span><span><strong>Transcript</strong>Not available</span><span><strong>Structured responses</strong>Not available</span></div></div></>}</>}
        {tab === 'Medical History' && <><h2 className="ehr-section-title">Past medical history</h2>{record ? record.medicalHistories.length ? <ModuleTable headings={['Category', 'Condition / details']} rows={record.medicalHistories.map((entry) => [entry.category, entry.details ? `${entry.condition}: ${entry.details}` : entry.condition])} /> : <p className="ehr-empty">No medical history recorded.</p> : <><div className="ehr-option-grid">{medicalConditions.map((condition) => <label className="ehr-option" key={condition}><input type="checkbox" disabled />{condition} · Not reported</label>)}</div><h2 className="ehr-section-title">Additional history</h2><div className="ehr-detail-grid">{['Diseases & surgeries', 'Traumas', 'Car accidents', 'Falls'].map((name) => <Detail key={name} label={name} value="No synthetic entries recorded" />)}</div></>}</>}
        {tab === 'Symptoms' && <><h2 className="ehr-section-title">TCM symptom inventory</h2>{Object.entries(symptomGroups).map(([category, symptoms]) => <div key={category}><h3 className="ehr-section-title">{category}</h3><div className="ehr-option-grid">{symptoms.map((symptom) => <label className="ehr-option" key={symptom}><input type="checkbox" disabled checked={record?.symptoms.some((entry) => entry.present && entry.symptom.name === symptom) ?? false} />{symptom}</label>)}</div></div>)}</>}
        {tab === 'Medications' && <><h2 className="ehr-section-title">Current medications</h2>{record ? record.medications.length ? <ModuleTable headings={['Category', 'Name', 'Dose', 'Frequency', 'Route', 'Status']} rows={record.medications.map((entry) => [entry.medication.category, entry.medication.name, [entry.dosage, entry.unit].filter(Boolean).join(' '), entry.frequency || 'Not recorded', entry.route || 'Not recorded', entry.active ? 'Active' : 'Inactive'])} /> : <p className="ehr-empty">No medication records.</p> : <><div className="ehr-table-wrap ehr-panel"><table className="ehr-table"><thead><tr><th>Category</th><th>Name</th><th>Dose</th><th>Frequency</th><th>Route</th><th>Status</th></tr></thead><tbody><tr><td>Vitamin / mineral</td><td>Demo supplement</td><td>1 capsule</td><td>Daily</td><td>Oral</td><td>Active</td></tr></tbody></table></div><div className="ehr-inline-list" style={{ marginTop: 12 }}><span className="ehr-tag">Pharmaceutical medications</span><span className="ehr-tag">Vitamin / mineral supplements</span><span className="ehr-tag">Traditional herbs & medicines</span></div></>}</>}
        {tab === 'Allergies' && <><h2 className="ehr-section-title">Allergy record</h2>{record ? record.allergies.length ? <ModuleTable headings={['Allergen', 'Reaction', 'Severity']} rows={record.allergies.map((entry) => [entry.allergen, entry.reaction || 'Not recorded', entry.severity || 'Not recorded'])} /> : <p className="ehr-empty">No allergy records. This does not indicate that allergies were assessed.</p> : <div className="ehr-detail-grid"><Detail label="Status" value="No known allergies documented in this synthetic record" /><Detail label="Last reviewed" value="Sep 24, 2026" /></div>}</>}
        {tab === 'Family History' && <><h2 className="ehr-section-title">Family medical history</h2>{record ? record.familyHistories.length ? <ModuleTable headings={['Condition', 'Relative', 'Notes']} rows={record.familyHistories.map((entry) => [entry.condition, entry.relative || 'Not recorded', entry.details || 'Not recorded'])} /> : <p className="ehr-empty">No family history recorded.</p> : <div className="ehr-table-wrap ehr-panel"><table className="ehr-table"><thead><tr><th>Condition</th><th>Relative</th><th>Notes</th></tr></thead><tbody>{medicalConditions.map((condition) => <tr key={condition}><td>{condition}</td><td>Not reported</td><td>Not reported</td></tr>)}</tbody></table></div>}</>}
        {tab === "Women's Health" && <><h2 className="ehr-section-title">Menstruation</h2><div className="ehr-detail-grid">{['Menstrual status', 'Last period', 'Average period duration', 'Average cycle duration', 'Pain level (0–10)', 'Breast tenderness', 'Lower back pain', 'Abdominal cramps', 'Other'].map((field) => <Detail key={field} label={field} value="Not recorded" />)}</div><h2 className="ehr-section-title">Characteristics & discharge</h2><div className="ehr-inline-list">{['Dark', 'Bright', 'Red', 'Pink', 'Thick', 'Thin', 'Clots', 'Watery', 'Clear', 'Milky', 'Yellow', 'Odor', 'NAD'].map((item) => <span className="ehr-tag" key={item}>{item}</span>)}</div><h2 className="ehr-section-title">Pregnancy history & care giver</h2><div className="ehr-detail-grid">{['Pregnancies', 'Births', 'Miscarriages', 'Abortions', 'Premature births', 'Currently pregnant', 'Weeks of pregnancy', 'Due date', 'Gynecologist / care giver', 'Address', 'Phone'].map((field) => <Detail key={field} label={field} value="Not recorded" />)}</div></>}
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
  const treatmentRows = record.encounters.flatMap((encounter) => encounter.treatments.map((treatment) => [new Date(encounter.encounterDate).toLocaleDateString(), treatment.treatmentType, treatment.durationMinutes ? `${treatment.durationMinutes} min` : 'Not recorded', String(treatment.units), 'Assigned provider']))
  const billingRows = record.encounters.flatMap((encounter) => encounter.billingRecords.map((billing) => [new Date(encounter.encounterDate).toLocaleDateString(), billing.cptCode.code, billing.cptCode.serviceName, String(billing.units), billing.status]))

  return <>
    <div className="ehr-tabs" role="tablist" aria-label="Patient record sections">
      {tabs.map((item) => <button className="ehr-tab" key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{item}</button>)}
    </div>
    <section className="ehr-profile-content" role="tabpanel">
      {tab === 'Overview' && <><h2 className="ehr-section-title">Patient information</h2><div className="ehr-detail-grid"><Detail label="Primary concern" value={patient.complaint} /><Detail label="Intake records" value={record.intakes.length} /><Detail label="Encounters" value={record.encounters.length} /><Detail label="Active medications" value={record.medications.filter((entry) => entry.active).length} /><Detail label="Allergy records" value={record.allergies.length} /><Detail label="Documents" value={record.documents.length} /></div></>}
      {tab === 'Intake' && <><h2 className="ehr-section-title">Patient-reported intake</h2>{record.intakes.length ? record.intakes.map((intake, index) => <div className="ehr-form-section" key={index}><div className="ehr-detail-grid"><Detail label="Major complaint" value={intake.majorComplaints} /><Detail label="Frequency" value={intake.frequency} /><Detail label="Symptom change" value={intake.symptomChange} /><Detail label="Pain intensity" value={intake.painIntensity === null ? null : `${intake.painIntensity} / 10`} /><Detail label="Pain locations" value={intake.selections.filter((entry) => entry.kind === 'pain_location').map((entry) => entry.value).join(', ')} /><Detail label="Symptom nature" value={intake.selections.filter((entry) => entry.kind === 'symptom_nature').map((entry) => entry.value).join(', ')} /></div><h3 className="ehr-section-title">Diagnostic tests</h3>{intake.diagnosticTests.length ? <div className="ehr-inline-list">{intake.diagnosticTests.map((test, testIndex) => <span className="ehr-tag" key={testIndex}>{test.testType}{test.location ? ` · ${test.location}` : ''}</span>)}</div> : <span className="ehr-table-sub">No tests recorded</span>}</div>) : <p className="ehr-empty">No intake information recorded.</p>}<h2 className="ehr-section-title">AI Voice Intake</h2>{record.interviews.length ? record.interviews.map((interview, index) => <div className="ehr-ai-panel" key={index}><div><h3>Interview · {interview.status}</h3><p>{interview.aiSummary || 'No AI summary recorded.'}</p><details><summary>Transcript and structured responses</summary><p>{interview.transcript || 'Transcript not available.'}</p><pre>{interview.structuredResponses || 'Structured responses not available.'}</pre></details></div><div className="ehr-ai-meta"><span><strong>Started</strong>{interview.startedAt || 'Not available'}</span><span><strong>Completed</strong>{interview.completedAt || 'Not available'}</span><span><strong>Review required</strong>{interview.reviewRequired ? 'Yes' : 'No'}</span><span><strong>Provider reviewed</strong>{interview.providerReviewed ? interview.providerReviewDate || 'Yes' : 'No'}</span></div></div>) : <p className="ehr-empty">No interview started. AI intake must remain patient-reported and provider-reviewed.</p>}</>}
      {tab === 'Medical History' && <><h2 className="ehr-section-title">Past medical history</h2>{record.medicalHistories.length ? <ModuleTable headings={['Category', 'Condition / details']} rows={record.medicalHistories.map((entry) => [entry.category, entry.details ? `${entry.condition}: ${entry.details}` : entry.condition])} /> : <p className="ehr-empty">No medical history recorded.</p>}</>}
      {tab === 'Symptoms' && <><h2 className="ehr-section-title">TCM symptom inventory</h2>{Object.entries(symptomGroups).map(([category, names]) => <div key={category}><h3 className="ehr-section-title">{category}</h3><div className="ehr-option-grid">{names.map((name) => <label className="ehr-option" key={name}><input type="checkbox" disabled checked={observedSymptoms.has(name)} />{name}</label>)}</div></div>)}</>}
      {tab === 'Medications' && <><h2 className="ehr-section-title">Current medications</h2>{record.medications.length ? <ModuleTable headings={['Category', 'Name', 'Dosage', 'Frequency', 'Route', 'Status']} rows={record.medications.map((entry) => [entry.medication.category, entry.medication.name, [entry.dosage, entry.unit].filter(Boolean).join(' '), entry.frequency || 'Not recorded', entry.route || 'Not recorded', entry.active ? 'Active' : 'Inactive'])} /> : <p className="ehr-empty">No medication records.</p>}</>}
      {tab === 'Allergies' && <><h2 className="ehr-section-title">Allergies</h2>{record.allergies.length ? <ModuleTable headings={['Allergen', 'Reaction', 'Severity']} rows={record.allergies.map((entry) => [entry.allergen, entry.reaction || 'Not recorded', entry.severity || 'Not recorded'])} /> : <p className="ehr-empty">No allergy records. This does not indicate that allergies were assessed.</p>}</>}
      {tab === 'Family History' && <><h2 className="ehr-section-title">Family medical history</h2>{record.familyHistories.length ? <ModuleTable headings={['Condition', 'Relative', 'Notes']} rows={record.familyHistories.map((entry) => [entry.condition, entry.relative || 'Not recorded', entry.details || 'Not recorded'])} /> : <p className="ehr-empty">No family history recorded.</p>}</>}
      {tab === "Women's Health" && <><h2 className="ehr-section-title">Women&apos;s health</h2>{record.womensHealth ? <div className="ehr-detail-grid">{Object.entries(record.womensHealth).filter(([key]) => !['id', 'patientId', 'createdAt', 'updatedAt'].includes(key)).map(([key, value]) => <Detail key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())} value={value === true ? 'Yes' : value === false ? 'No' : value?.toString()} />)}</div> : <p className="ehr-empty">No women&apos;s health record.</p>}</>}
      {tab === 'Encounters' && <><h2 className="ehr-section-title">Encounters</h2>{record.encounters.length ? <ModuleTable headings={['Date', 'Encounter ID', 'Visit type', 'Chief complaint', 'Status']} rows={record.encounters.map((entry) => [new Date(entry.encounterDate).toLocaleDateString(), entry.encounterId, entry.visitType, entry.chiefComplaint || 'Not recorded', entry.status])} /> : <p className="ehr-empty">No encounter records.</p>}</>}
      {tab === 'Treatments' && <><h2 className="ehr-section-title">Treatments</h2>{treatmentRows.length ? <ModuleTable headings={['Date', 'Treatment', 'Duration', 'Units', 'Provider']} rows={treatmentRows} /> : <p className="ehr-empty">No treatment records.</p>}</>}
      {tab === 'Billing' && <><h2 className="ehr-section-title">Billing records</h2>{billingRows.length ? <ModuleTable headings={['Service date', 'CPT', 'Service', 'Units', 'Status']} rows={billingRows} /> : <p className="ehr-empty">No billing records.</p>}</>}
      {tab === 'Documents' && <><h2 className="ehr-section-title">Documents</h2>{record.documents.length ? <ModuleTable headings={['Name', 'Type', 'Date']} rows={record.documents.map((document) => [document.name, document.documentType, new Date(document.createdAt).toLocaleDateString()])} /> : <p className="ehr-empty">No documents.</p>}</>}
    </section>
  </>
}

function ModuleTable({ headings, rows }: { headings: string[]; rows: string[][] }) {
  return <section className="ehr-panel"><div className="ehr-table-wrap"><table className="ehr-table"><thead><tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div></section>
}

function Field({ label, name, type = 'text', wide = false, options }: { label: string; name: string; type?: string; wide?: boolean; options?: string[] }) {
  return <div className={`ehr-field${wide ? ' ehr-field-full' : ''}`}><label htmlFor={name}>{label}</label>{options ? <select id={name} name={name}><option value="">Select</option>{options.map((item) => <option key={item} value={item}>{item}</option>)}</select> : type === 'textarea' ? <textarea id={name} name={name} /> : <input id={name} name={name} type={type} />}</div>
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
      <PageHeading eyebrow="Patient-reported information" title="Patient intake" description="Capture the patient’s report separately from provider assessment." action={<span className="ehr-demo-chip">DRAFT · NOT A DIAGNOSIS</span>} />
      <DemoBanner />
      <form onSubmit={submitIntake}>
        <section className="ehr-form-section"><h2>Patient information</h2><div className="ehr-form-grid"><div className="ehr-field"><label htmlFor="patientId">Patient record</label><select id="patientId" name="patientId" required defaultValue=""><option value="">Select database patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.patientId} · {patient.firstName} {patient.lastName}</option>)}</select><small className="ehr-table-sub">Synthetic patient records must be seeded before this can save.</small></div><Field label="Intake date" name="intakeDate" type="date" /><Field label="Major complaints" name="majorComplaints" type="textarea" wide /><Field label="Date of onset" name="onsetDate" type="date" /><div className="ehr-field"><label htmlFor="frequency">Symptom frequency</label><select id="frequency" name="frequency"><option value="">Select frequency</option><option value="constant">Constantly · 76–100% of the day</option><option value="frequent">Frequently · 51–75%</option><option value="occasional">Occasionally · 26–50%</option><option value="intermittent">Intermittently · 0–25%</option></select></div><div className="ehr-field ehr-field-full"><label>Nature of symptoms</label><div className="ehr-choice-row">{['Sharp', 'Shooting', 'Dull ache', 'Burning', 'Numb', 'Tingling'].map((item) => <label className="ehr-option" key={item}><input name="symptomNature" type="checkbox" value={item.toLowerCase().replace(' ', '_')} />{item}</label>)}</div></div><div className="ehr-field"><label htmlFor="symptomChange">How symptoms are changing</label><select id="symptomChange" name="symptomChange"><option value="">Select</option><option value="improving">Improving</option><option value="no_change">No change</option><option value="worsening">Getting worse</option></select></div><div className="ehr-field"><label htmlFor="painIntensity">Pain intensity · 0–10</label><input id="painIntensity" name="painIntensity" type="number" min="0" max="10" /></div><div className="ehr-field ehr-field-full"><label>Pain location</label><div className="ehr-choice-row">{['Front', 'Back', 'Left', 'Right'].map((item) => <label className="ehr-option" key={item}><input name="locations" type="checkbox" value={item.toLowerCase()} />{item}</label>)}</div></div><Field label="Effect on normal work" name="workImpact" type="textarea" /><Field label="Effect on social life" name="socialImpact" type="textarea" /><Field label="Overall health" name="overallHealth" options={['Excellent', 'Very good', 'Good', 'Fair', 'Poor']} /><Field label="Previous providers" name="previousProviders" type="textarea" /></div></section>
        <section className="ehr-form-section"><h2>Previous diagnostic tests</h2>{testRows.map((index) => <div className="ehr-form-grid" key={index} style={{ marginBottom: 12 }}><Field label="Test type" name={`diagnosticTest_${index}`} options={['X-Ray', 'MRI', 'CT Scan', 'Other']} /><Field label="Test date" name={`testDate_${index}`} type="date" /><div className="ehr-field ehr-field-full"><Field label="Location" name={`testLocation_${index}`} /></div></div>)}<button type="button" className="ehr-button ehr-button-light" onClick={() => setTestRows((rows) => [...rows, Math.max(...rows) + 1])}><Plus /> Add another test</button></section>
        <section className="ehr-form-section"><h2>Past medical history</h2><div className="ehr-option-grid">{medicalConditions.map((condition) => <label className="ehr-option" key={condition}><input type="checkbox" name="medicalHistory" value={condition} />{condition}</label>)}</div><div className="ehr-form-grid" style={{ marginTop: 15 }}><Field label="Diseases & surgeries · one per line" name="diseasesSurgeries" type="textarea" /><Field label="Traumas · one per line" name="traumas" type="textarea" /><Field label="Car accidents · one per line" name="carAccidents" type="textarea" /><Field label="Falls · one per line" name="falls" type="textarea" /><Field label="Allergies · one per line" name="allergies" type="textarea" /></div></section>
        <section className="ehr-form-section"><h2>Current health profile</h2><div className="ehr-table-wrap"><table className="ehr-table"><thead><tr><th>Habit</th><th>Yes / No</th><th>Frequency</th><th>Amount</th><th>Notes</th></tr></thead><tbody>{lifestyleCategories.map((habit) => { const key = habit.toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, ''); return <tr key={habit}><td>{habit}</td><td><select name={`${key}_uses`} aria-label={`${habit} yes or no`}><option value="">Not recorded</option><option value="yes">Yes</option><option value="no">No</option></select></td><td><input name={`${key}_frequency`} aria-label={`${habit} frequency`} /></td><td><input name={`${key}_amount`} aria-label={`${habit} amount`} /></td><td><input name={`${key}_notes`} aria-label={`${habit} notes`} /></td></tr>})}</tbody></table></div></section>
        <section className="ehr-form-section"><h2>Patient notes & signature</h2><div className="ehr-form-grid"><Field label="Patient questions" name="patientQuestions" type="textarea" /><Field label="Patient concerns" name="patientConcerns" type="textarea" /><Field label="Additional information" name="additionalInformation" type="textarea" /><Field label="Patient signature · typed name" name="signatureName" /><Field label="Signature date" name="signatureDate" type="date" /></div></section>
        <section className="ehr-form-section"><h2>AI Voice Intake</h2><div className="ehr-ai-panel"><div><h3><AudioLines size={16} style={{ verticalAlign: 'middle', marginRight: 7 }} />Interview not started</h3><p>Interview launch is reserved for a later phase. AI will summarize patient-reported information only; a provider must review and approve all clinical documentation.</p></div><div className="ehr-ai-meta"><span><strong>Status</strong>Not started</span><span><strong>Started / completed</strong>Not available</span><span><strong>Transcript / summary</strong>Not available</span><span><strong>Review required</strong>Yes · provider review pending</span></div></div></section>
        <div className="ehr-form-actions"><span className="ehr-form-message" role="status">{message}</span><button className="ehr-button" type="submit" disabled={busy || patients.length === 0}>{busy ? 'Saving…' : <><Check /> Save intake draft</>}</button></div>
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
  const details = moduleDetails[module]
  return (
    <>
      <PageHeading {...details} action={module === 'encounters' ? <button className="ehr-button" type="button"><Plus /> New encounter</button> : undefined} />
      <DemoBanner />
      {module === 'encounters' && <><div className="ehr-module-grid"><div className="ehr-module-item"><h3>Visit types</h3><p>Initial evaluation · Follow-up · Treatment only · Other</p></div><div className="ehr-module-item"><h3>Encounter status</h3><p>Draft · In progress · Signed · Cancelled</p></div><div className="ehr-module-item"><h3>Linked record</h3><p>Patient · provider · clinical note · treatments · billing</p></div></div><ModuleTable headings={['Encounter ID', 'Patient', 'Date', 'Visit type', 'Provider', 'Status']} rows={[["ENC-DEMO-260928-01", 'Avery Chen', 'Sep 28, 2026', 'Follow-up', 'Clinic provider', 'In progress'], ["ENC-DEMO-260928-02", 'Jordan Lee', 'Sep 28, 2026', 'Initial evaluation', 'Clinic provider', 'Scheduled'], ["ENC-DEMO-260927-01", 'Riley Wong', 'Sep 27, 2026', 'Treatment only', 'Clinic provider', 'Signed']]} /></>}
      {module === 'notes' && <><div className="ehr-module-grid">{[
        ['Look / Observation', 'Tongue · complexion · body appearance · other observations'],
        ['Listen / Smell', 'Voice · breathing · cough · odor · other findings'],
        ['Inquiry', 'Symptoms · sleep · appetite · digestion · bowel · urination · thirst · temperature · sweating · menstruation · emotional status · pain'],
        ['Palpation', 'Pulse · tenderness · abdomen · other findings'],
        ['Provider assessment', 'TCM pattern / assessment · treatment principle'],
        ['Plan', 'Acupuncture points · electro-acupuncture · manual therapy · herbs · lifestyle · follow-up'],
      ].map(([title, text]) => <div className="ehr-module-item" key={title}><h3>{title}</h3><p>{text}</p></div>)}</div><ModuleTable headings={['Encounter', 'Patient', 'Date', 'Provider', 'Note status']} rows={[["ENC-DEMO-260928-01", 'Avery Chen', 'Sep 28, 2026', 'Clinic provider', 'Draft · review required'], ["ENC-DEMO-260927-01", 'Riley Wong', 'Sep 27, 2026', 'Clinic provider', 'Signed']]} /></>}
      {module === 'treatments' && <><div className="ehr-module-grid">{['Acupuncture', 'Electro-Acupuncture', 'Manual Therapy', 'Herbal Medicine', 'Other'].map((kind) => <div className="ehr-module-item" key={kind}><h3>{kind}</h3><p>Linked to encounter · time · duration · units · provider · notes</p></div>)}</div><ModuleTable headings={['Treatment ID', 'Encounter', 'Patient', 'Treatment type', 'Duration', 'Units', 'Provider']} rows={[["TRT-DEMO-1001", "ENC-DEMO-260928-01", 'Avery Chen', 'Acupuncture', '30 min', '1', 'Clinic provider'], ["TRT-DEMO-1002", "ENC-DEMO-260927-01", 'Riley Wong', 'Manual Therapy', '15 min', '1', 'Clinic provider']]} /></>}
      {module === 'medications' && <><div className="ehr-module-grid">{['Pharmaceutical medications', 'Vitamin / mineral supplements', 'Traditional herbs & medicines'].map((category) => <div className="ehr-module-item" key={category}><h3>{category}</h3><p>Multiple active and inactive medication records per patient.</p></div>)}</div><ModuleTable headings={['Patient', 'Medication', 'Category', 'Dosage', 'Frequency', 'Route', 'Status']} rows={[["Avery Chen", 'Demo supplement', 'Vitamin / mineral', '1 capsule', 'Daily', 'Oral', 'Active'], ['Jordan Lee', 'No records', '—', '—', '—', '—', '—']]} /></>}
      {module === 'billing' && <><div className="ehr-form-section"><h2>Project CPT master</h2><p className="ehr-table-sub">The following project-provided codes are retained as supplied. No code is automatically altered or removed.</p></div><ModuleTable headings={['CPT code', 'Service name', 'Service type', 'Initial / subsequent', 'Duration', 'Unit', 'Active']} rows={cptCodes.map((item) => [item.code, item.service, item.type, item.sequence, 'Not specified', 'Unit', 'Yes'])} /><div className="ehr-module-grid" style={{ marginTop: 15 }}><div className="ehr-module-item"><h3>Billing records</h3><p>Linked to patient, encounter, treatment, CPT item, units, and service date.</p></div><div className="ehr-module-item"><h3>Calculation status</h3><p>No billing or insurance calculations are enabled in Phase 1.</p></div><div className="ehr-module-item"><h3>Review queue</h3><p>Sample records remain in draft for staff review.</p></div></div></>}
      {module === 'documents' && <><div className="ehr-module-grid"><div className="ehr-module-item"><h3>Patient documents</h3><p>Consent forms · intake forms · uploaded records.</p></div><div className="ehr-module-item"><h3>Encounter documents</h3><p>Clinical note attachments linked to a visit.</p></div><div className="ehr-module-item"><h3>Storage</h3><p>Store a protected storage key, not document contents in the patient record.</p></div></div><ModuleTable headings={['Name', 'Document type', 'Patient', 'Date added', 'Status']} rows={[["Synthetic intake form", 'Patient intake', 'Avery Chen', 'Sep 24, 2026', 'Indexed'], ['Synthetic consent form', 'Consent', 'Riley Wong', 'Sep 18, 2026', 'Indexed']]} /></>}
      {module === 'settings' && <><div className="ehr-module-grid">{[['Patient', 'Own records only · patient portal not enabled'], ['Provider', 'Authorized patient records · clinical documentation'], ['Admin', 'System configuration · user management foundation'], ['Billing staff', 'Billing records only · clinical access blocked']].map(([role, description]) => <div className="ehr-module-item" key={role}><h3>{role}</h3><p>{description}</p></div>)}</div><div className="ehr-form-section"><h2>Security status</h2><div className="ehr-detail-grid"><Detail label="Authentication" value="Clerk-managed sessions and identity" /><Detail label="Development writes" value="Enabled only outside production" /><Detail label="AI services" value="Not connected; no patient information is sent externally" /><Detail label="Audit foundation" value="Patient access and modification event model added" /><Detail label="Patient storage" value="Normalized relational Prisma schema" /><Detail label="Clinical sign-off" value="Provider review required for clinical documentation" /></div></div></>}
      <div className="ehr-workflow"><Link href="/ehr/patients"><span>1</span>Patients</Link><Link href="/ehr/intake"><span>2</span>Intake</Link><Link href="/ehr/encounters"><span>3</span>Encounter</Link><Link href="/ehr/notes"><span>4</span>TCM note</Link></div>
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
        lastVisit: item.profile?.lastVisitAt ? new Date(item.profile.lastVisitAt).toLocaleDateString() : 'No visits',
        nextVisit: 'Not scheduled',
        complaint: item.intakes?.[0]?.majorComplaints || 'No complaint recorded',
        emergencyContact: item.profile?.emergencyContact || '',
        relationship: item.profile?.emergencyRelationship || '',
        emergencyPhone: item.profile?.emergencyContactPhone || '',
        dateOfBirth: birthDate?.toLocaleDateString() || 'Not recorded',
        address: [item.profile?.address, item.profile?.city, item.profile?.state, item.profile?.postalCode].filter(Boolean).join(' · '),
        createdAt: new Date(item.createdAt).toLocaleDateString(),
      })
    }).catch(() => setPatient(null)).finally(() => setLoading(false))
  }, [demoPatient, id])

  if (loading) return <div className="ehr-empty">Loading patient record…</div>
  if (!patient) return <div className="ehr-empty">Patient record unavailable or access is not assigned.</div>
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
    <PageHeading eyebrow="Patient registration" title="Add patient" description="Create a demographic record. Clinical details are collected separately in intake." action={<Link className="ehr-button ehr-button-light" href="/ehr/patients">Back to patients</Link>} />
    <DemoBanner />
    <form onSubmit={createPatient}>
      <section className="ehr-form-section"><h2>Patient information</h2><div className="ehr-form-grid">
        <Field label="First name" name="firstName" /><Field label="Middle name" name="middleName" />
        <Field label="Last name" name="lastName" /><Field label="Date of birth" name="dateOfBirth" type="date" />
        <Field label="Gender" name="gender" options={['Female', 'Male', 'Non-binary', 'Prefer not to say', 'Other']} />
        <Field label="Preferred language" name="preferredLanguage" options={['English', 'Mandarin', 'Cantonese', 'Other']} />
        <Field label="Phone" name="phone" type="tel" /><Field label="Email" name="email" type="email" />
        <Field label="Address" name="address" /><Field label="Emergency contact" name="emergencyContact" />
        <Field label="Relationship" name="emergencyRelationship" /><Field label="Emergency contact phone" name="emergencyContactPhone" type="tel" />
      </div></section>
      <div className="ehr-form-actions"><span className="ehr-form-message" role="status">{message}</span><button className="ehr-button" type="submit" disabled={busy}>{busy ? 'Creating…' : <><Plus /> Create patient</>}</button></div>
    </form>
  </>
}