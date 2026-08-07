'use client'

import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function ClinicLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setLoading(true)
    // Attempt to sign in with NextAuth Google (if configured)
    await signIn('google', { callbackUrl: '/admin' })
    setLoading(false)
  }

  const handleEmail = async () => {
    // Redirect to NextAuth sign-in page where credentials provider is available
    router.push('/api/auth/signin')
  }

  const handleFace = async () => {
    setLoading(true)
    // Beta: pretend face recognition success by calling demo API which sets a demo cookie
    try {
      await fetch('/api/auth/demo')
      // small delay to ensure cookie is set
      setTimeout(() => {
        router.push('/admin')
      }, 300)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-24">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#355C46]">診所系統登入</h1>
        <p className="mt-2 text-sm text-gray-600">請使用以下方式登入後台（Beta 模式）。臉部辨識為模擬成功，不會保存任何資料。</p>

        <div className="mt-6 grid gap-3">
          <button onClick={handleGoogle} disabled={loading} className="w-full rounded-md border px-4 py-3 text-sm font-medium hover:bg-gray-50">透過 Google 登入</button>
          <button onClick={handleEmail} disabled={loading} className="w-full rounded-md border px-4 py-3 text-sm font-medium hover:bg-gray-50">以 Email / 密碼 登入</button>
          <button onClick={handleFace} disabled={loading} className="w-full rounded-md border px-4 py-3 text-sm font-medium hover:bg-gray-50">臉部辨識（Beta）</button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>若要管理員帳號，請使用管理工具建立使用者或執行 `scripts/create-admin.ts`。</p>
        </div>
      </div>
    </div>
  )
}
