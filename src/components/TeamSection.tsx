interface Doctor {
  id: string
  name: string
  title: string
  specialty: string
  experience: string
  bio: string
}

const doctors: Doctor[] = [
  {
    id: '1',
    name: '李明智',
    title: '院長',
    specialty: '內科調理',
    experience: '15年臨床經驗',
    bio: '國家高級中醫師，擅長體質調理與慢性病管理，深受患者信賴。',
  },
  {
    id: '2',
    name: '王芳妤',
    title: '主任醫師',
    specialty: '婦科調理',
    experience: '8年臨床經驗',
    bio: '專攻女性健康，特別擅長月經調理與更年期症狀改善。',
  },
  {
    id: '3',
    name: '張瑋翔',
    title: '醫師',
    specialty: '骨傷科',
    experience: '15年臨床經驗',
    bio: '專精於推拿、拔罐等物理療法，幫助患者快速恢復。',
  },
  {
    id: '4',
    name: '陳雅琪',
    title: '醫師',
    specialty: '針灸推拿',
    experience: '12年臨床經驗',
    bio: '運用針灸、艾灸等傳統療法，改善各類疼痛與功能障礙。',
  },
]

export default function TeamSection() {
  return (
    <section id="team" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-tcm-green font-medium text-sm tracking-widest uppercase">
            醫療團隊
          </span>
          <h2 className="section-title mt-4">
            專業的醫師團隊
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            每位醫師都擁有豐富的臨床經驗和專業知識
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="group bg-gradient-to-br from-white to-tcm-beige/10 rounded-xl overflow-hidden border border-gray-100 hover:border-tcm-green/30 transition-all duration-300 hover:shadow-lg"
            >
              {/* Avatar placeholder */}
              <div className="h-48 bg-gradient-to-br from-tcm-green/20 to-tcm-light-green/10 flex items-center justify-center overflow-hidden relative">
                <svg
                  className="w-24 h-24 text-tcm-green/40"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-tcm-dark mb-2">
                  {doctor.name}
                </h3>
                <p className="text-tcm-green font-medium text-sm mb-3">
                  {doctor.title} / {doctor.specialty}
                </p>
                <p className="text-sm text-gray-500 mb-3">{doctor.experience}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {doctor.bio}
                </p>

                {/* Contact button */}
                <button className="w-full py-2 rounded-lg bg-tcm-beige/50 text-tcm-green font-medium hover:bg-tcm-green hover:text-white transition-colors text-sm">
                  預約諮詢
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-16 bg-tcm-beige/30 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-tcm-dark mb-3">
            尋找適合您的醫師
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            每位患者都有獨特的需求。我們提供初診諮詢服務，幫助您找到最適合您的醫師進行治療。
          </p>
          <a href="/#booking" className="btn-primary">
            預約諮詢
          </a>
        </div>
      </div>
    </section>
  )
}
