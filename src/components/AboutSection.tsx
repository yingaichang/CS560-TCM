export default function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="fade-in">
            <span className="text-tcm-green font-medium text-sm tracking-widest uppercase">
              關於診所
            </span>
            <h2 className="section-title mt-4">
              在這裡，我們用心守護每一個生命
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              YUAN中醫診所成立於2008年，始終秉持著「傳承古智，創新療法」的理念，為患者提供最專業、最溫暖的醫療服務。
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-tcm-green/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-tcm-green"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">專業醫療團隊</h3>
                  <p className="text-gray-600 text-sm">
                    由經驗豐富的中醫師組成，每位都擁有15年以上的臨床經驗
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-tcm-green/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-tcm-green"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">現代化設備</h3>
                  <p className="text-gray-600 text-sm">
                    引進國際先進診療設備，結合傳統療法與現代科技
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-tcm-green/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-tcm-green"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">溫暖舒適環境</h3>
                  <p className="text-gray-600 text-sm">
                    打造如家般溫暖的就診環境，讓患者感到放鬆與安心
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              我們相信每個人都值得擁有健康與幸福。無論您是初次就診還是長期調理患者，我們都準備好用最專業的態度和最溫暖的服務，陪伴您走向健康之路。
            </p>
          </div>

          {/* Image */}
          <div className="relative h-96 md:h-full rounded-2xl overflow-hidden shadow-xl slide-in-right">
            <div className="absolute inset-0 bg-gradient-to-br from-tcm-green/20 to-tcm-light-green/20 z-10"></div>
            <div className="w-full h-full bg-gradient-to-br from-tcm-beige to-tcm-light-green/30 flex items-center justify-center">
              {/* Placeholder image - replace with actual clinic image */}
              <div className="text-center">
                <svg
                  className="w-32 h-32 mx-auto text-tcm-green/30 mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <p className="text-tcm-green/50 font-medium">診所環境照片</p>
                <p className="text-sm text-gray-400 mt-1">
                  請替換為實際診所照片
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
