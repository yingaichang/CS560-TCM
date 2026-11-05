import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AdminPageScaffold({
  title,
  description,
  backHref,
  backLabel = '返回清單',
  children,
}: {
  title: string
  description: string
  backHref: string
  backLabel?: string
  children: ReactNode
}) {
  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#355C46]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
        </div>
        <Link href={backHref} className="inline-flex w-fit rounded-md border border-[#355C46]/20 bg-white px-3 py-2 text-sm font-medium text-[#355C46] hover:bg-[#F7F4EB]">
          {backLabel}
        </Link>
      </div>
      {children}
    </section>
  )
}
