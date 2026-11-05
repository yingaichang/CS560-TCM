'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminPageScaffold from '@/components/AdminPageScaffold'

type Patient = {
  id: string
  patientId: string
  firstName: string
  middleName: string | null
  lastName: string
  dateOfBirth: string | null
  phone: string | null
  email: string | null
  status: string
  profile: {
    city: string | null
    state: string | null
  } | null
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await fetch('/api/ehr/patients')
        const result = await response.json()
        if (!response.ok) {
          setError(result.error || 'Unable to load patients.')
          return
        }
        setPatients(result.patients)
      } catch (loadError) {
        console.error('Error loading patients:', loadError)
        setError('Unable to load patients. Check your connection and try again.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadPatients()
  }, [])

  return (
    <AdminPageScaffold
      title="病人管理"
      description="Browse the patient list and open a patient profile to view their information and medical history."
      backHref="/admin"
      backLabel="返回後台首頁"
    >
      <div className="mb-4 flex justify-end">
        <Link href="/admin/patients/new" className="rounded bg-[#355C46] px-3 py-2 text-sm font-medium text-white">
          新增病人
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white p-4 shadow-sm">
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>
        ) : isLoading ? (
          <p className="py-4 text-sm text-gray-600">Loading patients…</p>
        ) : patients.length === 0 ? (
          <p className="py-4 text-sm text-gray-600">No patients yet. Select “新增病人” to add the first patient.</p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs text-gray-500">
              <tr>
                <th className="py-2">Patient ID</th>
                <th>Name</th>
                <th>Date of birth</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-t">
                  <td className="py-3">
                    <Link href={`/admin/patients/${patient.id}`} className="font-medium text-[#355C46] underline">
                      {patient.patientId}
                    </Link>
                  </td>
                  <td>{[patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ')}</td>
                  <td>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '—'}</td>
                  <td>{patient.phone || '—'}</td>
                  <td>{patient.email || '—'}</td>
                  <td>{[patient.profile?.city, patient.profile?.state].filter(Boolean).join(', ') || '—'}</td>
                  <td>{patient.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageScaffold>
  )
}
