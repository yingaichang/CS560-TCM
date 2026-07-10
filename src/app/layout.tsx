import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: '瀛爱 | 全人健康管理中心',
  description: '结合传统中医智慧与现代健康管理，从体质、饮食、生活习惯与长期追踪，陪伴您建立更安定、自然的养生生活。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
