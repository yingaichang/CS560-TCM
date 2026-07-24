export default function Footer() {
  return (
    <footer className="mt-20 bg-[#355C46] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-lg font-semibold">
                瀛
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-[0.12em]">瀛愛全人健康管理中心</h3>
                <p className="font-brand text-sm tracking-[0.05em] text-white/78">WELLSPRING Wellness Center</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-white/75">
              AI 智慧中醫健康管理平台，結合中醫診療、預防醫學、健康教育與長期追蹤，
              讓個人與家庭擁有更穩定的健康生活。
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-[#A78D60]">網站連結</h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <a href="#about" className="transition-colors hover:text-white">
                  關於我們
                </a>
              </li>
              <li>
                <a href="#services" className="transition-colors hover:text-white">
                  診療服務
                </a>
              </li>
              <li>
                <a href="/ai-health-analysis" className="transition-colors hover:text-white">
                  AI 健康分析
                </a>
              </li>
              <li>
                <a href="/health-academy" className="transition-colors hover:text-white">
                  健康學院
                </a>
              </li>
              <li>
                <a href="/courses-events" className="transition-colors hover:text-white">
                  課程與活動
                </a>
              </li>
              <li>
                <a href="/patient-center" className="transition-colors hover:text-white">
                  病人中心
                </a>
              </li>
              <li>
                <a href="/coming-soon?feature=health-store" className="transition-colors hover:text-white">
                  健康商城
                </a>
              </li>
              <li>
                <a href="/faq" className="transition-colors hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-[#A78D60]">聯絡資料</h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li>地址：地址 placeholder</li>
              <li>電話：電話 placeholder</li>
              <li>Email：Email placeholder</li>
              <li>LINE 官方帳號：LINE 官方帳號 placeholder</li>
              <li>微信：微信 placeholder</li>
              <li>營業時間：營業時間 placeholder</li>
              <li>Google 地圖：Google 地圖 placeholder</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-[#A78D60]">法律與聲明</h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <a href="/coming-soon?feature=privacy-policy" className="transition-colors hover:text-white">
                  隱私權政策
                </a>
              </li>
              <li>
                <a href="/coming-soon?feature=terms-of-use" className="transition-colors hover:text-white">
                  使用條款
                </a>
              </li>
              <li>
                <a href="/coming-soon?feature=hipaa-pdpa" className="transition-colors hover:text-white">
                  HIPAA／個資相關聲明 placeholder
                </a>
              </li>
              <li>
                <a href="/coming-soon?feature=ai-health-disclaimer" className="transition-colors hover:text-white">
                  AI 健康資訊免責聲明
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex justify-center">
            <p className="text-sm text-white/60">© 2026 WELLSPRING Wellness Center. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
