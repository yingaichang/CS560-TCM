import type { ReactNode } from 'react'
import EhrShell from './EhrShell'
import './ehr.css'
import { authorizeEhrRequest } from '@/lib/ehrAuthorization'
import { notFound } from 'next/navigation'

export const metadata = { title: '電子病歷｜瀛愛' }

export default async function EhrLayout({ children }: { children: ReactNode }) {
  if (!(await authorizeEhrRequest(['admin', 'clinic_staff', 'provider', 'billing_staff']))) notFound()
  return <EhrShell>{children}</EhrShell>
}
