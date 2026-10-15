'use client'

import { FormEvent, useState } from 'react'

const services = [
  '中醫內科調理',
  '婦科調理',
  '骨傷科',
  '針灸',
  '推拿',
  '拔罐',
  '艾灸',
]

const doctors = [
  '李明智醫師',
  '王芳妤醫師',
  '張瑋翔醫師',
  '陳雅琪醫師',
]

const timeSlots = [
  { value: '09:30', label: '9:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:30', label: '3:30 PM' },
]

type FormData = {
  visitType: '初診' | '複診'
  firstName: string
  lastName: string
  phone: string
  email: string
  service: string
  date: string
  doctor: string
  time: string
  message: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

const toDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isBusinessDate = (dateValue: string, minDate: string) => {
  if (!dateValue || dateValue < minDate) {
    return false
  }

  const date = new Date(`${dateValue}T12:00:00`)
  const day = date.getDay()
  if (day === 0 || day === 6) {
    return false
  }

  return true
}

type QuickAppointmentDialogProps = {
  isOpen: boolean
  onClose: () => void
}

export default function QuickAppointmentDialog({ isOpen, onClose }: QuickAppointmentDialogProps) {
  const [step, setStep] = useState<'select' | 'form' | 'success'>('select')
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<FormData>({
    visitType: '初診',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    service: services[0],
    date: '',
    doctor: doctors[0],
    time: timeSlots[0].value,
    message: '',
  })

  const today = toDateString(new Date())
  const minDate = today

  const handleVisitTypeSelect = (type: '初診' | '複診') => {
    setFormData((prev) => ({ ...prev, visitType: type }))
    setStep('form')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const nextValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }))

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const validateForm = (data: FormData) => {
    const nextErrors: FormErrors = {}

    if (!data.firstName.trim()) {
      nextErrors.firstName = '請輸入姓名'
    }

    if (!data.lastName.trim()) {
      nextErrors.lastName = '請輸入姓氏'
    }

    if (!/^\d{10}$/.test(data.phone)) {
      nextErrors.phone = '手機號碼需為 10 碼數字'
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      nextErrors.email = '請輸入有效 Email'
    }

    if (!services.includes(data.service)) {
      nextErrors.service = '請選擇診療項目'
    }

    if (!isBusinessDate(data.date, minDate)) {
      nextErrors.date = '請選擇有效的工作日'
    }

    if (!doctors.includes(data.doctor)) {
      nextErrors.doctor = '請選擇醫生'
    }

    if (!timeSlots.some((slot) => slot.value === data.time)) {
      nextErrors.time = '請選擇時段'
    }

    return nextErrors
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError('')

    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          service: formData.service,
          doctor: formData.doctor,
          date: formData.date,
          time: formData.time,
          message: `${formData.visitType}\n${formData.message}`,
        }),
      })

      if (response.ok) {
        setStep('success')
        setTimeout(() => {
          onClose()
          setStep('select')
          setFormData({
            visitType: '初診',
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            service: services[0],
            date: '',
            doctor: doctors[0],
            time: timeSlots[0].value,
            message: '',
          })
        }, 2000)
      } else {
        const data = await response.json()
        setSubmitError(data.error || '提交失敗，請稍後重試。')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError('提交失敗，請稍後重試。')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div className="my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:my-0">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-tcm-dark">立即預約</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600 leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 overflow-y-auto p-6">
          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-6">請選擇您的預約類型</p>
              <button
                onClick={() => handleVisitTypeSelect('初診')}
                className="w-full px-4 py-3 rounded-2xl border-2 border-tcm-green text-tcm-green font-semibold hover:bg-tcm-green hover:text-white transition"
              >
                ☑ 初診
              </button>
              <button
                onClick={() => handleVisitTypeSelect('複診')}
                className="w-full px-4 py-3 rounded-2xl border-2 border-tcm-green text-tcm-green font-semibold hover:bg-tcm-green hover:text-white transition"
              >
                ☑ 複診
              </button>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4 p-3 rounded-lg bg-tcm-beige/30">
                <p className="text-sm text-tcm-dark font-semibold">預約類型: {formData.visitType}</p>
              </div>

              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">姓名 *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="姓"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-tcm-green focus:border-transparent"
                  />
                  {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">名 *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="名"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-tcm-green focus:border-transparent"
                  />
                  {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">手機號碼 *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912345678"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-tcm-green focus:border-transparent"
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email (選填)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-tcm-green focus:border-transparent"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              {/* Service */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">診療項目 *</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-tcm-green focus:border-transparent"
                >
                  {services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.service && <p className="text-xs text-red-600 mt-1">{errors.service}</p>}
              </div>

              {/* Doctor & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">醫生 *</label>
                  <select
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-tcm-green focus:border-transparent"
                  >
                    {doctors.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.doctor && <p className="text-xs text-red-600 mt-1">{errors.doctor}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">日期 *</label>
                  <input
                    type="date"
                    name="date"
                    min={minDate}
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-tcm-green focus:border-transparent"
                  />
                  {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">時段 *</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-tcm-green focus:border-transparent"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                {errors.time && <p className="text-xs text-red-600 mt-1">{errors.time}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">備註 (選填)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="請簡述您的主要需求..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-tcm-green focus:border-transparent resize-none"
                />
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  返回
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-tcm-green text-white font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
                >
                  {isLoading ? '提交中...' : '送出'}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✓</div>
              <p className="text-lg font-semibold text-tcm-green mb-2">預約成功！</p>
              <p className="text-sm text-gray-600">資料已送出，我們會儘快與您聯繫確認。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
