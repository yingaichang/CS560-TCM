'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const appointmentSteps = [
  '初診前說明',
  '選擇服務類型',
  '選擇日期',
  '可預約時段',
  '填寫基本聯絡資料',
  '簡短說明主要需求',
  '確認預約',
] as const

type AppointmentFormData = {
  consultationType: string
  service: string
  doctor: string
  date: string
  time: string
  firstName: string
  lastName: string
  birthDate: string
  phone: string
  email: string
  preferredLanguage: string
  isFirstVisit: string
  primaryConcern: string
  concernDetail: string
  hasInsurance: string
  referralSource: string
  preferredContactMethod: string
  agreedPolicy: boolean
}

type AppointmentFormProps = {
  currentStep: number
  onNextStep: () => void
  onPreviousStep: () => void
}

const consultationTypes = [
  '一般中醫初診',
  '疼痛／針灸初診',
  '體質與健康管理',
  'AI 健康分析＋初診',
]

const consultationTypeDetails = [
  {
    type: '一般中醫初診',
    patient: '第一次看診，希望接受完整評估',
    destination: '健康資料填寫',
  },
  {
    type: '疼痛／針灸初診',
    patient: '肩頸痛、腰痛、關節或其他疼痛',
    destination: '疼痛部位簡表',
  },
  {
    type: '體質與健康管理',
    patient: '睡眠、疲勞、消化、壓力、養生規劃',
    destination: 'AI 初診問卷',
  },
  {
    type: 'AI 健康分析＋初診',
    patient: '希望先完成體質分析與健康報告',
    destination: 'AI 健康分析',
  },
]

const consultationTypeRoutes: Record<string, string> = {
  '一般中醫初診': '/appointments/health-data',
  '疼痛／針灸初診': '/appointments/pain-summary',
  '體質與健康管理': '/appointments/ai-questionnaire',
  'AI 健康分析＋初診': '/ai-health-analysis',
}

const preferredLanguages = ['中文', '英文']
const preferredContactMethods = ['電話', '簡訊', 'Email']

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
  '09:30',
  '11:00',
  '14:00',
  '15:30',
] as const

const fieldLabel = {
  consultationType: '初診類型',
  service: '服務類型',
  doctor: '醫師／服務人員',
  date: '日期',
  time: '可預約時段',
  firstName: '姓名',
  lastName: '姓氏',
  birthDate: '出生日期',
  phone: '手機',
  email: 'Email',
  preferredLanguage: '希望聯絡語言',
  isFirstVisit: '是否為第一次來診',
  primaryConcern: '這次最希望我們協助的健康問題是什麼？',
  concernDetail: '請用 1–3 句描述目前最主要的問題',
  hasInsurance: '目前是否有醫療保險（可選填）',
  referralSource: '轉介來源（可選填）',
  preferredContactMethod: '希望我們如何聯絡（可選填）',
  agreedPolicy: '我已同意預約與取消政策',
}

const getMinDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = getMinDate()

const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']

const isValidDate = (value: string) => {
  if (!value || value < today) return false
  const date = new Date(`${value}T12:00:00`)
  const day = date.getDay()
  return day !== 0 && day !== 6
}

const formatSelectedDateLabel = (value: string) => {
  if (!value) return ''
  const date = new Date(`${value}T12:00:00`)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = weekdayNames[date.getDay()]
  return `${month}月${day}日 星期${weekday}`
}

const formatConfirmationDate = (value: string) => {
  if (!value) return ''
  const normalizedValue = value.includes('T') ? value : `${value}T12:00:00`
  const date = new Date(normalizedValue)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

type AppointmentResult = {
  appointmentNumber: string
  date: string
  time: string
  consultationType: string
  service: string
  doctor: string
}

export default function AppointmentForm({ currentStep, onNextStep, onPreviousStep }: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    consultationType: consultationTypes[0],
    service: services[0],
    doctor: doctors[0],
    date: '',
    time: timeSlots[0],
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    email: '',
    preferredLanguage: preferredLanguages[0],
    isFirstVisit: '是',
    primaryConcern: '疼痛或活動受限',
    concernDetail: '',
    hasInsurance: '',
    referralSource: '',
    preferredContactMethod: preferredContactMethods[0],
    agreedPolicy: false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof AppointmentFormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')
  const [appointmentResult, setAppointmentResult] = useState<AppointmentResult | null>(null)

  const router = useRouter()
  const currentStepLabel = appointmentSteps[currentStep - 1]

  const stepContent = useMemo(() => {
    if (currentStep === 7 && submitted && appointmentResult) {
      const nextRoute = consultationTypeRoutes[appointmentResult.consultationType] || '/appointments'
      const primaryButtonLabel = appointmentResult.consultationType === '體質與健康管理'
        ? '開始 AI 初診問卷'
        : '繼續填寫初診健康資料'

      return (
        <div className="rounded-[32px] border border-[#D9D5CC] bg-[#F7F4EB] p-6 shadow-sm">
          <div className="mb-6 space-y-3">
            <p className="text-2xl font-semibold text-[#355C46]">✓ 您的初診預約已送出</p>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-[#6F8A72]">預約類型</p>
              <p className="mt-2 text-lg font-semibold text-[#343A36]">{appointmentResult.consultationType}</p>
              <p className="mt-3 text-sm text-[#6F8A72]">日期</p>
              <p className="mt-1 text-lg font-semibold text-[#343A36]">{formatConfirmationDate(appointmentResult.date)}</p>
              <p className="mt-3 text-sm text-[#6F8A72]">時間</p>
              <p className="mt-1 text-lg font-semibold text-[#343A36]">{appointmentResult.time}</p>
              <p className="mt-3 text-sm text-[#6F8A72]">預約編號</p>
              <p className="mt-1 text-lg font-semibold text-[#343A36]">{appointmentResult.appointmentNumber}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <button
              type="button"
              onClick={() => router.push(nextRoute)}
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full bg-[#355C46] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2f503d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46]/40"
            >
              {primaryButtonLabel}
            </button>
            <button
              type="button"
              onClick={() => router.push('/appointments')}
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-[#D9D5CC] bg-white px-6 py-3 text-sm font-semibold text-[#343A36] transition hover:border-[#355C46] hover:bg-[#F7F4EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46]/30"
            >
              稍後填寫
            </button>
          </div>
        </div>
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="rounded-[32px] border border-[#D9D5CC] bg-[#FAF8F2] p-6 text-[#343A36] shadow-sm">
            <h2 className="text-2xl font-semibold text-[#355C46]">初診預約</h2>
            <p className="mt-4 text-sm leading-7 text-[#4D5C50]">
              第一次來到愛中醫健康管理中心，請先完成線上預約。預約完成後，您可以繼續填寫健康資料或 AI 初診問卷，協助我們在看診前了解您的主要需求。
            </p>
            <div className="mt-6 space-y-4 rounded-3xl border border-[#D9D5CC] bg-white p-5 text-[#343A36] shadow-sm">
              <div>
                <p className="text-sm font-semibold text-[#355C46]">預估時間：</p>
                <p className="mt-1 text-sm text-[#4D5C50]">初診約 60–90 分鐘</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#355C46]">準備資料：</p>
                <p className="mt-1 text-sm text-[#4D5C50]">藥物清單、檢查報告及保險資料（如適用）</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#355C46]">重要提醒：</p>
                <p className="mt-1 text-sm text-[#4D5C50]">線上預約不適用於緊急醫療狀況</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-[#6F8A72]">請點選下方按鈕開始初診預約流程。</p>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#D9D5CC] bg-white p-4 text-[#343A36] shadow-sm">
              <p className="text-sm font-semibold text-[#355C46]">請選擇最適合您的初診類型</p>
              <p className="mt-2 text-sm text-[#4D5C50]">不同初診類型會引導至對應的後續問卷或資料填寫頁面。</p>
            </div>

            <div className="overflow-x-auto rounded-[28px] border border-[#D9D5CC] bg-white shadow-sm">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="bg-[#F7F4EB] text-left text-[#355C46]">
                    <th className="px-4 py-3 text-sm font-semibold">初診類型</th>
                    <th className="px-4 py-3 text-sm font-semibold">適合的病人</th>
                    <th className="px-4 py-3 text-sm font-semibold">預約後去哪裡</th>
                  </tr>
                </thead>
                <tbody>
                  {consultationTypeDetails.map((item, index) => (
                    <tr key={item.type} className={index % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAF8F2]'}>
                      <td className="px-4 py-3 align-top text-[#343A36]">{item.type}</td>
                      <td className="px-4 py-3 align-top text-[#4D5C50]">{item.patient}</td>
                      <td className="px-4 py-3 align-top text-[#4D5C50]">{item.destination}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.consultationType}</span>
              <select
                name="consultationType"
                value={formData.consultationType}
                onChange={(event) => {
                  setFormData({ ...formData, consultationType: event.currentTarget.value })
                  setErrors((prev) => ({ ...prev, consultationType: undefined }))
                }}
                className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
              >
                {consultationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.consultationType && <p className="text-sm text-[#B22E20]">{errors.consultationType}</p>}
            </label>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.service}</span>
                <select
                  name="service"
                  value={formData.service}
                  onChange={(event) => {
                    setFormData({ ...formData, service: event.currentTarget.value })
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

              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.doctor}</span>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={(event) => {
                    setFormData({ ...formData, doctor: event.currentTarget.value })
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
                  setFormData({ ...formData, date: event.currentTarget.value })
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
          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#D9D5CC] bg-[#F7F4EB] p-4 text-[#343A36] shadow-sm">
              <p className="text-sm font-semibold text-[#355C46]">可預約時段</p>
              <p className="mt-2 text-sm text-[#4D5C50]">
                {formData.date ? formatSelectedDateLabel(formData.date) : '請先選擇日期，系統會顯示可預約時段。'}
              </p>
            </div>

            <div className="grid gap-3">
              {timeSlots.map((time) => {
                const isSelected = formData.time === time

                return (
                  <label
                    key={time}
                    className={['flex cursor-pointer items-center justify-between gap-4 rounded-3xl border px-4 py-3 transition',
                      isSelected ? 'border-[#355C46] bg-[#E9EFE7]' : 'border-[#D9D5CC] bg-white hover:border-[#355C46]/50',
                    ].join(' ')}
                  >
                    <span className="text-base font-medium text-[#343A36]">{time}</span>
                    <input
                      type="radio"
                      name="time"
                      value={time}
                      checked={isSelected}
                      onChange={(event) => {
                        setFormData({ ...formData, time: event.currentTarget.value })
                        setErrors((prev) => ({ ...prev, time: undefined }))
                      }}
                      className="h-4 w-4 text-[#355C46]"
                    />
                  </label>
                )
              })}
              {errors.time && <p className="text-sm text-[#B22E20]">{errors.time}</p>}
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.firstName}</span>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(event) => {
                    setFormData({ ...formData, firstName: event.currentTarget.value })
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
                    setFormData({ ...formData, lastName: event.currentTarget.value })
                    setErrors((prev) => ({ ...prev, lastName: undefined }))
                  }}
                  className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
                  placeholder="例：陳"
                />
                {errors.lastName && <p className="text-sm text-[#B22E20]">{errors.lastName}</p>}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.birthDate}</span>
                <input
                  type="date"
                  name="birthDate"
                  max={today}
                  value={formData.birthDate}
                  onChange={(event) => {
                    setFormData({ ...formData, birthDate: event.currentTarget.value })
                    setErrors((prev) => ({ ...prev, birthDate: undefined }))
                  }}
                  className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
                />
                {errors.birthDate && <p className="text-sm text-[#B22E20]">{errors.birthDate}</p>}
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
                  required
                  value={formData.email}
                  onChange={(event) => {
                    setFormData({ ...formData, email: event.currentTarget.value })
                    setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
                  placeholder="example@mail.com"
                />
                {errors.email && <p className="text-sm text-[#B22E20]">{errors.email}</p>}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.preferredLanguage}</span>
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={(event) => {
                    setFormData({ ...formData, preferredLanguage: event.currentTarget.value })
                    setErrors((prev) => ({ ...prev, preferredLanguage: undefined }))
                  }}
                  className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
                >
                  {preferredLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                {errors.preferredLanguage && <p className="text-sm text-[#B22E20]">{errors.preferredLanguage}</p>}
              </label>

              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold text-[#343A36]">{fieldLabel.isFirstVisit}</legend>
                <div className="flex flex-wrap gap-3">
                  {['是', '否'].map((value) => (
                    <label key={value} className="inline-flex items-center gap-2 rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-sm text-[#343A36] transition hover:border-[#355C46]/50">
                      <input
                        type="radio"
                        name="isFirstVisit"
                        value={value}
                        checked={formData.isFirstVisit === value}
                        onChange={(event) => {
                          setFormData({ ...formData, isFirstVisit: event.currentTarget.value })
                          setErrors((prev) => ({ ...prev, isFirstVisit: undefined }))
                        }}
                        className="h-4 w-4 text-[#355C46]"
                      />
                      {value}
                    </label>
                  ))}
                </div>
                {errors.isFirstVisit && <p className="text-sm text-[#B22E20]">{errors.isFirstVisit}</p>}
              </fieldset>
            </div>

            <div className="rounded-[28px] border border-[#D9D5CC] bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-[#355C46]">可選填</p>
              <div className="grid gap-6 md:grid-cols-3 mt-4">
                <label className="space-y-2">
                  <span className="text-sm text-[#343A36]">{fieldLabel.hasInsurance}</span>
                  <select
                    name="hasInsurance"
                    value={formData.hasInsurance}
                    onChange={(event) => setFormData({ ...formData, hasInsurance: event.currentTarget.value })}
                    className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
                  >
                    <option value="">請選擇</option>
                    <option value="有">有</option>
                    <option value="無">無</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-[#343A36]">{fieldLabel.referralSource}</span>
                  <input
                    type="text"
                    name="referralSource"
                    value={formData.referralSource}
                    onChange={(event) => setFormData({ ...formData, referralSource: event.currentTarget.value })}
                    className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
                    placeholder="如：朋友介紹、網路搜尋"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-[#343A36]">{fieldLabel.preferredContactMethod}</span>
                  <select
                    name="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    onChange={(event) => setFormData({ ...formData, preferredContactMethod: event.currentTarget.value })}
                    className="w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30"
                  >
                    {preferredContactMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <label className="mt-4 flex items-start gap-3 text-sm text-[#343A36]">
              <input
                type="checkbox"
                name="agreedPolicy"
                checked={formData.agreedPolicy}
                onChange={(event) => {
                  const checked = event.target.checked
                  setFormData((prev) => ({ ...prev, agreedPolicy: checked }))
                  setErrors((prev) => ({ ...prev, agreedPolicy: undefined }))
                }}
                className="mt-1 h-4 w-4 rounded border-[#D9D5CC] text-[#355C46] focus:ring-[#355C46]"
              />
              <span>{fieldLabel.agreedPolicy}</span>
            </label>
            {errors.agreedPolicy && <p className="text-sm text-[#B22E20]">{errors.agreedPolicy}</p>}
          </div>
        )
      case 6:
        return (
          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#D9D5CC] bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-[#355C46]">{fieldLabel.primaryConcern}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  '疼痛或活動受限',
                  '睡眠問題',
                  '消化問題',
                  '壓力、情緒或疲勞',
                  '女性健康',
                  '慢性健康管理',
                  '銀髮健康',
                  '體質調理與養生',
                  '其他',
                ].map((option) => (
                  <label
                    key={option}
                    className={['flex items-center gap-3 rounded-3xl border px-4 py-3 text-sm text-[#343A36] transition',
                      formData.primaryConcern === option ? 'border-[#355C46] bg-[#E9EFE7]' : 'border-[#D9D5CC] bg-white hover:border-[#355C46]/50',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="primaryConcern"
                      value={option}
                      checked={formData.primaryConcern === option}
                      onChange={(event) => {
                        setFormData({ ...formData, primaryConcern: event.currentTarget.value })
                        setErrors((prev) => ({ ...prev, primaryConcern: undefined }))
                      }}
                      className="h-4 w-4 text-[#355C46]"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {errors.primaryConcern && <p className="mt-2 text-sm text-[#B22E20]">{errors.primaryConcern}</p>}
            </div>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[#343A36]">{fieldLabel.concernDetail}</span>
              <textarea
                name="concernDetail"
                value={formData.concernDetail}
                onChange={(event) => {
                  setFormData({ ...formData, concernDetail: event.currentTarget.value })
                  setErrors((prev) => ({ ...prev, concernDetail: undefined }))
                }}
                className="min-h-[180px] w-full rounded-3xl border border-[#D9D5CC] bg-white px-4 py-3 text-[#343A36] shadow-sm transition focus:border-[#355C46] focus:outline-none focus:ring-2 focus:ring-[#355C46]/30 resize-none"
                placeholder="請用 1–3 句描述目前最主要的問題。"
              />
              {errors.concernDetail && <p className="text-sm text-[#B22E20]">{errors.concernDetail}</p>}
            </label>

            <p className="text-sm text-[#6F8A72]">這些資料的目的只是預約分流，不是完成診斷。</p>
          </div>
        )
      case 7:
        return (
          <div className="space-y-4 rounded-[28px] border border-[#D9D5CC] bg-[#FAF8F2] p-6 text-[#343A36] shadow-sm">
            <div className="grid gap-3">
              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-sm text-[#6F8A72]">初診類型</p>
                <p className="mt-2 font-semibold text-[#343A36]">{formData.consultationType}</p>
              </div>
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
              <p className="text-sm text-[#6F8A72]">主要需求</p>
              <p className="mt-2 text-sm text-[#343A36]">{formData.primaryConcern}</p>
              <p className="mt-2 text-sm text-[#343A36]">{formData.concernDetail || '無補充內容'}</p>
            </div>
            <div className="rounded-3xl border border-[#D9D5CC] bg-[#F7F4EB] p-4 text-sm text-[#4D5C50]">
              <p className="font-semibold text-[#355C46]">預約政策提示</p>
              <p className="mt-2 leading-7">
                送出預約後，我們將以電話或 Email 聯繫您確認最終門診時段與候診安排。若需取消或更改，請至少於兩個工作天前通知本中心。
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }, [currentStep, formData, errors])

  const validateStep = () => {
    const nextErrors: Partial<Record<keyof AppointmentFormData, string>> = {}

    const validateConsultationInfo = () => {
      if (!formData.consultationType) nextErrors.consultationType = '請選擇初診類型'
      if (!formData.service) nextErrors.service = '請選擇診療項目'
      if (!formData.doctor) nextErrors.doctor = '請選擇醫師'
    }

    if (currentStep === 2) {
      validateConsultationInfo()
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
      if (!formData.birthDate) nextErrors.birthDate = '請填寫出生日期'
      if (!/^[0-9]{10}$/.test(formData.phone)) nextErrors.phone = '請輸入 10 碼手機號碼'
      if (!formData.email.trim()) {
        nextErrors.email = '請輸入 Email'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        nextErrors.email = '請輸入有效 Email'
      }
      if (!formData.preferredLanguage) nextErrors.preferredLanguage = '請選擇聯絡語言'
      if (!formData.isFirstVisit) nextErrors.isFirstVisit = '請確認是否為第一次來診'
      if (!formData.agreedPolicy) nextErrors.agreedPolicy = '請同意預約與取消政策'
    }
    if (currentStep === 6 && !formData.primaryConcern.trim()) {
      nextErrors.primaryConcern = '請選擇最希望我們協助的健康問題'
    }
    if (currentStep === 6 && !formData.concernDetail.trim()) {
      nextErrors.concernDetail = '請用 1–3 句描述目前最主要的問題'
    }
    if (currentStep === 7) {
      validateConsultationInfo()
      if (!isValidDate(formData.date)) nextErrors.date = '請選擇有效的工作日日期'
      if (!formData.time) nextErrors.time = '請選擇看診時間'
      if (!formData.firstName.trim()) nextErrors.firstName = '請輸入姓名'
      if (!formData.lastName.trim()) nextErrors.lastName = '請輸入姓氏'
      if (!formData.birthDate) nextErrors.birthDate = '請填寫出生日期'
      if (!/^[0-9]{10}$/.test(formData.phone)) nextErrors.phone = '請輸入 10 碼手機號碼'
      if (!formData.email.trim()) {
        nextErrors.email = '請輸入 Email'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        nextErrors.email = '請輸入有效 Email'
      }
      if (!formData.preferredLanguage) nextErrors.preferredLanguage = '請選擇聯絡語言'
      if (!formData.isFirstVisit) nextErrors.isFirstVisit = '請確認是否為第一次來診'
      if (!formData.agreedPolicy) nextErrors.agreedPolicy = '請同意預約與取消政策'
      if (!formData.primaryConcern.trim()) nextErrors.primaryConcern = '請選擇最希望我們協助的健康問題'
      if (!formData.concernDetail.trim()) nextErrors.concernDetail = '請用 1–3 句描述目前最主要的問題'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleNext = async () => {
    setSubmitError('')

    if (currentStep === 7) {
      if (!validateStep()) return

      setIsSubmitting(true)
      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            email: formData.email,
            service: formData.service,
            doctor: formData.doctor,
            date: formData.date,
            time: formData.time,
            message: `${formData.consultationType}\n${formData.primaryConcern}\n${formData.concernDetail}`,
          }),
        })

        const result = await response.json()
        if (!response.ok) {
          setSubmitError(result?.error || '預約提交失敗，請稍後重試。')
          return
        }

        setSubmitted(true)
        setAppointmentResult({
          appointmentNumber: result.appointmentNumber || `YA-${formData.date.replace(/-/g, '')}-001`,
          date: result.date || formData.date,
          time: result.appointmentTime || formData.time,
          consultationType: formData.consultationType,
          service: formData.service,
          doctor: formData.doctor,
        })
        return
      } catch (error) {
        setSubmitError('預約提交失敗，請稍後重試。')
      } finally {
        setIsSubmitting(false)
      }
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

      {!submitted && (
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
            {currentStep === 1 ? '開始初診預約' : currentStep === 7 ? (isSubmitting ? '送出中…' : '確認預約') : '下一步'}
          </button>
        </div>
      )}

      {submitError && (
        <div className="mt-4 rounded-[24px] border border-[#F2D4D1] bg-[#FCE9E6] p-4 text-sm text-[#B22E20] shadow-sm">
          {submitError}
        </div>
      )}
    </section>
  )
}
