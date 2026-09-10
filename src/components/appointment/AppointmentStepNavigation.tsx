"use client"

import type { ComponentType } from 'react'
import {
  CalendarDays,
  Check,
  Circle,
  ClipboardList,
  Clock3,
  FileCheck2,
  HeartPulse,
  Stethoscope,
  UserRound,
} from 'lucide-react'

export type AppointmentStep = {
  id: number
  title: string
  shortTitle: string
  description: string
  icon: ComponentType<{ className?: string }>
}

export const appointmentSteps: AppointmentStep[] = [
  {
    id: 1,
    title: '初診前說明',
    shortTitle: '說明',
    description: '適用第一次來診、非緊急服務、預估看診時間',
    icon: HeartPulse,
  },
  {
    id: 2,
    title: '選擇服務類型',
    shortTitle: '服務',
    description: '選擇初診服務類型與醫師',
    icon: Stethoscope,
  },
  {
    id: 3,
    title: '選擇日期',
    shortTitle: '日期',
    description: '選擇方便前來的日期',
    icon: CalendarDays,
  },
  {
    id: 4,
    title: '選擇時間',
    shortTitle: '時間',
    description: '選擇可預約的時段',
    icon: Clock3,
  },
  {
    id: 5,
    title: '填寫基本聯絡資料',
    shortTitle: '資料',
    description: '填寫姓名、電話與聯絡方式',
    icon: UserRound,
  },
  {
    id: 6,
    title: '簡短說明主要需求',
    shortTitle: '說明',
    description: '描述此次初診主要訴求',
    icon: ClipboardList,
  },
  {
    id: 7,
    title: '確認預約',
    shortTitle: '確認',
    description: '檢查資料並閱讀預約政策',
    icon: FileCheck2,
  },
]

type AppointmentStepNavigationProps = {
  currentStep: number
  completedSteps?: number[]
  onStepChange?: (step: number) => void
}

export default function AppointmentStepNavigation({
  currentStep,
  completedSteps = [],
  onStepChange,
}: AppointmentStepNavigationProps) {
  return (
    <>
      {/* Desktop navigation */}
      <aside
        aria-label="線上預約步驟"
        className="hidden w-full max-w-[280px] rounded-3xl border border-[#D8E2D7] bg-[#FAF8F2] p-5 shadow-sm lg:block"
      >
        <div className="mb-6 rounded-2xl border border-[#B9CFBB] bg-[#E9EFE7] p-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#355C46] text-white">
            <CalendarDays className="h-6 w-6" />
          </div>

          <p className="text-sm font-medium text-[#6F8A72]">Online Appointment</p>

          <h2 className="mt-1 text-lg font-semibold text-[#355C46]">線上預約</h2>
        </div>

        <ol className="relative">
          {appointmentSteps.map((step, index) => {
            const Icon = step.icon
            const isCurrent = currentStep === step.id
            const isCompleted = completedSteps.includes(step.id)
            const isClickable = Boolean(onStepChange) && (isCompleted || step.id <= currentStep)

            return (
              <li key={step.id} className="relative pb-3 last:pb-0">
                {index < appointmentSteps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[19px] top-10 h-[calc(100%-24px)] w-px bg-[#CFD8CF]"
                  />
                )}

                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepChange?.(step.id)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={[
                    'relative flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46] focus-visible:ring-offset-2',
                    isCurrent ? 'border-[#6F8A72] bg-[#E9EFE7] shadow-sm' : 'border-transparent bg-transparent',
                    isClickable ? 'cursor-pointer hover:bg-[#F0F3EC]' : 'cursor-default',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                      isCurrent
                        ? 'border-[#355C46] bg-[#355C46] text-white'
                        : isCompleted
                        ? 'border-[#6F8A72] bg-[#6F8A72] text-white'
                        : 'border-[#CDD3CD] bg-white text-[#879087]',
                    ].join(' ')}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : isCurrent ? <Icon className="h-5 w-5" /> : <Circle className="h-4 w-4" />}
                  </span>

                  <span className="min-w-0 pt-0.5">
                    <span
                      className={[
                        'block text-sm font-semibold',
                        isCurrent
                          ? 'text-[#355C46]'
                          : isCompleted
                          ? 'text-[#526B59]'
                          : 'text-[#59615B]',
                      ].join(' ')}
                    >
                      {step.id}. {step.title}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-[#747D76]">
                      {step.description}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </aside>

      {/* Mobile navigation */}
      <nav
        aria-label="手機版預約步驟"
        className="overflow-x-auto rounded-2xl border border-[#D8E2D7] bg-[#FAF8F2] p-3 lg:hidden"
      >
        <ol className="flex min-w-max gap-2">
          {appointmentSteps.map((step) => {
            const isCurrent = currentStep === step.id
            const isCompleted = completedSteps.includes(step.id)

            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (isCompleted || step.id <= currentStep) {
                      onStepChange?.(step.id)
                    }
                  }}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={[
                    'flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46]',
                    isCurrent ? 'border-[#6F8A72] bg-[#E9EFE7] text-[#355C46]' : 'border-[#E0E4DF] bg-white text-[#59615B]',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs',
                      isCompleted
                        ? 'bg-[#6F8A72] text-white'
                        : isCurrent
                        ? 'bg-[#355C46] text-white'
                        : 'bg-[#EEF0ED] text-[#687069]',
                    ].join(' ')}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                  </span>

                  {step.shortTitle}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
