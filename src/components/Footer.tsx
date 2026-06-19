export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-tcm-dark text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-tcm-green to-tcm-light-green rounded-full flex items-center justify-center font-bold text-lg">
                元
              </div>
              <div>
                <h3 className="text-xl font-bold">YUAN</h3>
                <p className="text-sm text-gray-300">中醫診所</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              傳統中醫智慧與現代醫療的完美結合，守護您與家人的健康。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-tcm-gold">快速連結</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  關於診所
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  診療服務
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  醫師團隊
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  健康專欄
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4 text-tcm-gold">主要服務</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  AI體質分析
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  中藥調理
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  健康教育
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  長期健康管理
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-tcm-gold">聯絡資訊</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex gap-2">
                <span>📍</span>
                <span>台北市中山區民生東路123號</span>
              </li>
              <li className="flex gap-2">
                <span>☎️</span>
                <span>(02) 2567-8901</span>
              </li>
              <li className="flex gap-2">
                <span>🕐</span>
                <span>一 - 五: 09:00 - 20:00</span>
              </li>
              <li className="text-sm">六日：09:00 - 17:00</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} YUAN 中醫診所. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors text-sm">
                隱私政策
              </a>
              <a href="#" className="hover:text-white transition-colors text-sm">
                服務條款
              </a>
              <a href="#" className="hover:text-white transition-colors text-sm">
                聯絡我們
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
