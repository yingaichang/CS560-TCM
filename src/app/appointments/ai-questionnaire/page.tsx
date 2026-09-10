import Link from 'next/link'

export const metadata = {
  title: 'AI 初診問卷 | WELLSPRING Wellness Center',
  description: '請完成 AI 初診問卷，協助我們更全面了解您的健康狀況與初診需求。',
}

export default function AiQuestionnairePage() {
  return (
    <main className="min-h-screen bg-[#faf8f2] px-6 py-20">
      <section className="mx-auto max-w-3xl rounded-3xl border border-[#D8E2D7] bg-white p-10 shadow-[0_12px_28px_rgba(53,92,70,0.1)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6F8A72]">AI 初診問卷</p>
        <h1 className="mt-4 text-3xl font-semibold text-[#355C46]">感謝您完成預約</h1>
        <p className="mt-4 text-base leading-7 text-[#343A36]/90">
          若您選擇「AI 健康分析＋初診」，請繼續前往 AI 初診問卷頁面，完成您的健康資料與症狀描述。
        </p>
        <div className="mt-8 space-y-4 rounded-3xl bg-[#F7F4EB] p-6 text-[#343A36] shadow-sm">
          <p className="text-sm text-[#6F8A72]">下一步指引</p>
          <p className="text-sm leading-7">
            這裡會進一步收集您的體質、生活型態與症狀資料，幫助醫師與 AI 分析模型更精準掌握您的健康狀態。
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/appointments"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-[#355C46] px-6 py-3 text-sm font-semibold text-[#355C46] transition hover:bg-[#f0f5ee]"
          >
            返回預約頁面
          </Link>
        </div>
      </section>
    </main>
  )
}
