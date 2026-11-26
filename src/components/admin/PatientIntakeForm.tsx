'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { chineseText } from '@/lib/chinese'
import { fieldIsVisible, intakeSteps, validateIntakeStep } from '@/lib/ehr/patientIntakeForm'

const inputClassName = 'mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#355C46] focus:ring-2 focus:ring-[#355C46]/15'

export default function PatientIntakeForm({ variant = 'admin' }: { variant?: 'admin' | 'ehr' }) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [authorizationError, setAuthorizationError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState<{ id: string; patientId: string } | null>(null)
  const keys = useRef(new Map<string, string>())
  const saving = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const focusError = useRef(false)
  const today = new Date().toLocaleDateString('en-CA')
  useEffect(() => { heading.current?.focus() }, [step])
  useEffect(() => {
    if (focusError.current) {
      form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      focusError.current = false
    }
  }, [errors, step])

  function showErrors(nextErrors: Record<string, string>) {
    focusError.current = true
    setErrors(nextErrors)
    setError('Please correct the highlighted fields before continuing.')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving.current || saved) return
    setError('')
    setAuthorizationError(false)
    const nextErrors = validateIntakeStep(step, values, today)
    if (Object.keys(nextErrors).length) { showErrors(nextErrors); return }
    if (step < intakeSteps.length - 1) { setErrors({}); setStep(step + 1); return }
    for (let index = 0; index < intakeSteps.length; index++) {
      const stepErrors = validateIntakeStep(index, values, today)
      if (Object.keys(stepErrors).length) { setStep(index); showErrors(stepErrors); return }
    }
    saving.current = true
    setBusy(true)
    // Omit conditional fields that no longer apply, including previous insurance details.
    const answers = Object.fromEntries(intakeSteps.flatMap(section => section.fields)
      .filter(field => fieldIsVisible(field, values)).map(field => [field.name, (values[field.name] || '').trim()]))
    const profileNames = intakeSteps.slice(0, 3).flatMap(section => section.fields.map(field => field.name))
    const payload = { ...Object.fromEntries(profileNames.map(name => [name, answers[name]])), requireCompleteProfile: true, intake: answers }
    try {
      const body = JSON.stringify(payload)
      const key = keys.current.get(body) || crypto.randomUUID()
      keys.current.set(body, key)
      const response = await fetch('/api/ehr/patients', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body })
      const result = await response.json()
      if (!response.ok) {
        const apiErrors = result.fieldErrors || {}
        const firstStep = intakeSteps.findIndex(section => section.fields.some(field => apiErrors[field.name]))
        if (firstStep >= 0) { setStep(firstStep); showErrors(apiErrors) }
        setAuthorizationError(response.status === 403)
        setError(result.error || 'Unable to save patient. Please try again.')
        return
      }
      setSaved(result.patient)
    } catch {
      setError('Unable to save patient. Check your connection and retry. Your entries are still available.')
    } finally { saving.current = false; setBusy(false) }
  }

  const current = intakeSteps[step]
  const primary = variant === 'ehr' ? 'ehr-button' : 'rounded-md bg-[#355C46] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#294936]'
  const secondary = variant === 'ehr' ? 'ehr-button ehr-button-light' : 'rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50'
  const basePath = variant === 'ehr' ? '/ehr/patients' : '/admin/patients'
  if (saved) return <section className="rounded-lg border border-green-200 bg-green-50 p-6" role="status"><h2 className="text-lg font-semibold text-[#355C46]">Patient intake saved</h2><p className="my-3 text-sm">Patient record: {saved.patientId}. All nine sections have been saved.</p><Link className={secondary} href={`${basePath}/${encodeURIComponent(saved.id)}`}>View Patient</Link></section>

  return <form ref={form} onSubmit={submit} noValidate className="space-y-6">
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[#355C46]" aria-live="polite">Step {step + 1} of {intakeSteps.length}: {current.title}</p>
      <div role="progressbar" aria-label="Patient intake progress" aria-valuemin={1} aria-valuemax={9} aria-valuenow={step + 1} className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#355C46] transition-all" style={{ width: `${((step + 1) / 9) * 100}%` }} /></div>
      <p className="mt-3 text-sm text-gray-500">Required fields are marked *. Entries are kept while moving between steps and saved when you select Save Patient.</p>
    </div>
    <section aria-labelledby="intake-step-title" className={variant === 'ehr' ? 'ehr-form-section' : 'rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6'}>
      <h2 id="intake-step-title" ref={heading} tabIndex={-1} className="text-lg font-semibold text-[#355C46] outline-none">{current.title}</h2>
      <p className="mt-1 text-sm leading-6 text-gray-500">{current.description}</p>
      <fieldset disabled={busy} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <legend className="sr-only">{current.title}</legend>
        {current.fields.filter(field => fieldIsVisible(field, values)).map(field => {
          const id = `intake-${field.name}`
          const props = { id, name: field.name, required: field.required, 'aria-invalid': Boolean(errors[field.name]), 'aria-describedby': errors[field.name] ? `${id}-error` : undefined, className: inputClassName }
          return <div key={field.name} className={field.type === 'checkbox' ? 'md:col-span-2' : 'min-w-0'}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{field.label}{field.required && <span className="text-red-600"> *</span>}</label>
            {field.type === 'select' ? <select {...props} value={values[field.name] || ''} onChange={event => setValues(previous => ({ ...previous, [field.name]: event.target.value }))}><option value="">Select an option</option>{field.options?.map(option => <option key={option}>{option}</option>)}</select>
              : field.type === 'textarea' ? <textarea {...props} rows={4} maxLength={field.maxLength || 2000} value={values[field.name] || ''} onChange={event => setValues(previous => ({ ...previous, [field.name]: event.target.value }))} />
              : field.type === 'checkbox' ? <input {...props} className="mt-2 h-5 w-5 accent-[#355C46]" type="checkbox" checked={values[field.name] === 'true'} onChange={event => setValues(previous => ({ ...previous, [field.name]: event.target.checked ? 'true' : '' }))} />
              : <input {...props} type={field.type || 'text'} max={field.type === 'date' ? today : undefined} maxLength={field.maxLength || 2000} autoComplete={field.autoComplete || 'off'} value={values[field.name] || ''} onChange={event => setValues(previous => ({ ...previous, [field.name]: event.target.value }))} />}
            {errors[field.name] && <p id={`${id}-error`} className="mt-1 text-sm text-red-700">{errors[field.name]}</p>}
          </div>
        })}
      </fieldset>
    </section>
    {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><p>{chineseText(error)}</p>{authorizationError && <p className="mt-2">Saving requires an authorized clinic account. <Link className="underline" href={`/sign-in?redirect_url=${encodeURIComponent(`${basePath}/new`)}`}>Sign in</Link> or contact your administrator if your account lacks access.</p>}</div>}
    <div className="flex items-center justify-between gap-3">
      <button type="button" className={`${secondary} disabled:cursor-not-allowed disabled:opacity-50`} disabled={step === 0 || busy} onClick={() => { setStep(step - 1); setErrors({}); setError('') }}>Back</button>
      <button type="submit" className={`${primary} disabled:cursor-not-allowed disabled:opacity-60`} disabled={busy}>{busy ? 'Saving…' : step === 8 ? 'Save Patient' : 'Next'}</button>
    </div>
  </form>
}
