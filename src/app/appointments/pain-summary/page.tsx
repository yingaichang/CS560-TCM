import Link from 'next/link'

export const metadata = {
  title: '疼痛部位簡表 | WELLSPRING Wellness Center',
  description: '請填寫疼痛部位與症狀摘要，協助醫師為您安排針灸或疼痛調理。',
}

export default function PainSummaryPage() {
  return (
    <main className="min-h-screen bg-[#faf8f2] px-6 py-20">
      <section className="mx-auto max-w-3xl rounded-3xl border border-[#D8E2D7] bg-white p-10 shadow-[0_12px_28px_rgba(53,92,70,0.1)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6F8A72]">疼痛部位簡表</p>
        <h1 className="mt-4 text-3xl font-semibold text-[#355C46]">感謝您的預約</h1>
        <p className="mt-4 text-base leading-7 text-[#343A36]/90">
          若您選擇「疼痛／針灸初診」，請繼續填寫疼痛部位與症狀摘要，協助我們更快速掌握您的疼痛來源與初診安排。
        </p>
        <div className="mt-8 space-y-4 rounded-3xl bg-[#F7F4EB] p-6 text-[#343A36] shadow-sm">
          <p className="text-sm text-[#6F8A72]">下一步指引</p>
          <p className="text-sm leading-7">
            這裡會引導您描述疼痛位置、疼痛強度與觸發情況，讓醫師能在初診時更精準評估您的療程需求。
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
