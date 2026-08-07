'use client'

import { useState } from 'react'
import AppointmentCenterSection from '@/components/AppointmentCenterSection'
import AppointmentStepNavigation from '@/components/appointment/AppointmentStepNavigation'
import AppointmentForm from '@/components/appointment/AppointmentForm'

export default function AppointmentsPage() {
  const [currentStep, setCurrentStep] = useState(1)

  const completedSteps = Array.from({ length: currentStep - 1 }, (_, index) => index + 1)

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 7))
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  return (
    <main className="bg-[#FAF8F2] px-4 py-10 text-[#343A36] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-start">
        <div className="lg:w-[320px]">
          <AppointmentStepNavigation
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepChange={handleStepChange}
          />
        </div>
        <div className="flex-1">
          <div className="rounded-[40px] border border-[#D9D5CC] bg-white p-6 shadow-sm md:p-10">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6F8A72]">
                WELLSPRING Wellness Center
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-[#355C46] sm:text-4xl">
                線上預約
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#343A36]/90">
                依照步驟完成預約，輕鬆安排您的診療時段與需求。手機版會自動簡化導航，方便快速進行。
              </p>
            </div>

            <AppointmentCenterSection />

            <div className="mt-10">
              <AppointmentForm
                currentStep={currentStep}
                onNextStep={handleNextStep}
                onPreviousStep={handlePreviousStep}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
