'use client'

import { chineseText } from '@/lib/chinese'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import AdminPageScaffold from '@/components/AdminPageScaffold'

const inputClassName = 'mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#355C46] focus:ring-2 focus:ring-[#355C46]/15'
const labelClassName = 'block text-sm font-medium text-gray-700'

const fields = [
  ['firstName', '名字', 'text'],
  ['lastName', '姓氏', 'text'],
  ['dateOfBirth', '出生日期', 'date'],
  ['gender', '性別', 'text'],
  ['phone', '電話號碼', 'tel'],
  ['email', '電子郵件地址', 'email'],
  ['address', '街道地址', 'text'],
  ['city', '城市', 'text'],
  ['state', '州／省', 'text'],
  ['postalCode', '郵遞區號', 'text'],
  ['country', '國家', 'text'],
  ['emergencyContact', '緊急聯絡人姓名', 'text'],
  ['emergencyRelationship', '與緊急聯絡人的關係', 'text'],
  ['emergencyContactPhone', '緊急聯絡人電話', 'tel'],
  ['emergencyContactEmail', '緊急聯絡人電子郵件', 'email'],
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
          if (isCurrent) setError(result.error || '無法載入病人資料。')
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
        if (isCurrent) setError('無法載入病人資料，請檢查網路連線後重試。')
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
      if (!patient[field].trim()) nextFieldErrors[field] = `請填寫${label}。`
    }

    for (const field of ['phone', 'emergencyContactPhone'] as const) {
      const value = patient[field].trim()
      const digits = value.replace(/\D/g, '')
      if (value && (!/^[+\d\s().-]+$/.test(value) || digits.length < 7 || digits.length > 15)) {
        nextFieldErrors[field] = '請輸入有效的電話號碼（7 至 15 位數字）。'
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
        setError(result.error || '無法更新病人資料，請再試一次。')
        return
      }

      setSaved(true)
    } catch (saveError) {
      console.error('Error updating patient:', saveError)
      setError('無法更新病人資料，請檢查網路連線後重試。')
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
      title="修改病人資料"
      description={patientId ? `Update the information for patient ${patientId}.` : '更新病人的基本資料。'}
      backHref={`/admin/patients/${id}`}
      backLabel="返回病人資料"
    >
      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm" role="status">
          正在載入病人資料…
        </div>
      ) : error && !patientId ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700" role="alert">
          <p>{chineseText(error)}</p>
          {error === '沒有操作權限' && (
            <Link href={`/sign-in?redirect_url=${encodeURIComponent(`/admin/patients/${id}/edit`)}`} className="mt-2 inline-block font-semibold underline">
              登入並返回修改病人頁面
            </Link>
          )}
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-[#355C46]">個人資料</h2>
            <p className="mt-1 text-sm text-gray-500">病人的基本身分資料。</p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderFields(['firstName', 'lastName', 'dateOfBirth', 'gender'])}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-[#355C46]">聯絡資料</h2>
            <p className="mt-1 text-sm text-gray-500">病人的聯絡方式及地址。</p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderFields(['phone', 'email', 'address', 'city', 'state', 'postalCode', 'country'])}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-[#355C46]">緊急聯絡人</h2>
            <p className="mt-1 text-sm text-gray-500">發生緊急狀況時的聯絡人。</p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderFields(['emergencyContact', 'emergencyRelationship', 'emergencyContactPhone', 'emergencyContactEmail'])}
            </div>
          </section>

          {saved && (
            <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
              病人資料變更已儲存。
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href={`/admin/patients/${id}`} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              取消
            </Link>
            <button type="submit" disabled={isSaving || isLoading} className="rounded-md bg-[#355C46] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#294936] disabled:cursor-not-allowed disabled:opacity-60">
              {isSaving ? '儲存中…' : '儲存變更'}
            </button>
          </div>
        </form>
      )}
    </AdminPageScaffold>
  )
}
