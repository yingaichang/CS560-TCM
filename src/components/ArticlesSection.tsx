import { healthTopics } from '@/lib/healthTopics'

export default function ArticlesSection() {
  return (
    <section id="articles" className="py-20 md:py-28 bg-tcm-beige/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-tcm-green font-medium text-sm tracking-widest uppercase">
            健康學院
          </span>
          <h2 className="section-title mt-4">
            健康學院主題講座
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            點選下方主題報名，即可前往付款表單完成講座註冊
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {healthTopics.map((topic) => (
            <article
              key={topic.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-tcm-green/30 flex flex-col"
            >
              <div className="h-16 bg-gradient-to-r from-tcm-green/10 to-tcm-light-green/10 relative overflow-hidden flex items-center px-6">
                <div className="bg-tcm-green/10 text-tcm-green px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm ring-1 ring-tcm-green/20">
                  健康學院
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-tcm-dark mb-3 group-hover:text-tcm-green transition-colors">
                  {topic.topic}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-4 flex-grow">
                  {topic.summary}
                </p>

                <div className="grid grid-cols-1 gap-2 pt-4 border-t border-gray-100 text-sm text-gray-700">
                  <span className="inline-flex w-fit items-center rounded-full bg-tcm-green/10 px-4 py-2 font-medium text-tcm-green shadow-sm ring-1 ring-tcm-green/20">日期：{topic.date}</span>
                  <span className="inline-flex w-fit items-center rounded-full bg-tcm-green/10 px-4 py-2 font-medium text-tcm-green shadow-sm ring-1 ring-tcm-green/20">時間：{topic.time}</span>
                  <span className="inline-flex w-fit items-center rounded-full bg-tcm-green/10 px-4 py-2 font-medium text-tcm-green shadow-sm ring-1 ring-tcm-green/20">講者：{topic.presenter}</span>
                  <span className="inline-flex w-fit items-center rounded-full bg-tcm-green/10 px-4 py-2 font-medium text-tcm-green shadow-sm ring-1 ring-tcm-green/20">地點：{topic.location}</span>
                </div>

                <a
                  href={`/payment?topic=${topic.id}`}
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/60 bg-[#2f5d3a] px-6 py-3 text-sm font-semibold text-white mt-6 shadow-lg shadow-tcm-green/25 transition hover:-translate-y-0.5 hover:bg-[#24482d] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-tcm-green focus:ring-offset-2 sm:w-auto"
                >
                  預約登記
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
