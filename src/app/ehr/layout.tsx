import type { ReactNode } from 'react'
import EhrShell from './EhrShell'
import './ehr.css'

export const metadata = { title: 'EHR | YING AI 瀛愛' }

export default function EhrLayout({ children }: { children: ReactNode }) {
  return <EhrShell>{children}</EhrShell>
}