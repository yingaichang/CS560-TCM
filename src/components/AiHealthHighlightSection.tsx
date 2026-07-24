const highlights = [
  '體質與生活型態分析',
  '飲食、作息與穴位保健建議',
  '個人健康趨勢追蹤',
  '可與專業診療及回診紀錄連結',
]

export default function AiHealthHighlightSection() {
  return (
    <section className="relative overflow-hidden bg-[#f4efe5] py-20 md:py-24">
      <div className="pointer-events-none absolute -left-16 top-14 h-56 w-56 rounded-full bg-[#d6c7aa]/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#9fb69a]/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 md:px-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:px-12">
        {/* TODO: Replace this mock report panel with final visual asset, e.g. /images/ai-health-dashboard.webp */}
        <article className="rounded-3xl border border-[#b8c7b3]/45 bg-[#fffaf2] p-6 shadow-[0_16px_34px_rgba(72,98,76,0.1)] md:p-7">
          <div className="flex items-center justify-between border-b border-[#d6dfd3] pb-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-[#4c6852]">AI HEALTH REPORT</p>
              <p className="mt-1 text-sm text-[#5d6c61]">個人健康概覽</p>
            </div>
            <span className="rounded-full border border-[#97af94]/45 bg-[#f0f6ed] px-3 py-1 text-xs font-medium text-[#436449]">
              本週更新
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#d8e2d5] bg-white/80 p-4">
              <p className="text-xs tracking-[0.1em] text-[#6b7c71]">體質</p>
              <p className="mt-2 text-lg font-semibold text-[#304f3e]">氣虛偏濕</p>
              <p className="mt-1 text-xs leading-6 text-[#607064]">建議先調整睡眠與晚間飲食節奏</p>
            </div>
            <div className="rounded-2xl border border-[#d8e2d5] bg-white/80 p-4">
              <p className="text-xs tracking-[0.1em] text-[#6b7c71]">睡眠</p>
              <p className="mt-2 text-lg font-semibold text-[#304f3e]">6.2 小時</p>
              <p className="mt-1 text-xs leading-6 text-[#607064]">近 14 天入睡時間波動較大</p>
            </div>
            <div className="rounded-2xl border border-[#d8e2d5] bg-white/80 p-4">
              <p className="text-xs tracking-[0.1em] text-[#6b7c71]">飲食</p>
              <p className="mt-2 text-lg font-semibold text-[#304f3e]">晚餐偏晚</p>
              <p className="mt-1 text-xs leading-6 text-[#607064]">建議晚間減少冰冷與高糖攝取</p>
            </div>
            <div className="rounded-2xl border border-[#d8e2d5] bg-white/80 p-4">
              <p className="text-xs tracking-[0.1em] text-[#6b7c71]">壓力</p>
              <p className="mt-2 text-lg font-semibold text-[#304f3e]">中度偏高</p>
              <p className="mt-1 text-xs leading-6 text-[#607064]">建議每天固定放鬆與呼吸練習</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#c8d6c4] bg-[#f5faef] p-4">
            <p className="text-xs font-semibold tracking-[0.1em] text-[#44654a]">追蹤建議</p>
            <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#526257]">
              <li>1. 連續 7 天記錄睡眠時間與醒來精神狀態</li>
              <li>2. 每週 3 次晚間穴位保健與伸展</li>
              <li>3. 兩週後回填問卷，更新個人趨勢</li>
            </ul>
          </div>
        </article>

        <div>
          <p className="text-sm font-semibold tracking-[0.16em] text-[#4c6852]">AI 健康分析</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-[#2d4b3b] sm:text-4xl">
            更早了解身體訊號，
            <br />
            建立適合自己的健康方向
          </h2>

          <p className="mt-6 text-base leading-8 text-[#4f6056] md:text-lg">
            AI 工具協助整理個人問卷、生活習慣與健康紀錄，提供健康教育與個人化管理方向，並由中醫專業人員進一步評估。
          </p>

          <ul className="mt-7 space-y-3 text-sm text-[#42564a] md:text-base">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl border border-[#c6d5c2]/55 bg-white/66 px-4 py-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#44654a]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <a
            href="/ai-health-analysis"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#3c6346] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(60,99,70,0.24)] transition hover:-translate-y-0.5 hover:bg-[#33563c]"
          >
            開始 AI 體質分析
          </a>

          <p className="mt-6 rounded-2xl border border-[#d6d3c7] bg-[#fffaf1]/88 px-4 py-3 text-xs leading-6 text-[#5e6159] md:text-sm">
            健康與醫療聲明：AI 分析結果僅作為健康教育與輔助資訊，不能取代醫師診斷、治療或緊急醫療服務。如有不適或緊急症狀，請立即就醫。
          </p>
        </div>
      </div>
    </section>
  )
}