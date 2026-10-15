import { Activity, BookOpen, BrainCircuit, ClipboardList, Stethoscope } from 'lucide-react'

import { trustIndicators } from '@/data/homepage'

const ICONS = {
  team: Stethoscope,
  analysis: BrainCircuit,
  personalized: ClipboardList,
  education: BookOpen,
  tracking: Activity,
} as const

export default function TrustIndicators() {
  return (
    <div className="mt-7 grid grid-cols-2 gap-2 text-sm text-ink sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">
      {trustIndicators.map((item) => {
        const Icon = ICONS[item.iconKey]

        return (
          <div
            key={item.title}
            className="flex min-h-[70px] flex-col justify-center rounded-xl border border-primary/30 bg-[#faf8f2]/92 px-3 py-2"
          >
            <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-1 whitespace-nowrap text-sm font-semibold text-primary">{item.title}</p>
            <p className="mt-0.5 whitespace-nowrap text-[11px] text-ink/75">{item.subtitle}</p>
          </div>
        )
      })}
    </div>
  )
}