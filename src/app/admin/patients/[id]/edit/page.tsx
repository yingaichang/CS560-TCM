'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import AdminPageScaffold from '@/components/AdminPageScaffold'

const inputClassName = 'mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#355C46] focus:ring-2 focus:ring-[#355C46]/15'
const labelClassName = 'block text-sm font-medium text-gray-700'

const fields = [
  ['firstName', 'First name', 'text'],
  ['lastName', 'Last name', 'text'],
  ['dateOfBirth', 'Date of birth', 'date'],
  ['gender', 'Gender', 'text'],
  ['phone', 'Phone number', 'tel'],
  ['email', 'Email address', 'email'],
  ['address', 'Street address', 'text'],
  ['city', 'City', 'text'],
  ['state', 'State / Province', 'text'],
  ['postalCode', 'ZIP / Postal code', 'text'],
  ['country', 'Country', 'text'],
  ['emergencyContact', 'Emergency contact name', 'text'],
  ['emergencyRelationship', 'Emergency contact relationship', 'text'],
  ['emergencyContactPhone', 'Emergency contact phone', 'tel'],
  ['emergencyContactEmail', 'Emergency contact email', 'email'],
] as const

type PatientField = (typeof fields)[number][0]
type PatientForm = Record<PatientField, string>

const emptyPatient: PatientForm = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  emergencyContact: '',
  emergencyRelationship: '',
  emergencyContactPhone: '',
  emergencyContactEmail: '',
}

function toDateInputValue(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

export default function EditPatientPage() {
  const { id } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<PatientForm>(emptyPatient)
  const [patientId, setPatientId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<PatientField, string>>>({})
  const [saved, setSaved] = useState(false)

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

        const record = result.patient
        if (isCurrent) {
          setPatientId(record.patientId)
          setPatient({
            firstName: record.firstName || '',
            lastName: record.lastName || '',
            dateOfBirth: toDateInputValue(record.dateOfBirth),
            gender: record.gender || '',
            phone: record.phone || '',
            email: record.email || '',
            address: record.profile?.address || '',
            city: record.profile?.city || '',
            state: record.profile?.state || '',
            postalCode: record.profile?.postalCode || '',
            country: record.profile?.country || '',
            emergencyContact: record.profile?.emergencyContact || '',
            emergencyRelationship: record.profile?.emergencyRelationship || '',
            emergencyContactPhone: record.profile?.emergencyContactPhone || '',
            emergencyContactEmail: record.profile?.emergencyContactEmail || '',
          })
        }
      } catch (loadError) {
        console.error('Error loading patient for editing:', loadError)
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSaved(false)
    setFieldErrors({})

    const nextFieldErrors: Partial<Record<PatientField, string>> = {}
    for (const [field, label] of fields) {
      if (!patient[field].trim()) nextFieldErrors[field] = `${label} is required.`
    }

    for (const field of ['phone', 'emergencyContactPhone'] as const) {
      const value = patient[field].trim()
      const digits = value.replace(/\D/g, '')
      if (value && (!/^[+\d\s().-]+$/.test(value) || digits.length < 7 || digits.length > 15)) {
        nextFieldErrors[field] = 'Enter a valid phone number (7–15 digits).'
      }
    }

    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/ehr/patients/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      })
      const result = await response.json()

      if (!response.ok) {
        setFieldErrors(result.fieldErrors || {})
        setError(result.error || 'Unable to update patient. Please try again.')
        return
      }

      setSaved(true)
    } catch (saveError) {
      console.error('Error updating patient:', saveError)
      setError('Unable to update patient. Check your connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const renderFields = (selectedFields: readonly PatientField[]) => fields
    .filter(([field]) => selectedFields.includes(field))
    .map(([field, label, type]) => (
      <label key={field} className={labelClassName}>
        {label} <span className="text-red-600">*</span>
        <input
          aria-invalid={Boolean(fieldErrors[field])}
          aria-describedby={fieldErrors[field] ? `${field}-error` : undefined}
          onChange={(event) => {
            setPatient((current) => ({ ...current, [field]: event.target.value }))
            setFieldErrors((current) => ({ ...current, [field]: '' }))
            setSaved(false)
          }}
          className={inputClassName}
          name={field}
          type={type}
          value={patient[field]}
          required
        />
        {fieldErrors[field] && (
          <span id={`${field}-error`} className="mt-1 block text-xs text-red-700">{fieldErrors[field]}</span>
        )}
      </label>
    ))

  return (
    <AdminPageScaffold
      title="Edit Patient"
      description={patientId ? `Update the information for patient ${patientId}.` : 'Update patient information.'}
      backHref={`/admin/patients/${id}`}
      backLabel="Back to Patient Profile"
    >
      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm" role="status">
          Loading patient information…
        </div>
      ) : error && !patientId ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700" role="alert">
          <p>{error}</p>
          {error === 'Not authorized' && (
            <Link href={`/sign-in?redirect_url=${encodeURIComponent(`/admin/patients/${id}/edit`)}`} className="mt-2 inline-block font-semibold underline">
              Sign in and return to Edit Patient
            </Link>
          )}
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-[#355C46]">Personal Information</h2>
            <p className="mt-1 text-sm text-gray-500">Basic identifying information for the patient.</p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderFields(['firstName', 'lastName', 'dateOfBirth', 'gender'])}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-[#355C46]">Contact Information</h2>
            <p className="mt-1 text-sm text-gray-500">Patient contact details and address.</p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderFields(['phone', 'email', 'address', 'city', 'state', 'postalCode', 'country'])}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-[#355C46]">Emergency Contact</h2>
            <p className="mt-1 text-sm text-gray-500">A person to contact in case of an emergency.</p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderFields(['emergencyContact', 'emergencyRelationship', 'emergencyContactPhone', 'emergencyContactEmail'])}
            </div>
          </section>

          {saved && (
            <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
              Patient changes saved successfully.
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href={`/admin/patients/${id}`} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </Link>
            <button type="submit" disabled={isSaving || isLoading} className="rounded-md bg-[#355C46] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#294936] disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </AdminPageScaffold>
  )
}
