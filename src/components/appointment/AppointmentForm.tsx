'use client'

import { useMemo, useState } from 'react'

const appointmentSteps = [
  '選擇服務',
  '選擇醫師',
  '選擇日期',
  '選擇時間',
  '填寫資料',
  '健康問卷',
  '確認預約',
] as const

type AppointmentFormData = {
  service: string
  doctor: string
  date: string
  time: string
  firstName: string
  lastName: string
  phone: string
  email: string
  questionnaire: string
}

type AppointmentFormProps = {
  currentStep: number
  onNextStep: () => void
  onPreviousStep: () => void
}

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
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
] as const

const fieldLabel = {
  service: '診療項目',
  doctor: '醫師',
  date: '日期',
  time: '時間',
  firstName: '姓名',
  lastName: '姓氏',
  phone: '手機',
  email: 'Email',
  questionnaire: '健康問卷',
}

const getMinDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = getMinDate()

const isValidDate = (value: string) => {
  if (!value || value < today) return false
  const date = new Date(`${value}T12:00:00`)
  const day = date.getDay()
  return day !== 0 && day !== 6
}

export default function AppointmentForm({ currentStep, onNextStep, onPreviousStep }: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    service: services[0],
    doctor: doctors[0],
    date: '',
    time: timeSlots[0],
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    questionnaire: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof AppointmentFormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentStepLabel = appointmentSteps[currentStep - 1]

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid gap-6">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.service}</span>
              <select
                name="service"
                value={formData.service}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, service: event.currentTarget.value }))
                  setErrors((prev) => ({ ...prev, service: undefined }))
                }}
                className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
              >
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              {errors.service && <p className="text-sm text-[#B22E20]">{errors.service}</p>}
            </label>
          </div>
        )
      case 2:
        return (
          <div className="grid gap-6">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.doctor}</span>
              <select
                name="doctor"
                value={formData.doctor}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, doctor: event.currentTarget.value }))
                  setErrors((prev) => ({ ...prev, doctor: undefined }))
                }}
                className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
              >
                {doctors.map((doctor) => (
                  <option key={doctor} value={doctor}>
                    {doctor}
                  </option>
                ))}
              </select>
              {errors.doctor && <p className="text-sm text-[#B22E20]">{errors.doctor}</p>}
            </label>
          </div>
        )
      case 3:
        return (
          <div className="grid gap-6">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.date}</span>
              <input
                type="date"
                name="date"
                min={today}
                value={formData.date}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, date: event.currentTarget.value }))
                  setErrors((prev) => ({ ...prev, date: undefined }))
                }}
                className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
              />
              {errors.date && <p className="text-sm text-[#B22E20]">{errors.date}</p>}
            </label>
          </div>
        )
      case 4:
        return (
          <div className="grid gap-6">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.time}</span>
              <select
                name="time"
                value={formData.time}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, time: event.currentTarget.value }))
                  setErrors((prev) => ({ ...prev, time: undefined }))
                }}
                className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.time && <p className="text-sm text-[#B22E20]">{errors.time}</p>}
            </label>
          </div>
        )
      case 5:
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.firstName}</span>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, firstName: event.currentTarget.value }))
                  setErrors((prev) => ({ ...prev, firstName: undefined }))
                }}
                className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
                placeholder="例：王小明"
              />
              {errors.firstName && <p className="text-sm text-[#B22E20]">{errors.firstName}</p>}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.lastName}</span>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, lastName: event.currentTarget.value }))
                  setErrors((prev) => ({ ...prev, lastName: undefined }))
                }}
                className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
                placeholder="例：陳"
              />
              {errors.lastName && <p className="text-sm text-[#B22E20]">{errors.lastName}</p>}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.phone}</span>
              <input
                type="tel"
                inputMode="numeric"
                name="phone"
                value={formData.phone}
                onChange={(event) => {
                  const value = event.currentTarget.value.replace(/\D/g, '').slice(0, 10)
                  setFormData((prev) => ({ ...prev, phone: value }))
                  setErrors((prev) => ({ ...prev, phone: undefined }))
                }}
                className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
                placeholder="0912345678"
              />
              {errors.phone && <p className="text-sm text-[#B22E20]">{errors.phone}</p>}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.email}</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, email: event.currentTarget.value }))
                  setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
                placeholder="example@mail.com"
              />
              {errors.email && <p className="text-sm text-[#B22E20]">{errors.email}</p>}
            </label>
          </div>
        )
      case 6:
        return (
          <div className="grid gap-6">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.questionnaire}</span>
              <textarea
                name="questionnaire"
                value={formData.questionnaire}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, questionnaire: event.currentTarget.value }))
                }}
                className="min-h-[180px] w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30 resize-none"
                placeholder="請簡述您的症狀、既往病史或特別注意事項..."
              />
            </label>
          </div>
        )
      case 7:
        return (
          <div className="space-y-4 rounded-[28px] border border-[#D9D5CC] bg-[#FAF8F2] p-6 text-[#343A36] shadow-sm">
            <div className="grid gap-3">
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-sm text-[#6F8A72]">診療項目</p>
                <p className="mt-2 font-semibold text-[#343A36]">{formData.service}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-sm text-[#6F8A72]">醫師</p>
                <p className="mt-2 font-semibold text-[#343A36]">{formData.doctor}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-[#6F8A72]">預約日期</p>
                  <p className="mt-2 font-semibold text-[#343A36]">{formData.date || '尚未選擇'}</p>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-[#6F8A72]">預約時間</p>
                  <p className="mt-2 font-semibold text-[#343A36]">{formData.time}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-[#6F8A72]">聯絡資訊</p>
              <p className="mt-2 text-sm text-[#343A36]">{formData.firstName} {formData.lastName}</p>
              <p className="text-sm text-[#343A36]">{formData.phone}</p>
              <p className="text-sm text-[#343A36]">{formData.email}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-[#6F8A72]">健康問卷</p>
              <p className="mt-2 text-sm text-[#343A36]">{formData.questionnaire || '無補充內容'}</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }, [currentStep, formData, errors])

  const validateStep = () => {
    const nextErrors: Partial<Record<keyof AppointmentFormData, string>> = {}

    if (currentStep === 1 && !formData.service) {
      nextErrors.service = '請選擇診療項目'
    }
    if (currentStep === 2 && !formData.doctor) {
      nextErrors.doctor = '請選擇醫師'
    }
    if (currentStep === 3 && !isValidDate(formData.date)) {
      nextErrors.date = '請選擇有效的工作日日期'
    }
    if (currentStep === 4 && !formData.time) {
      nextErrors.time = '請選擇看診時間'
    }
    if (currentStep === 5) {
      if (!formData.firstName.trim()) nextErrors.firstName = '請輸入姓名'
      if (!formData.lastName.trim()) nextErrors.lastName = '請輸入姓氏'
      if (!/^[0-9]{10}$/.test(formData.phone)) nextErrors.phone = '請輸入 10 碼手機號碼'
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        nextErrors.email = '請輸入有效 Email'
      }
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleNext = async () => {
    if (currentStep === 7) {
      if (!validateStep()) return
      setIsSubmitting(true)
      await new Promise((resolve) => setTimeout(resolve, 750))
      setIsSubmitting(false)
      setSubmitted(true)
      return
    }

    if (!validateStep()) return
    onNextStep()
  }

  const stepNumber = `${currentStep} / ${appointmentSteps.length}`

  return (
    <section className="rounded-[32px] border border-[#D9D5CC] bg-[#FAF8F2] p-6 shadow-sm md:p-8">
      <div className="mb-8 rounded-[28px] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6F8A72]">{stepNumber}</p>
        <h2 className="mt-4 text-2xl font-semibold text-[#355C46]">{currentStepLabel}</h2>
        <p className="mt-2 text-sm leading-6 text-[#343A36]/90">
          依循步驟完成預約資料，系統會幫您保留目前進度。
        </p>
      </div>

      <div className="space-y-8">{stepContent}</div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onPreviousStep}
          disabled={currentStep === 1}
          className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-[#D9D5CC] bg-white px-6 py-3 text-sm font-semibold text-[#343A36] transition hover:border-[#355C46] hover:bg-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46]/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          返回上一步
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex min-h-[3rem] items-center justify-center rounded-full bg-[#355C46] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2f503d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46]/40"
        >
          {currentStep === 7 ? (isSubmitting ? '送出中…' : submitted ? '已完成預約' : '確認預約') : '下一步'}
        </button>
      </div>

      {submitted && (
        <div className="mt-6 rounded-[28px] bg-[#E9EFE7] p-5 text-[#355C46] shadow-sm">
          <p className="font-semibold">預約提交成功！</p>
          <p className="mt-2 text-sm text-[#343A36]">感謝您選擇 WELLSPRING Wellness Center，我們將儘速與您確認預約。</p>
        </div>
      )}
    </section>
  )
}
