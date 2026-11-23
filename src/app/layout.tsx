import { ClerkProvider } from "@clerk/nextjs";
import { zhTW } from "@clerk/localizations";
import { LocalClerkBypassProvider } from '@/components/LocalClerkBypassProvider'
import { isLocalClerkBypassEnabled } from '@/lib/localClerkBypass'
import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: '愛中醫健康管理中心',
  description:
    '智慧健康分析 × 中醫診療 × 預防醫學 × 健康教育 × 長期健康管理，打造可持續擴充的全人健康平台。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const localClerkBypass = isLocalClerkBypassEnabled

  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
      </head>
      <body className="antialiased">
        <LocalClerkBypassProvider enabled={localClerkBypass}>
          {localClerkBypass ? children : <ClerkProvider localization={zhTW}>{children}</ClerkProvider>}
        </LocalClerkBypassProvider>
      </body>
    </html>
  )
}