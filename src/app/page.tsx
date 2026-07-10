import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroBanner from '@/components/HeroBanner'
import AboutSection from '@/components/AboutSection'
import ServicesSection from '@/components/ServicesSection'
import TeamSection from '@/components/TeamSection'
import ArticlesSection from '@/components/ArticlesSection'
import AppointmentForm from '@/components/AppointmentForm'
import ContactSection from '@/components/ContactSection'

export const metadata = {
  title: 'YUAN 中醫診所 | 傳統中醫智慧守護您的健康',
  description:
    '結合古老智慧與現代科技的高質感中醫診所。提供AI體質分析、中藥調理、針灸推拿等專業診療服務。',
  keywords: '中醫, 中醫診所, 中藥調理, 針灸, 健康管理, 台北',
  authors: [{ name: 'YUAN Clinic' }],
  openGraph: {
    title: 'YUAN 中醫診所',
    description: '傳統中醫智慧守護您的健康',
    type: 'website',
  },
}

export default function Home() {
  return (
    <main className="bg-cream">
      <Header />
      <HeroBanner />
      <AboutSection />
      <ServicesSection />
      <TeamSection />
      <ArticlesSection />
      <AppointmentForm />
      <ContactSection />
      <Footer />
    </main>
  )
}
