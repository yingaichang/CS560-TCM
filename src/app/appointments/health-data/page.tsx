import Link from 'next/link'

export const metadata = {
  title: '健康資料填寫 | WELLSPRING Wellness Center',
  description: '填寫基本健康資料，幫助我們為您安排更適切的初診服務。',
}

export default function HealthDataPage() {
  return (
    <main className="min-h-screen bg-[#faf8f2] px-6 py-20">
      <section className="mx-auto max-w-3xl rounded-3xl border border-[#D8E2D7] bg-white p-10 shadow-[0_12px_28px_rgba(53,92,70,0.1)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6F8A72]">健康資料填寫</p>
        <h1 className="mt-4 text-3xl font-semibold text-[#355C46]">感謝您完成預約</h1>
        <p className="mt-4 text-base leading-7 text-[#343A36]/90">
          為了進一步準備您的初診服務，請前往健康資料填寫頁面，補充您的生活習慣、過往病史與用藥情況。
        </p>
        <div className="mt-8 space-y-4 rounded-3xl bg-[#F7F4EB] p-6 text-[#343A36] shadow-sm">
          <p className="text-sm text-[#6F8A72]">下一步指引</p>
          <p className="text-sm leading-7">
            這裡會協助我們建立完整的初診紀錄，讓醫師在第一次看診時能快速掌握您的健康背景。
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
