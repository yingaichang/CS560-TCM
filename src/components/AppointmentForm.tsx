'use client'

import { FormEvent, useState } from 'react'

const services = [
  '初診諮詢',
  'AI體質分析',
  '中藥調理',
  '針灸推拿',
  '拔罐療法',
]

export default function AppointmentForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    service: services[0],
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
      const response = await fetch('/api/appointments', {
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
          phone: '',
          date: '',
          service: services[0],
          message: '',
        })

        // Reset message after 5 seconds
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

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <section id="booking" className="py-20 md:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-tcm-green font-medium text-sm tracking-widest uppercase">
            預約服務
          </span>
          <h2 className="section-title mt-4">
            立即預約您的診療
          </h2>
          <p className="section-subtitle">
            請填寫以下資訊，我們會儘快與您聯繫確認預約時間
          </p>
        </div>

        <div className="bg-gradient-to-br from-white via-tcm-beige/10 to-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✓ 感謝您的預約！我們會在24小時內與您聯繫。
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
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
                placeholder="請輸入您的姓名"
              />
            </div>

            {/* Email and Phone */}
            <div className="grid md:grid-cols-2 gap-6">
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
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  電話號碼 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                  placeholder="(02) XXXX-XXXX"
                />
              </div>
            </div>

            {/* Date and Service */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  預約日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={today}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label
                  htmlFor="service"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  選擇服務 <span className="text-red-500">*</span>
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition"
                >
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                備註訊息（選填）
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tcm-green focus:border-transparent outline-none transition resize-none"
                placeholder="請告訴我們任何關於您的健康狀況或特殊需求..."
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? '處理中...' : '確認預約'}
            </button>

            {/* Note */}
            <p className="text-sm text-gray-500 text-center">
              提交後，我們將在24小時內通過電郵或電話與您聯繫確認預約。
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
