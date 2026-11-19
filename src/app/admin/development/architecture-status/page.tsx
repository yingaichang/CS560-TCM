import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { canViewArchitectureStatus } from '@/lib/architectureStatusAccess'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Architecture Status | Development',
  robots: { index: false, follow: false },
}

type Status = 'Implemented' | 'Partial' | 'Planned'

const modules: { name: string; status: Status; detail: string; evidence: string }[] = [
  {
    name: 'Public website & appointments', status: 'Implemented',
    detail: 'Public content, appointment requests and administrator appointment management have routes and handlers.',
    evidence: 'src/app/page.tsx · src/app/api/appointments/route.ts',
  },
  {
    name: 'Identity & access', status: 'Partial',
    detail: 'Clerk protects administrator routes with sign-in. EHR APIs enforce roles; page-level role checks are not yet consistent across all admin pages.',
    evidence: 'src/middleware.ts · src/lib/ehrAuthorization.ts',
  },
  {
    name: 'Clinical records', status: 'Partial',
    detail: 'Patient and intake APIs use Prisma. EHR patient writes are currently disabled in production.',
    evidence: 'src/app/api/ehr/patients/route.ts · prisma/schema.prisma',
  },
  {
    name: 'Audit trail', status: 'Implemented',
    detail: 'Audit recording, a protected viewer and chain verification have implementations.',
    evidence: 'src/lib/auditLog.ts · src/app/api/admin/audit-logs/verify-chain/route.ts',
  },
  {
    name: 'Payments', status: 'Partial',
    detail: 'Stripe Checkout and signed webhook handlers exist. Payment processing depends on external configuration and validation.',
    evidence: 'src/app/api/payment/checkout-session/route.ts · src/app/api/webhooks/stripe/route.ts',
  },
  {
    name: 'Kiosk check-in', status: 'Implemented',
    detail: 'Lookup, verification and check-in handlers exist, with verification logic separate from the UI.',
    evidence: 'src/app/api/kiosk · src/lib/kioskVerification.ts',
  },
  {
    name: 'Administrator user management', status: 'Planned',
    detail: 'Current screens are scaffolds with sample data; account management actions still need implementation.',
    evidence: 'src/app/admin/users/page.tsx',
  },
  {
    name: 'Continuing education', status: 'Planned',
    detail: 'The course information page is a design draft. Formal registration and CEU credit issuance are not open.',
    evidence: 'src/app/courses-events/page.tsx',
  },
]

const statusStyles: Record<Status, string> = {
  Implemented: 'bg-green-50 text-green-800 ring-green-200',
  Partial: 'bg-amber-50 text-amber-900 ring-amber-200',
  Planned: 'bg-slate-100 text-slate-700 ring-slate-200',
}

export default async function ArchitectureStatusPage() {
  // Enforce access on the server even for direct URLs and RSC requests.
  if (!(await canViewArchitectureStatus())) notFound()

  const configuration = [
    { name: 'Clerk identity', configured: Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) },
    { name: 'Database', configured: Boolean(process.env.DATABASE_URL) },
    { name: 'Stripe checkout & webhooks', configured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) },
  ]

  return (
    <section className="space-y-6" aria-labelledby="architecture-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#355C46]">Development / System Status</p>
          <h1 id="architecture-title" className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">Architecture Status Dashboard</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">An administrator-only view of the current application structure and implementation gaps.</p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">Temporary development tool</span>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
        Implementation inventory, not a live health monitor. “Implemented” means source code exists; it does not certify production readiness or successful external connections.
      </div>

      <div className="grid gap-4 sm:grid-cols-3" aria-label="Implementation summary">
        {(['Implemented', 'Partial', 'Planned'] as const).map((status) => (
          <div key={status} className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-600">{status}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{modules.filter((module) => module.status === status).length}<span className="ml-2 text-base font-normal text-gray-500">modules</span></p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="structure-title">
        <h2 id="structure-title" className="text-xl font-semibold text-gray-900">Application structure</h2>
        <ol className="mt-5 grid gap-4 lg:grid-cols-3">
          {[
            { title: 'Presentation', detail: 'Next.js App Router, React and Tailwind CSS. Public pages and separate admin, EHR and kiosk areas.' },
            { title: 'Server & authorization', detail: 'Next.js route handlers, Clerk sessions and role checks. This dashboard requires the admin role on every request.' },
            { title: 'Persistence & integrations', detail: 'Prisma with SQLite in the current schema. Clerk, Stripe and SMTP provide external identity, payments and email.' },
          ].map((layer, index) => (
            <li key={layer.title} className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-[#355C46]">Layer {index + 1}</p>
              <h3 className="mt-2 font-semibold text-gray-900">{layer.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{layer.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white" aria-labelledby="modules-title">
        <div className="border-b border-gray-200 p-5 sm:p-6">
          <h2 id="modules-title" className="text-xl font-semibold text-gray-900">Module inventory</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">Maintained in source with this temporary page. Review these assessments when the implementation changes.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Architecture implementation status and source evidence by module</caption>
            <thead className="bg-gray-50 text-gray-600">
              <tr><th scope="col" className="px-5 py-3">Module</th><th scope="col" className="px-5 py-3">Status</th><th scope="col" className="px-5 py-3">Current implementation</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {modules.map((module) => (
                <tr key={module.name}>
                  <th scope="row" className="px-5 py-4 align-top font-medium text-gray-900">{module.name}</th>
                  <td className="px-5 py-4 align-top"><span className={`inline-flex rounded-full px-2.5 py-1 font-medium ring-1 ring-inset ${statusStyles[module.status]}`}>{module.status}</span></td>
                  <td className="px-5 py-4 text-gray-600"><p className="leading-6">{module.detail}</p><p className="mt-2 break-words font-mono text-xs leading-5 text-gray-500">{module.evidence}</p></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6" aria-labelledby="config-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="config-title" className="text-xl font-semibold text-gray-900">Configuration snapshot</h2>
          <a href="/admin/development/architecture-status" className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355C46]">Refresh snapshot</a>
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-600">Presence checks only; credentials and connectivity have not been validated. No secret values or patient data are displayed.</p>
        <dl className="mt-4 divide-y divide-gray-100">
          {configuration.map((item) => (
            <div key={item.name} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <dt className="font-medium text-gray-900">{item.name}</dt>
              <dd className={item.configured ? 'text-green-800' : 'text-amber-900'}>{item.configured ? 'Configuration present' : 'Configuration incomplete'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex flex-wrap gap-4 text-sm font-medium text-[#355C46]">
        <Link href="/admin" className="underline underline-offset-4">Back to administrator home</Link>
        <Link href="/admin/audit-logs" className="underline underline-offset-4">Open audit log</Link>
      </div>
    </section>
  )
}
