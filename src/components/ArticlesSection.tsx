interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
}

const articles: Article[] = [
  {
    id: '1',
    title: '四季養生之春季調理要點',
    excerpt:
      '春季是萬物生發的季節，中醫認為春季應該順應自然規律，著重調理肝臟功能，培養陽氣。',
    category: '養生保健',
    date: '2024年6月1日',
    readTime: '5分鐘',
  },
  {
    id: '2',
    title: '體質辨識：認識你的中醫體質',
    excerpt:
      '中醫強調「辨體論治」，了解自己的體質類型是制定個性化調理方案的第一步。',
    category: '體質調理',
    date: '2024年5月28日',
    readTime: '7分鐘',
  },
  {
    id: '3',
    title: '中醫調理失眠的方法',
    excerpt:
      '失眠困擾著許多現代人。中醫從脾、心、腎等多個臟腑角度進行調理，效果顯著。',
    category: '常見疾病',
    date: '2024年5月20日',
    readTime: '6分鐘',
  },
  {
    id: '4',
    title: '針灸療法在運動傷害中的應用',
    excerpt:
      '針灸是中醫的重要療法，對於運動損傷、肌肉酸痛等問題有快速舒緩的效果。',
    category: '療法介紹',
    date: '2024年5月15日',
    readTime: '5分鐘',
  },
]

export default function ArticlesSection() {
  return (
    <section id="articles" className="py-20 md:py-28 bg-tcm-beige/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-tcm-green font-medium text-sm tracking-widest uppercase">
            健康專欄
          </span>
          <h2 className="section-title mt-4">
            中醫健康知識分享
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            定期更新關於中醫養生、體質調理、常見疾病的專業知識
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <article
              key={article.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-tcm-green/30 flex flex-col"
            >
              {/* Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-tcm-green/10 to-tcm-light-green/10 relative overflow-hidden flex items-center justify-center">
                <div className="text-6xl opacity-30 group-hover:scale-110 transition-transform duration-300">
                  📖
                </div>
                <div className="absolute top-4 right-4 bg-tcm-gold/20 text-tcm-green px-3 py-1 rounded-full text-xs font-medium">
                  {article.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-tcm-dark mb-3 group-hover:text-tcm-green transition-colors">
                  {article.title}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-4 flex-grow">
                  {article.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>

                {/* Read more */}
                <a
                  href="#"
                  className="inline-flex items-center text-tcm-green font-medium mt-4 hover:gap-2 transition-all gap-1 group-hover:text-tcm-light-green"
                >
                  閱讀全文
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
            </article>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center mt-16">
          <a href="#" className="btn-secondary">
            查看更多文章
          </a>
        </div>
      </div>
    </section>
  )
}
