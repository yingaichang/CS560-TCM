import React from 'react'
import ClerkAuthControls from '../../components/ClerkAuthControls'
import AdminSidebar from '../../components/AdminSidebar'

export const metadata = {
  title: '診所管理系統',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="mx-auto flex max-w-7xl justify-end pb-4"><ClerkAuthControls /></div>
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
