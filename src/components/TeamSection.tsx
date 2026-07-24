interface CareTrack {
  id: string
  title: string
  focus: string
  detail: string
  cadence: string
}

const tracks: CareTrack[] = [
  {
    id: '1',
    title: '壓力與睡眠優化計畫',
    focus: '睡眠不足、焦慮與自律神經失衡',
    cadence: '每週追蹤',
    detail: '結合 AI 量表與中醫調理方案，並搭配呼吸訓練與作息校正。',
  },
  {
    id: '2',
    title: '疼痛與骨骼功能照護',
    focus: '肩頸腰背疼痛、關節不適',
    cadence: '每 2 週追蹤',
    detail: '透過針灸、推拿與動作建議降低疼痛，並持續追蹤生活中的復發因子。',
  },
  {
    id: '3',
    title: '女性週期與內分泌管理',
    focus: '經期不規律、更年期不適',
    cadence: '每月追蹤',
    detail: '以中醫辨證與生活型態記錄調整照護節奏，建立穩定的週期健康計畫。',
  },
  {
    id: '4',
    title: '慢性病與銀髮支持方案',
    focus: '血壓、血糖與高齡生活管理',
    cadence: '每月複評',
    detail: '結合門診追蹤、飲食建議與家庭健康帳戶，協助長輩穩定日常指標。',
  },
]

export default function TeamSection() {
  return (
    <section id="team" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-sm font-medium tracking-[0.18em] text-primary">CARE JOURNEY</span>
          <h2 className="section-title mt-4">從評估到追蹤的照護旅程</h2>
          <p className="section-subtitle mx-auto mb-12 max-w-3xl">
            平台將使用者需求轉為可執行路徑，讓中醫照護、健康教育與日常習慣維持在同一節奏。
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="group rounded-3xl border border-primary/10 bg-[linear-gradient(180deg,#ffffff_0%,#f8f4ea_100%)] p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_18px_45px_rgba(70,100,77,0.14)]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 text-lg font-semibold text-primary">
                0{index + 1}
              </div>
              <h3 className="text-lg font-semibold text-primary">{track.title}</h3>
              <p className="mt-2 text-sm font-medium text-wood">{track.focus}</p>
              <p className="mt-3 text-sm leading-7 text-ink/80">{track.detail}</p>
              <p className="mt-4 inline-flex rounded-full border border-primary/15 px-3 py-1 text-xs font-medium tracking-[0.08em] text-primary">
                {track.cadence}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 rounded-3xl border border-primary/10 bg-surface p-8 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-wood">STEP 1</p>
            <h3 className="mt-2 text-xl font-semibold text-primary">初始評估</h3>
            <p className="mt-2 text-sm leading-7 text-ink/80">完成問卷、症狀登錄與生活型態盤點。</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-wood">STEP 2</p>
            <h3 className="mt-2 text-xl font-semibold text-primary">門診計畫</h3>
            <p className="mt-2 text-sm leading-7 text-ink/80">中醫師制定階段性照護與療程安排。</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-wood">STEP 3</p>
            <h3 className="mt-2 text-xl font-semibold text-primary">AI 追蹤優化</h3>
            <p className="mt-2 text-sm leading-7 text-ink/80">依據追蹤結果動態調整日常任務與療程。</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="mx-auto max-w-3xl text-base text-ink/85">
            你可以先從一次健康諮詢開始，再逐步擴展成個人或家庭的全年健康管理方案。
          </p>
          <a href="#appointment" className="btn-primary mt-6">
            開始健康旅程
          </a>
        </div>
      </div>
    </section>
  )
}
