'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import AdminPageScaffold from '@/components/AdminPageScaffold'

type PatientRecord = {
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: string | null
  gender: string | null
  phone: string | null
  email: string | null
  profile: {
    address: string | null
    city: string | null
    state: string | null
    postalCode: string | null
    country: string | null
  } | null
}

const tabs = ['Overview', 'Medical History', 'Visits'] as const
type PatientTab = (typeof tabs)[number]

export default function PatientProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<PatientTab>('Overview')
  const [patient, setPatient] = useState<PatientRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    const loadPatient = async () => {
      try {
        const response = await fetch(`/api/ehr/patients/${encodeURIComponent(id)}`)
        const result = await response.json()
        if (!response.ok) {
          if (isCurrent) setError(result.error || 'Unable to load patient information.')
          return
        }
        if (isCurrent) setPatient(result.patient)
      } catch (loadError) {
        console.error('Error loading patient profile:', loadError)
        if (isCurrent) setError('Unable to load patient information. Check your connection and try again.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadPatient()
    return () => {
      isCurrent = false
    }
  }, [id])

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : ''
  const address = patient
    ? [
        patient.profile?.address,
        patient.profile?.city,
        patient.profile?.state,
        patient.profile?.postalCode,
        patient.profile?.country,
      ].filter(Boolean).join(', ')
    : ''
  const patientDetails = patient ? [
    ['Patient ID', patient.patientId],
    ['Date of birth', patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '—'],
    ['Gender', patient.gender || '—'],
    ['Phone', patient.phone || '—'],
    ['Email', patient.email || '—'],
    ['Address', address || '—'],
  ] as const : []

  return (
    <AdminPageScaffold
      title="Patient Profile"
      description={patient ? `Patient ID: ${patient.patientId}. View patient information and care history.` : 'View patient information and care history.'}
      backHref="/admin/patients"
      backLabel="Back to Patients"
    >
      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm" role="status">
          Loading patient information…
        </div>
      ) : error || !patient ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700" role="alert">
          {error || 'Patient not found.'}
        </div>
      ) : (
        <>
          <section className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E8EFEA] text-lg font-semibold text-[#355C46]">
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Patient profile</p>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900">{patientName}</h2>
                  <p className="mt-1 text-sm text-gray-600">Patient ID: {patient.patientId}</p>
                </div>
              </div>
              <Link
                href={`/admin/patients/${id}/edit`}
                className="inline-flex w-fit items-center justify-center rounded-md bg-[#355C46] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#294936]"
              >
                Edit Patient
              </Link>
            </div>
          </section>

          <div className="border-b border-gray-200">
            <div aria-label="Patient profile sections" className="-mb-px flex gap-6 overflow-x-auto" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  id={`tab-${tab.toLowerCase().replace(/ /g, '-')}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls="patient-profile-panel"
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition ${
                    activeTab === tab
                      ? 'border-[#355C46] text-[#355C46]'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <section
            id="patient-profile-panel"
            role="tabpanel"
            aria-labelledby={`tab-${activeTab.toLowerCase().replace(/ /g, '-')}`}
            className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
          >
            {activeTab === 'Overview' ? (
              <>
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-[#355C46]">Basic Information</h2>
                  <p className="mt-1 text-sm text-gray-500">Patient contact and identification details.</p>
                </div>
                <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  {patientDetails.map(([label, value]) => (
                    <div key={label} className={label === 'Address' ? 'sm:col-span-2' : undefined}>
                      <dt className="text-sm font-medium text-gray-500">{label}</dt>
                      <dd className="mt-1 break-words text-sm text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <div className="py-8 text-center">
                <h2 className="text-lg font-semibold text-[#355C46]">{activeTab}</h2>
                <p className="mt-2 text-sm text-gray-600">This section will be available in a future update.</p>
              </div>
            )}
          </section>
        </>
      )}
    </AdminPageScaffold>
  )
}
