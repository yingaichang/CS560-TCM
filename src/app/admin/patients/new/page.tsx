'use client'

import { chineseText } from '@/lib/chinese'

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
      ['firstName', '名字'],
      ['lastName', '姓氏'],
      ['dateOfBirth', '出生日期'],
      ['gender', '性別'],
      ['phone', '電話號碼'],
      ['email', '電子郵件地址'],
      ['streetAddress', '街道地址'],
      ['city', '城市'],
      ['region', '州／省'],
      ['postalCode', '郵遞區號'],
      ['country', '國家'],
      ['emergencyContactName', '緊急聯絡人姓名'],
      ['emergencyContactRelationship', '與緊急聯絡人的關係'],
      ['emergencyContactPhone', '緊急聯絡人電話'],
      ['emergencyContactEmail', '緊急聯絡人電子郵件'],
    ] as const

    for (const [field, label] of requiredFields) {
      if (!value(field)) nextFieldErrors[field] = `請填寫${label}。`
    }
    for (const field of ['phone', 'emergencyContactPhone']) {
      const phone = value(field)
      if (phone && !phoneNumberIsValid(phone)) {
        nextFieldErrors[field] = '請輸入有效的電話號碼（7 至 15 位數字）。'
      }
    }
    const dateOfBirth = value('dateOfBirth')
    if (dateOfBirth && Number.isNaN(Date.parse(`${dateOfBirth}T00:00:00`))) {
      nextFieldErrors.dateOfBirth = '請輸入有效的出生日期。'
    }
    for (const field of ['email', 'emergencyContactEmail']) {
      const email = value(field)
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextFieldErrors[field] = '請輸入有效的電子郵件地址。'
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
            ? '您已登出或登入已逾期，請先登入管理員帳號再儲存。'
            : '您的帳號沒有新增病人資料的權限。')
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
        setError(result.error || '無法儲存病人資料，請再試一次。')
        return
      }

      setSavedPatientId(result.patient.patientId)
    } catch (submitError) {
      console.error('Error saving patient:', submitError)
      setError('無法儲存病人資料，請檢查網路連線後重試。')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminPageScaffold
      title="新增病人"
      description="請填寫病人的個人資料、聯絡方式及緊急聯絡人。"
      backHref="/admin/patients"
    >
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[#355C46]">個人資料</h2>
          <p className="mt-1 text-sm text-gray-500">病人的基本身分資料。</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelClassName}>
              名字 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.firstName)} aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, firstName: '' }))} className={inputClassName} name="firstName" autoComplete="given-name" placeholder="名字" required />
              {fieldErrors.firstName && <span id="firstName-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.firstName)}</span>}
            </label>
            <label className={labelClassName}>
              姓氏 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.lastName)} aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, lastName: '' }))} className={inputClassName} name="lastName" autoComplete="family-name" placeholder="姓氏" required />
              {fieldErrors.lastName && <span id="lastName-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.lastName)}</span>}
            </label>
            <label className={labelClassName}>
              出生日期 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.dateOfBirth)} aria-describedby={fieldErrors.dateOfBirth ? 'dateOfBirth-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, dateOfBirth: '' }))} className={inputClassName} name="dateOfBirth" type="date" autoComplete="bday" required />
              {fieldErrors.dateOfBirth && <span id="dateOfBirth-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.dateOfBirth)}</span>}
            </label>
            <label className={labelClassName}>
              性別 <span className="text-red-600">*</span>
              <select aria-invalid={Boolean(fieldErrors.gender)} aria-describedby={fieldErrors.gender ? 'gender-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, gender: '' }))} className={inputClassName} name="gender" defaultValue="" required>
                <option value="">請選擇性別</option>
                <option value="female">女性</option>
                <option value="male">男性</option>
                <option value="other">其他</option>
                <option value="prefer-not-to-say">不願透露</option>
              </select>
              {fieldErrors.gender && <span id="gender-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.gender)}</span>}
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[#355C46]">聯絡資料</h2>
          <p className="mt-1 text-sm text-gray-500">病人的聯絡方式。</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelClassName}>
              電話號碼 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? 'phone-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, phone: '' }))} className={inputClassName} name="phone" type="tel" autoComplete="tel" placeholder="e.g. +1 (555) 123-4567" required />
              {fieldErrors.phone && <span id="phone-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.phone)}</span>}
            </label>
            <label className={labelClassName}>
              電子郵件地址 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, email: '' }))} className={inputClassName} name="email" type="email" autoComplete="email" placeholder="name@example.com" required />
              {fieldErrors.email && <span id="email-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.email)}</span>}
            </label>
            <label className={`${labelClassName} sm:col-span-2`}>
              街道地址 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.streetAddress)} aria-describedby={fieldErrors.streetAddress ? 'streetAddress-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, streetAddress: '' }))} className={inputClassName} name="streetAddress" autoComplete="street-address" placeholder="街道地址" required />
              {fieldErrors.streetAddress && <span id="streetAddress-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.streetAddress)}</span>}
            </label>
            <label className={labelClassName}>
              城市 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.city)} aria-describedby={fieldErrors.city ? 'city-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, city: '' }))} className={inputClassName} name="city" autoComplete="address-level2" placeholder="城市" required />
              {fieldErrors.city && <span id="city-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.city)}</span>}
            </label>
            <label className={labelClassName}>
              州／省 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.region)} aria-describedby={fieldErrors.region ? 'region-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, region: '' }))} className={inputClassName} name="region" autoComplete="address-level1" placeholder="州或省" required />
              {fieldErrors.region && <span id="region-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.region)}</span>}
            </label>
            <label className={labelClassName}>
              郵遞區號 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.postalCode)} aria-describedby={fieldErrors.postalCode ? 'postalCode-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, postalCode: '' }))} className={inputClassName} name="postalCode" autoComplete="postal-code" placeholder="郵遞區號" required />
              {fieldErrors.postalCode && <span id="postalCode-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.postalCode)}</span>}
            </label>
            <label className={labelClassName}>
              國家 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.country)} aria-describedby={fieldErrors.country ? 'country-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, country: '' }))} className={inputClassName} name="country" autoComplete="country-name" placeholder="國家" required />
              {fieldErrors.country && <span id="country-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.country)}</span>}
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[#355C46]">緊急聯絡人</h2>
          <p className="mt-1 text-sm text-gray-500">發生緊急狀況時的聯絡人。</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelClassName}>
              聯絡人姓名 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.emergencyContactName)} aria-describedby={fieldErrors.emergencyContactName ? 'emergencyContactName-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, emergencyContactName: '' }))} className={inputClassName} name="emergencyContactName" autoComplete="off" placeholder="完整姓名" required />
              {fieldErrors.emergencyContactName && <span id="emergencyContactName-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.emergencyContactName)}</span>}
            </label>
            <label className={labelClassName}>
              關係 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.emergencyContactRelationship)} aria-describedby={fieldErrors.emergencyContactRelationship ? 'emergencyContactRelationship-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, emergencyContactRelationship: '' }))} className={inputClassName} name="emergencyContactRelationship" placeholder="例如：配偶、父母" required />
              {fieldErrors.emergencyContactRelationship && <span id="emergencyContactRelationship-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.emergencyContactRelationship)}</span>}
            </label>
            <label className={labelClassName}>
              電話號碼 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.emergencyContactPhone)} aria-describedby={fieldErrors.emergencyContactPhone ? 'emergencyContactPhone-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, emergencyContactPhone: '' }))} className={inputClassName} name="emergencyContactPhone" type="tel" autoComplete="off" placeholder="e.g. +1 (555) 123-4567" required />
              {fieldErrors.emergencyContactPhone && <span id="emergencyContactPhone-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.emergencyContactPhone)}</span>}
            </label>
            <label className={labelClassName}>
              電子郵件地址 <span className="text-red-600">*</span>
              <input aria-invalid={Boolean(fieldErrors.emergencyContactEmail)} aria-describedby={fieldErrors.emergencyContactEmail ? 'emergencyContactEmail-error' : undefined} onChange={() => setFieldErrors((current) => ({ ...current, emergencyContactEmail: '' }))} className={inputClassName} name="emergencyContactEmail" type="email" autoComplete="off" placeholder="name@example.com" required />
              {fieldErrors.emergencyContactEmail && <span id="emergencyContactEmail-error" className="mt-1 block text-xs text-red-700">{chineseText(fieldErrors.emergencyContactEmail)}</span>}
            </label>
          </div>
        </section>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <p>{chineseText(error)}</p>
            {authorizationError === 'sign-in' && (
              <Link
                href={`/sign-in?redirect_url=${encodeURIComponent('/admin/patients/new')}`}
                className="mt-2 inline-block font-semibold underline"
              >
                登入並返回新增病人頁面
              </Link>
            )}
            {authorizationError === 'role' && (
              <p className="mt-2">請聯絡管理員，為您的帳號授予管理員、診所人員或醫療人員權限。</p>
            )}
          </div>
        )}
        {savedPatientId && (
          <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
            病人資料已儲存。病歷編號： {savedPatientId}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/admin/patients" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            取消
          </Link>
          <button type="submit" disabled={isSaving || Boolean(savedPatientId)} className="rounded-md bg-[#355C46] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#294936] disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? '儲存中…' : savedPatientId ? '已儲存病人資料' : '儲存病人資料'}
          </button>
        </div>
      </form>
    </AdminPageScaffold>
  )
}
