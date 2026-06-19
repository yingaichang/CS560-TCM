interface Service {
  icon: string
  title: string
  description: string
}

const services: Service[] = [
  {
    icon: '🧬',
    title: 'AI體質分析',
    description:
      '利用先進的AI技術結合中醫體質理論，精準分析您的體質類型，制定個性化的調理方案。',
  },
  {
    icon: '🌿',
    title: '中藥調理',
    description:
      '精選上等中藥材，根據患者體質和病況，由經驗豐富的中醫師親自配方調理。',
  },
  {
    icon: '📚',
    title: '健康教育',
    description:
      '定期舉辦健康講座和工作坊，幫助患者了解中醫養生知識和健康生活方式。',
  },
  {
    icon: '💚',
    title: '長期健康管理',
    description:
      '提供完整的健康管理計畫，透過定期評估和調整，幫助患者維持最佳健康狀態。',
  },
]

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 md:py-28 bg-tcm-beige/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-tcm-green font-medium text-sm tracking-widest uppercase">
            主要服務
          </span>
          <h2 className="section-title mt-4">
            我們提供四大診療服務
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            以患者為中心，結合傳統中醫智慧與現代醫療技術
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px] border border-gray-100"
            >
              {/* Icon */}
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-tcm-dark mb-4">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {service.description}
              </p>

              {/* Learn more link */}
              <a
                href="#"
                className="inline-flex items-center text-tcm-green font-medium hover:gap-2 transition-all gap-1"
              >
                了解更多
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            想了解更多服務？預約諮詢由專業醫師為您評估。
          </p>
          <a href="/#booking" className="btn-primary">
            預約初診
          </a>
        </div>
      </div>
    </section>
  )
}
