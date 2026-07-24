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
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
]

type FormData = {
  firstName: string
  middleName: string
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
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const observedHoliday = (date: Date) => {
  const observed = new Date(date)
  if (date.getDay() === 6) {
    observed.setDate(date.getDate() - 1)
  } else if (date.getDay() === 0) {
    observed.setDate(date.getDate() + 1)
  }
  return observed
}

const nthWeekdayOfMonth = (
  year: number,
  month: number,
  weekday: number,
  nth: number
) => {
  const firstDay = new Date(year, month, 1)
  const firstWeekdayOffset = (7 + weekday - firstDay.getDay()) % 7
  return new Date(year, month, 1 + firstWeekdayOffset + (nth - 1) * 7)
}

const lastWeekdayOfMonth = (year: number, month: number, weekday: number) => {
  const lastDay = new Date(year, month + 1, 0)
  const diff = (7 + lastDay.getDay() - weekday) % 7
  return new Date(year, month, lastDay.getDate() - diff)
}

const getUsHolidays = (year: number) => {
  const holidays = [
    observedHoliday(new Date(year, 0, 1)),
    nthWeekdayOfMonth(year, 0, 1, 3),
    nthWeekdayOfMonth(year, 1, 1, 3),
    lastWeekdayOfMonth(year, 4, 1),
    observedHoliday(new Date(year, 5, 19)),
    observedHoliday(new Date(year, 6, 4)),
    nthWeekdayOfMonth(year, 8, 1, 1),
    nthWeekdayOfMonth(year, 9, 1, 2),
    observedHoliday(new Date(year, 10, 11)),
    nthWeekdayOfMonth(year, 10, 4, 4),
    observedHoliday(new Date(year, 11, 25)),
  ]

  return new Set(holidays.map(toDateString))
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

  return !getUsHolidays(date.getFullYear()).has(dateValue)
}

export default function AppointmentForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
    service: services[0],
    date: '',
    doctor: doctors[0],
    time: timeSlots[0].value,
    message: '',
  })

  // Get minimum date (today)
  const today = toDateString(new Date())

  const validateForm = (data: FormData) => {
    const nextErrors: FormErrors = {}

    if (!data.firstName.trim()) {
      nextErrors.firstName = 'First Name 為必填'
    }

    if (!data.lastName.trim()) {
      nextErrors.lastName = 'Last Name 為必填'
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

    if (!isBusinessDate(data.date, today)) {
      nextErrors.date = '僅可選平日且不可為美國假日'
    }

    if (!doctors.includes(data.doctor)) {
      nextErrors.doctor = '請選擇醫生'
    }

    if (!timeSlots.some((slot) => slot.value === data.time)) {
      nextErrors.time = '請選擇 9:00 AM 至 5:00 PM 時段'
    }

    return nextErrors
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
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
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setErrors({})
        setSubmitted(true)
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          phone: '',
          email: '',
          service: services[0],
          date: '',
          doctor: doctors[0],
          time: timeSlots[0].value,
          message: '',
        })

        // Reset message after 5 seconds
        setTimeout(() => {
          setSubmitted(false)
        }, 5000)
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

  return (
    <section id="appointment" className="py-20 md:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-tcm-green font-medium text-sm tracking-widest uppercase">
            預約服務
          </span>
          <h2 className="section-title mt-4">
            立即預約您的診療
          </h2>
          <p className="section-subtitle">
            請填寫以下資訊，我們會儘快與您聯繫確認預約時間
          </p>
        </div>

        <div className="bg-gradient-to-br from-white via-tcm-beige/10 to-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✓ 感謝您的預約！我們會在24小時內與您聯繫。
              </p>
            </div>
          )}

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                  placeholder="First Name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="middleName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Middle Name
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                  placeholder="Middle Name"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                  placeholder="Last Name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Phone and Email */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  手機號碼（10碼） <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                  placeholder="0912345678"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email（選填）
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Service, Doctor and Time */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="service"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  診療項目 <span className="text-red-500">*</span>
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                >
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
                {errors.service && (
                  <p className="mt-1 text-sm text-red-600">{errors.service}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="doctor"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  醫生 <span className="text-red-500">*</span>
                </label>
                <select
                  id="doctor"
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                >
                  {doctors.map((doctor) => (
                    <option key={doctor} value={doctor}>
                      {doctor}
                    </option>
                  ))}
                </select>
                {errors.doctor && (
                  <p className="mt-1 text-sm text-red-600">{errors.doctor}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  時間 <span className="text-red-500">*</span>
                </label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  預約日期（僅平日，排除美國假日） <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={today}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                補充症狀與需求（選填）
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition resize-none"
                placeholder="請告訴我們任何關於您的健康狀況或特殊需求..."
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? '處理中...' : '確認預約'}
            </button>

            {/* Note */}
            <p className="text-sm text-gray-500 text-center">
              提交後，我們將在24小時內透過您提供的聯絡方式與您確認預約。
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
