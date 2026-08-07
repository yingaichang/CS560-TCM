export default function HealthDashboardSection() {
  return (
    <section className="bg-[#FAF8F2] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="rounded-[2.5rem] border border-[#D9E3CF] bg-white p-8 shadow-[0_18px_35px_rgba(53,92,70,0.08)] md:p-12">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6F8A72]">HEALTH PULSE</p>
            <h2 className="mt-4 text-3xl font-semibold text-[#355C46] sm:text-4xl">個人健康儀表板</h2>
            <p className="mt-4 text-base leading-7 text-[#343A36]/90">
              首次完成問卷後，系統會整合睡眠、壓力、慢性風險等資訊，提供您更具體的健康洞察與追蹤建議。
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.8rem] border border-[#D9E3CF] bg-[#FBFAF5] p-6 shadow-[0_10px_25px_rgba(70,100,77,0.08)]">
              <p className="text-sm font-semibold text-[#355C46]">睡眠品質分數</p>
              <p className="mt-3 text-3xl font-semibold text-[#2F503E]">--</p>
              <p className="mt-3 text-sm leading-7 text-[#4D5C50]">完成問卷後顯示，依個人日常紀錄更新。</p>
            </div>
            <div className="rounded-[1.8rem] border border-[#D9E3CF] bg-[#FBFAF5] p-6 shadow-[0_10px_25px_rgba(70,100,77,0.08)]">
              <p className="text-sm font-semibold text-[#355C46]">壓力平衡指數</p>
              <p className="mt-3 text-3xl font-semibold text-[#2F503E]">--</p>
              <p className="mt-3 text-sm leading-7 text-[#4D5C50]">連動資料後顯示，提供呼吸與作息建議。</p>
            </div>
            <div className="rounded-[1.8rem] border border-[#D9E3CF] bg-[#FBFAF5] p-6 shadow-[0_10px_25px_rgba(70,100,77,0.08)]">
              <p className="text-sm font-semibold text-[#355C46]">慢性風險提醒</p>
              <p className="mt-3 text-3xl font-semibold text-[#2F503E]">--</p>
              <p className="mt-3 text-sm leading-7 text-[#4D5C50]">醫師評估後顯示，搭配定期複評追蹤。</p>
            </div>
          </div>

          <div className="mt-10 border-t border-[#E6E2D7] pt-8">
            <a
              href="#services"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#355C46] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(53,92,70,0.18)] transition hover:bg-[#2e503c]"
            >
              查看完整平台方案
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
