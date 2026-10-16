import Link from 'next/link'
import type { ReactNode } from 'react'

type AdminPlaceholderPageProps = {
  title: string
  description: string
  backHref?: string
  backLabel?: string
  children?: ReactNode
}

export default function AdminPlaceholderPage({ title, description, backHref, backLabel = '返回', children }: AdminPlaceholderPageProps) {
  return (
    <section>
      {backHref ? (
        <Link href={backHref} className="mb-3 inline-block text-sm font-medium text-[#355C46]">← {backLabel}</Link>
      ) : null}
      <h1 className="text-2xl font-semibold text-[#355C46]">{title}</h1>
      <div className="mt-4 rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">{description}</p>
        {children}
      </div>
    </section>
  )
}
