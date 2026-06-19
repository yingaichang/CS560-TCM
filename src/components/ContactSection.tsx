'use client'

import { FormEvent, useState } from 'react'

export default function ContactSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        })

        setTimeout(() => {
          setSubmitted(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: '📍',
      label: '地址',
      content: '台北市中山區民生東路123號',
      subtext: '3樓診療室',
    },
    {
      icon: '☎️',
      label: '電話',
      content: '(02) 2567-8901',
      subtext: '服務時間內來電',
    },
    {
      icon: '📧',
      label: '電郵',
      content: 'info@yuanclinic.com.tw',
      subtext: '24小時服務信箱',
    },
    {
      icon: '🕐',
      label: '營業時間',
      content: '一 - 五: 09:00 - 20:00',
      subtext: '六日: 09:00 - 17:00，周一休診',
    },
  ]

  return (
    <section id="contact" className="py-20 md:py-28 bg-tcm-beige/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-tcm-green font-medium text-sm tracking-widest uppercase">
            聯絡我們
          </span>
          <h2 className="section-title mt-4">
            與我們取得聯繫
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            有任何問題或疑問？我們很樂意為您服務
          </p>
        </div>

        {/* Contact Info Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100 text-center"
            >
              <div className="text-4xl mb-4">{info.icon}</div>
              <h3 className="font-bold text-tcm-dark mb-2">{info.label}</h3>
              <p className="font-medium text-tcm-green mb-1">{info.content}</p>
              <p className="text-sm text-gray-500">{info.subtext}</p>
            </div>
          ))}
        </div>

        {/* Main content with form and map */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-tcm-dark mb-6">
              發送訊息給我們
            </h3>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✓ 感謝您的訊息！我們會盡快回覆。
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                  placeholder="您的姓名"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  電郵 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  主旨 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                  placeholder="訊息主旨"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  訊息 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition resize-none"
                  placeholder="請告訴我們您的訊息..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-2 font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? '發送中...' : '發送訊息'}
              </button>
            </form>
          </div>

          {/* Map and Info */}
          <div>
            {/* Map placeholder */}
            <div className="bg-gradient-to-br from-tcm-green/20 to-tcm-light-green/10 rounded-2xl h-96 flex items-center justify-center border border-gray-100 mb-8">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto text-tcm-green/50 mb-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <p className="text-tcm-green font-medium">Google Maps</p>
                <p className="text-sm text-gray-400 mt-1">
                  將在此處嵌入診所地圖
                </p>
              </div>
            </div>

            {/* Quick info boxes */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-md">
                <h4 className="font-bold text-tcm-dark mb-3">交通方式</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>🚇 捷運：中山站3號出口</li>
                  <li>🚌 公車：15、30、紅33路線</li>
                  <li>🅿️ 停車：現場付費停車位</li>
                </ul>
              </div>

              <div className="bg-tcm-beige/50 rounded-xl p-6 border border-tcm-green/20">
                <h4 className="font-bold text-tcm-dark mb-3">網上預約優惠</h4>
                <p className="text-sm text-gray-600">
                  通過本網站預約首次診療，即可享受8折優惠！
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
