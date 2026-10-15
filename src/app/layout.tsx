import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: '愛中醫健康管理中心 | AI TCM HEALTH MANAGEMENT CENTER',
  description:
    'AI 健康分析 × 中醫診療 × 預防醫學 × 健康教育 × 長期健康管理，打造可持續擴充的全人健康平台。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
      </head>
      <body className="antialiased">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}