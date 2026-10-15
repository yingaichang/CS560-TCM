'use client'

import { useEffect, useRef, useState } from 'react'
import NumericKeypad from '@/components/kiosk/NumericKeypad'

type Method = 'phone' | 'ssn' | 'license' | 'membership'

type AppointmentSummary = {
  patientId: string
  name: string
  appointmentTime: string
  doctorName: string
  service: string
}

type Step = 'home' | 'phone' | 'ssn' | 'license' | 'membership' | 'code' | 'confirm' | 'success'

const SUCCESS_DISPLAY_MS = 3000

export default function KioskPage() {
  const [step, setStep] = useState<Step>('home')
  const [inputValue, setInputValue] = useState('')
  const [codeValue, setCodeValue] = useState('')
  const [maskedPhone, setMaskedPhone] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [checkinToken, setCheckinToken] = useState('')
  const [appointment, setAppointment] = useState<AppointmentSummary | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current)
    }
  }, [])

  const resetToHome = () => {
    if (successTimer.current) clearTimeout(successTimer.current)
    setStep('home')
    setInputValue('')
    setCodeValue('')
    setMaskedPhone('')
    setVerifyToken('')
    setCheckinToken('')
    setAppointment(null)
    setError('')
    setLoading(false)
  }

  const chooseMethod = (method: Method) => {
    setError('')
    setInputValue('')
    if (method === 'license' || method === 'membership') {
      setStep(method)
      return
    }
    setStep(method)
  }

  const submitLookup = async (method: 'phone' | 'ssn') => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/kiosk/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, value: inputValue }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || data.error || '查詢失敗，請洽櫃檯協助。')
        return
      }
      setVerifyToken(data.token)
      setMaskedPhone(data.maskedPhone)
      setCodeValue('')
      setStep('code')
    } catch (e) {
      console.error(e)
      setError('系統發生錯誤，請洽櫃檯協助。')
    } finally {
      setLoading(false)
    }
  }

  const submitVerification = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/kiosk/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken, code: codeValue }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || '驗證失敗，請洽櫃檯協助。')
        setCodeValue('')
        return
      }
      setAppointment(data.appointment)
      setCheckinToken(data.checkinToken)
      setStep('confirm')
    } catch (e) {
      console.error(e)
      setError('系統發生錯誤，請洽櫃檯協助。')
    } finally {
      setLoading(false)
    }
  }

  const confirmCheckIn = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/kiosk/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkinToken }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || '報到失敗，請洽櫃檯協助。')
        return
      }
      setStep('success')
      successTimer.current = setTimeout(resetToHome, SUCCESS_DISPLAY_MS)
    } catch (e) {
      console.error(e)
      setError('系統發生錯誤，請洽櫃檯協助。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F2] px-4 py-10 text-[#343A36] sm:px-6">
      <div className="w-full max-w-2xl rounded-[40px] border border-[#D9D5CC] bg-white p-8 shadow-sm sm:p-12">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6F8A72]">
            AI TCM HEALTH MANAGEMENT CENTER
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-[#355C46] sm:text-4xl">病患自助報到</h1>
        </div>

        {step === 'home' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KioskChoiceButton label="掃描駕照" sub="Scan Driver's License" onClick={() => chooseMethod('license')} />
            <KioskChoiceButton label="輸入手機號碼" sub="Enter Phone Number" onClick={() => chooseMethod('phone')} />
            <KioskChoiceButton label="輸入社會安全碼末四碼" sub="Enter Last 4 of SSN" onClick={() => chooseMethod('ssn')} />
            <KioskChoiceButton label="掃描會員卡" sub="Scan Membership ID" onClick={() => chooseMethod('membership')} />
          </div>
        )}

        {(step === 'license' || step === 'membership') && (
          <UnavailableMethod
            title={step === 'license' ? '駕照掃描目前無法使用' : '會員卡掃描目前無法使用'}
            onBack={resetToHome}
          />
        )}

        {(step === 'phone' || step === 'ssn') && (
          <EntryStep
            title={step === 'phone' ? '請輸入您的手機號碼' : '請輸入社會安全碼末四碼'}
            value={inputValue}
            maxLength={step === 'phone' ? 10 : 4}
            onChange={setInputValue}
            error={error}
            loading={loading}
            onSubmit={() => submitLookup(step)}
            onCancel={resetToHome}
          />
        )}

        {step === 'code' && (
          <div>
            <p className="mb-2 text-center text-lg text-[#343A36]">
              驗證碼已傳送至 <span className="font-semibold text-[#355C46]">{maskedPhone}</span>
            </p>
            <p className="mb-6 text-center text-sm text-[#6F8A72]">請輸入 6 碼驗證碼</p>
            <EntryStep
              title=""
              value={codeValue}
              maxLength={6}
              onChange={setCodeValue}
              error={error}
              loading={loading}
              onSubmit={submitVerification}
              onCancel={resetToHome}
              submitLabel="驗證"
            />
          </div>
        )}

        {step === 'confirm' && appointment && (
          <div className="text-center">
            <div className="mb-8 space-y-3 rounded-3xl bg-[#F4F1E8] p-6 text-left text-lg">
              <SummaryRow label="姓名 Name" value={appointment.name} />
              <SummaryRow label="病歷編號 Patient ID" value={appointment.patientId} />
              <SummaryRow label="預約時間 Appointment Time" value={appointment.appointmentTime} />
              <SummaryRow label="看診醫師 Practitioner" value={appointment.doctorName} />
            </div>
            {error && <p className="mb-4 text-base font-medium text-red-600">{error}</p>}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                disabled={loading}
                onClick={confirmCheckIn}
                className="flex-1 rounded-2xl bg-[#355C46] py-5 text-xl font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-60"
              >
                {loading ? '處理中…' : '確認報到 Confirm Check-In'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={resetToHome}
                className="flex-1 rounded-2xl border border-[#D9D5CC] bg-white py-5 text-xl font-semibold text-[#343A36] shadow-sm transition active:scale-95"
              >
                取消 Cancel
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 text-center">
            <p className="text-3xl font-semibold text-[#355C46]">報到成功</p>
            <p className="mt-2 text-xl text-[#343A36]">Check-in successful</p>
          </div>
        )}
      </div>
    </main>
  )
}

function KioskChoiceButton({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-3xl border border-[#D9D5CC] bg-[#FAF8F2] p-8 text-center shadow-sm transition active:scale-95 active:bg-[#EEE5D6]"
    >
      <span className="block text-xl font-semibold text-[#355C46]">{label}</span>
      <span className="mt-2 block text-sm text-[#6F8A72]">{sub}</span>
    </button>
  )
}

function UnavailableMethod({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="py-6 text-center">
      <p className="text-2xl font-semibold text-[#355C46]">{title}</p>
      <p className="mt-4 text-lg text-[#343A36]">
        此報到方式需要專用掃描設備，本站尚未安裝。
        <br />
        請前往櫃檯由工作人員協助報到。
      </p>
      <p className="mt-2 text-base text-[#6F8A72]">
        This check-in method requires scanning hardware that is not yet installed. Please see the front desk for assistance.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-8 rounded-2xl border border-[#D9D5CC] bg-white px-8 py-4 text-lg font-semibold text-[#343A36] shadow-sm transition active:scale-95"
      >
        返回 Back
      </button>
    </div>
  )
}

function EntryStep({
  title,
  value,
  maxLength,
  onChange,
  error,
  loading,
  onSubmit,
  onCancel,
  submitLabel = '查詢',
}: {
  title: string
  value: string
  maxLength: number
  onChange: (value: string) => void
  error: string
  loading: boolean
  onSubmit: () => void
  onCancel: () => void
  submitLabel?: string
}) {
  return (
    <div>
      {title && <p className="mb-6 text-center text-xl font-semibold text-[#355C46]">{title}</p>}
      <div className="mb-6 flex justify-center">
        <div className="min-w-[240px] rounded-2xl border border-[#D9D5CC] bg-[#FAF8F2] px-6 py-4 text-center text-3xl font-semibold tracking-[0.3em] text-[#355C46]">
          {value.padEnd(maxLength, '•')}
        </div>
      </div>
      {error && <p className="mb-4 text-center text-base font-medium text-red-600">{error}</p>}
      <NumericKeypad value={value} onChange={onChange} maxLength={maxLength} />
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          disabled={loading || value.length !== maxLength}
          onClick={onSubmit}
          className="flex-1 rounded-2xl bg-[#355C46] py-5 text-xl font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-40"
        >
          {loading ? '處理中…' : submitLabel}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onCancel}
          className="flex-1 rounded-2xl border border-[#D9D5CC] bg-white py-5 text-xl font-semibold text-[#343A36] shadow-sm transition active:scale-95"
        >
          取消 Cancel
        </button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[#E4DFD2] pb-2 last:border-none">
      <span className="text-sm text-[#6F8A72]">{label}</span>
      <span className="text-lg font-semibold text-[#343A36]">{value}</span>
    </div>
  )
}
