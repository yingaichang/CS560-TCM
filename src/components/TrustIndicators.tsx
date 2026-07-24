import { trustIndicators } from '@/data/homepage'

export default function TrustIndicators() {
  return (
    <div className="mt-10 grid grid-cols-2 gap-4 text-sm text-ink sm:grid-cols-4">
      {trustIndicators.map((item) => (
        <div key={item.title} className="rounded-2xl border border-primary/10 bg-[#faf8f2]/92 px-4 py-3 md:px-4 md:py-3.5">
          <p className="font-semibold text-primary md:text-[0.95rem]">{item.title}</p>
          <p className="mt-1 text-xs text-ink/75 md:text-[0.8rem]">{item.subtitle}</p>
        </div>
      ))}
    </div>
  )
}