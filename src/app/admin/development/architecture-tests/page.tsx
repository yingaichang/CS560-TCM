import { notFound } from 'next/navigation'
import { canViewArchitectureStatus } from '@/lib/architectureStatusAccess'
import ArchitectureTestCenter from '@/components/admin/ArchitectureTestCenter'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Architecture Test Center', robots: { index: false, follow: false } }
export default async function ArchitectureTestsPage() {
  if (!(await canViewArchitectureStatus())) notFound()
  return <ArchitectureTestCenter />
}
