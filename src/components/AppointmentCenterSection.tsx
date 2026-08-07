const appointmentCenterItems = [
  {
    id: 'initial-visit',
    title: '初診預約',
    description: '快速安排第一堂診療，系統將引導您完成初診需求與預約時段選擇。',
  },
  {
    id: 'return-visit',
    title: '複診預約',
    description: '方便管理後續複診計畫，快速預約追蹤門診與後續療程。',
  },
  {
    id: 'ai-questionnaire',
    title: 'AI 初診問卷',
    description: '以 AI 問卷收集健康資訊，協助醫師了解您的體質與症狀。',
  },
  {
    id: 'health-profile',
    title: '健康資料填寫',
    description: '填寫生活型態、既往病史與用藥資訊，建立完整預約紀錄。',
  },
  {
    id: 'appointment-search',
    title: '預約查詢 / 取消',
    description: '查看既有預約與取消不需要的時段，保持預約資訊最新。',
  },
  {
    id: 'modify-appointment',
    title: '修改預約',
    description: '變更預約時間、診療項目或診間安排，讓看診更彈性便利。',
  },
  {
    id: 'waiting-list',
    title: '候補名單',
    description: '開啟候補名單接收更早診次通知，爭取更快看診機會。',
  },
  {
    id: 'follow-up-reminder',
    title: '回診提醒',
    description: '自動提醒回診時間與注意事項，維持療程連續性。',
  },
]

export default function AppointmentCenterSection() {
  return (
    <section id="appointment-center" className="rounded-[40px] border border-[#D9D5CC] bg-white p-8 shadow-sm sm:p-10">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6F8A72]">2.</p>
        <h2 className="mt-4 text-3xl font-semibold text-[#355C46] sm:text-4xl">線上預約中心</h2>
        <p className="mt-4 text-base leading-7 text-[#343A36]/90">
          整合常見預約功能，讓您一站式管理初診、複診、問卷、資料與回診提醒。
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {appointmentCenterItems.map((item, index) => (
          <article
            key={item.id}
            className="rounded-3xl border border-[#E3E0D6] bg-[#FBFAF5] p-6 shadow-[0_12px_30px_rgba(84,96,80,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(84,96,80,0.14)]"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF5EB] text-lg font-semibold text-[#365E45]">
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold text-[#2F503E]">{item.title}</h3>
            </div>
            <p className="text-sm leading-6 text-[#4D5C50]">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
