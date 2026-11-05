'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import AdminPageScaffold from '@/components/AdminPageScaffold'

const inputClassName = 'mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#355C46] focus:ring-2 focus:ring-[#355C46]/15'
const labelClassName = 'block text-sm font-medium text-gray-700'

export default function NewPatientPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [savedPatientId, setSavedPatientId] = useState('')
  const [authorizationError, setAuthorizationError] = useState<'sign-in' | 'role' | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setAuthorizationError(null)

    const formData = new FormData(event.currentTarget)
    const value = (name: string) => String(formData.get(name) || '').trim()
    const phoneNumberIsValid = (phone: string) => {
      const digits = phone.replace(/\D/g, '')
      return /^[+\d\s().-]+$/.test(phone) && digits.length >= 7 && digits.length <= 15
    }
    const nextFieldErrors: Record<string, string> = {}
    const requiredFields = [
      ['firstName', 'First name'],
      ['lastName', 'Last name'],
      ['dateOfBirth', 'Date of birth'],
      ['gender', 'Gender'],
      ['phone', 'Phone number'],
      ['email', 'Email address'],
      ['streetAddress', 'Street address'],
      ['city', 'City'],
      ['region', 'State / Province'],
      ['postalCode', 'ZIP / Postal code'],
      ['country', 'Country'],
      ['emergencyContactName', 'Emergency contact name'],
      ['emergencyContactRelationship', 'Emergency contact relationship'],
      ['emergencyContactPhone', 'Emergency contact phone'],
      ['emergencyContactEmail', 'Emergency contact email'],
    ] as const

    for (const [field, label] of requiredFields) {
      if (!value(field)) nextFieldErrors[field] = `${label} is required.`
    }
    for (const field of ['phone', 'emergencyContactPhone']) {
      const phone = value(field)
      if (phone && !phoneNumberIsValid(phone)) {
        nextFieldErrors[field] = 'Enter a valid phone number (7–15 digits).'
      }
    }
    const dateOfBirth = value('dateOfBirth')
    if (dateOfBirth && Number.isNaN(Date.parse(`${dateOfBirth}T00:00:00`))) {
      nextFieldErrors.dateOfBirth = 'Enter a valid date of birth.'
    }
    for (const field of ['email', 'emergencyContactEmail']) {
      const email = value(field)
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextFieldErrors[field] = 'Enter a valid email address.'
      }
    }
    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) return

    setIsSaving(true)
    const payload = {
      firstName: value('firstName'),
      lastName: value('lastName'),
      dateOfBirth: value('dateOfBirth'),
      gender: value('gender'),
      phone: value('phone'),
      email: value('email'),
      address: value('streetAddress'),
      city: value('city'),
      state: value('region'),
      postalCode: value('postalCode'),
      country: value('country'),
      emergencyContact: value('emergencyContactName'),
      emergencyRelationship: value('emergencyContactRelationship'),
      emergencyContactPhone: value('emergencyContactPhone'),
      emergencyContactEmail: value('emergencyContactEmail'),
      requireCompleteProfile: true,
    }

    try {
      const response = await fetch('/api/ehr/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          const authStatus = response.headers.get('x-clerk-auth-status')
          const isSignedOut = authStatus === 'signed-out' || authStatus === 'dev-browser-missing'
          setAuthorizationError(isSignedOut ? 'sign-in' : 'role')
          setError(isSignedOut
            ? 'Your session is signed out or expired. Sign in with your admin account before saving.'
            : 'Your account does not have permission to create patient records.')
          return
        }

        const apiFieldErrors = result.fieldErrors || {}
        setFieldErrors({
          ...apiFieldErrors,
          ...(apiFieldErrors.state ? { region: apiFieldErrors.state } : {}),
          ...(apiFieldErrors.address ? { streetAddress: apiFieldErrors.address } : {}),
          ...(apiFieldErrors.emergencyContact ? { emergencyContactName: apiFieldErrors.emergencyContact } : {}),
          ...(apiFieldErrors.emergencyRelationship ? { emergencyContactRelationship: apiFieldErrors.emergencyRelationship } : {}),
        })
        setError(result.error || 'Unable to save patient. Please try again.')
        return
      }

      setSavedPatientId(result.patient.patientId)
    } catch (submitError) {
      console.error('Error saving patient:', submitError)
      setError('Unable to save patient. Check your connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminPageScaffold
      title="新增病人"
      description="Enter the patient’s personal details, contact information, and emergency contact."
      backHref="/admin/patients"
    >
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[#355C46]">Personal Information</h2>
          <p className="mt-1 text-sm text-gray-500">Basic identifying information for the patient.</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelClassName}>
              First name <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.firstName)} aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, firstName: '' }))} className={inputClassName} name="firstName" autoComplete="given-name" placeholder="First name" required />
              {fieldErrors.firstName && <span id="firstName-error" className="mt-1 block text-xs text-red-700">{fieldErrors.firstName}</span>}
            </label>
            <label className={labelClassName}>
              Last name <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.lastName)} aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, lastName: '' }))} className={inputClassName} name="lastName" autoComplete="family-name" placeholder="Last name" required />
              {fieldErrors.lastName && <span id="lastName-error" className="mt-1 block text-xs text-red-700">{fieldErrors.lastName}</span>}
            </label>
            <label className={labelClassName}>
              Date of birth <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.dateOfBirth)} aria-describedby={fieldErrors.dateOfBirth ? 'dateOfBirth-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, dateOfBirth: '' }))} className={inputClassName} name="dateOfBirth" type="date" autoComplete="bday" required />
              {fieldErrors.dateOfBirth && <span id="dateOfBirth-error" className="mt-1 block text-xs text-red-700">{fieldErrors.dateOfBirth}</span>}
            </label>
            <label className={labelClassName}>
              Gender <span className="text-red-600">*</span>
              <select aria-invalid={Boolean(fieldErrors.gender)} aria-describedby={fieldErrors.gender ? 'gender-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, gender: '' }))} className={inputClassName} name="gender" defaultValue="" required>
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              {fieldErrors.gender && <span id="gender-error" className="mt-1 block text-xs text-red-700">{fieldErrors.gender}</span>}
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[#355C46]">Contact Information</h2>
          <p className="mt-1 text-sm text-gray-500">How to reach the patient.</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelClassName}>
              Phone number <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'phone-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, phone: '' }))} className={inputClassName} name="phone" type="tel" autoComplete="tel" placeholder="e.g. +1 (555) 123-4567" required />
              {fieldErrors.phone && <span id="phone-error" className="mt-1 block text-xs text-red-700">{fieldErrors.phone}</span>}
            </label>
            <label className={labelClassName}>
              Email address <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, email: '' }))} className={inputClassName} name="email" type="email" autoComplete="email" placeholder="name@example.com" required />
              {fieldErrors.email && <span id="email-error" className="mt-1 block text-xs text-red-700">{fieldErrors.email}</span>}
            </label>
            <label className={`${labelClassName} sm:col-span-2`}>
              Street address <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.streetAddress)} aria-describedby={fieldErrors.streetAddress ? 'streetAddress-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, streetAddress: '' }))} className={inputClassName} name="streetAddress" autoComplete="street-address" placeholder="Street address" required />
              {fieldErrors.streetAddress && <span id="streetAddress-error" className="mt-1 block text-xs text-red-700">{fieldErrors.streetAddress}</span>}
            </label>
            <label className={labelClassName}>
              City <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.city)} aria-describedby={fieldErrors.city ? 'city-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, city: '' }))} className={inputClassName} name="city" autoComplete="address-level2" placeholder="City" required />
              {fieldErrors.city && <span id="city-error" className="mt-1 block text-xs text-red-700">{fieldErrors.city}</span>}
            </label>
            <label className={labelClassName}>
              State / Province <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.region)} aria-describedby={fieldErrors.region ? 'region-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, region: '' }))} className={inputClassName} name="region" autoComplete="address-level1" placeholder="State or province" required />
              {fieldErrors.region && <span id="region-error" className="mt-1 block text-xs text-red-700">{fieldErrors.region}</span>}
            </label>
            <label className={labelClassName}>
              ZIP / Postal code <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.postalCode)} aria-describedby={fieldErrors.postalCode ? 'postalCode-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, postalCode: '' }))} className={inputClassName} name="postalCode" autoComplete="postal-code" placeholder="ZIP or postal code" required />
              {fieldErrors.postalCode && <span id="postalCode-error" className="mt-1 block text-xs text-red-700">{fieldErrors.postalCode}</span>}
            </label>
            <label className={labelClassName}>
              Country <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.country)} aria-describedby={fieldErrors.country ? 'country-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, country: '' }))} className={inputClassName} name="country" autoComplete="country-name" placeholder="Country" required />
              {fieldErrors.country && <span id="country-error" className="mt-1 block text-xs text-red-700">{fieldErrors.country}</span>}
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[#355C46]">Emergency Contact</h2>
          <p className="mt-1 text-sm text-gray-500">A person to contact in case of an emergency.</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelClassName}>
              Contact name <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.emergencyContactName)} aria-describedby={fieldErrors.emergencyContactName ? 'emergencyContactName-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, emergencyContactName: '' }))} className={inputClassName} name="emergencyContactName" autoComplete="off" placeholder="Full name" required />
              {fieldErrors.emergencyContactName && <span id="emergencyContactName-error" className="mt-1 block text-xs text-red-700">{fieldErrors.emergencyContactName}</span>}
            </label>
            <label className={labelClassName}>
              Relationship <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.emergencyContactRelationship)} aria-describedby={fieldErrors.emergencyContactRelationship ? 'emergencyContactRelationship-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, emergencyContactRelationship: '' }))} className={inputClassName} name="emergencyContactRelationship" placeholder="e.g. Spouse, parent" required />
              {fieldErrors.emergencyContactRelationship && <span id="emergencyContactRelationship-error" className="mt-1 block text-xs text-red-700">{fieldErrors.emergencyContactRelationship}</span>}
            </label>
            <label className={labelClassName}>
              Phone number <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.emergencyContactPhone)} aria-describedby={fieldErrors.emergencyContactPhone ? 'emergencyContactPhone-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, emergencyContactPhone: '' }))} className={inputClassName} name="emergencyContactPhone" type="tel" autoComplete="off" placeholder="e.g. +1 (555) 123-4567" required />
              {fieldErrors.emergencyContactPhone && <span id="emergencyContactPhone-error" className="mt-1 block text-xs text-red-700">{fieldErrors.emergencyContactPhone}</span>}
            </label>
            <label className={labelClassName}>
              Email address <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.emergencyContactEmail)} aria-describedby={fieldErrors.emergencyContactEmail ? 'emergencyContactEmail-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, emergencyContactEmail: '' }))} className={inputClassName} name="emergencyContactEmail" type="email" autoComplete="off" placeholder="name@example.com" required />
              {fieldErrors.emergencyContactEmail && <span id="emergencyContactEmail-error" className="mt-1 block text-xs text-red-700">{fieldErrors.emergencyContactEmail}</span>}
            </label>
          </div>
        </section>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <p>{error}</p>
            {authorizationError === 'sign-in' && (
              <Link
                href={`/sign-in?redirect_url=${encodeURIComponent('/admin/patients/new')}`}
                className="mt-2 inline-block font-semibold underline"
              >
                Sign in and return to Add Patient
              </Link>
            )}
            {authorizationError === 'role' && (
              <p className="mt-2">Ask an administrator to grant your account an admin, clinic staff, or provider role.</p>
            )}
          </div>
        )}
        {savedPatientId && (
          <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
            Patient saved successfully. Patient ID: {savedPatientId}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/admin/patients" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving || Boolean(savedPatientId)} className="rounded-md bg-[#355C46] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#294936] disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? 'Saving…' : savedPatientId ? 'Patient Saved' : 'Save Patient'}
          </button>
        </div>
      </form>
    </AdminPageScaffold>
  )
}
