import type { ReactNode } from 'react'
import EhrShell from './EhrShell'
import './ehr.css'

export const metadata = { title: '電子病歷｜瀛愛' }

export default function EhrLayout({ children }: { children: ReactNode }) {
  return <EhrShell>{children}</EhrShell>
}