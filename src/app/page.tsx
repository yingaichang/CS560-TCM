import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroBanner from '@/components/HeroBanner'
import HealthJourneySection from '@/components/HealthJourneySection'
import CoreServicesSection from '@/components/CoreServicesSection'
import AiAcademySplitSection from '@/components/AiAcademySplitSection'
import LongTermHealthManagementSection from '@/components/LongTermHealthManagementSection'
import CoursesCommunitySection from '@/components/CoursesCommunitySection'
import PatientTestimonialsSection from '@/components/PatientTestimonialsSection'
import MembershipPreviewSection from '@/components/MembershipPreviewSection'
import HealthStorePreviewSection from '@/components/HealthStorePreviewSection'
import FinalCtaSection from '@/components/FinalCtaSection'
import AboutSection from '@/components/AboutSection'
import ServicesSection from '@/components/ServicesSection'
import TeamSection from '@/components/TeamSection'
import ArticlesSection from '@/components/ArticlesSection'
import HealthDashboardSection from '@/components/HealthDashboardSection'
import ContactSection from '@/components/ContactSection'

export const metadata = {
  title: '愛中醫健康管理中心 | AI TCM HEALTH MANAGEMENT CENTER',
  description:
    'AI 健康分析 × 中醫診療 × 預防醫學 × 健康教育 × 長期健康管理，打造可持續擴充的全人健康平台。',
  keywords: 'AI健康管理, 中醫診療, 針灸, 慢性病管理, 預防醫學, 健康教育',
  authors: [{ name: 'AI TCM HEALTH MANAGEMENT CENTER' }],
  openGraph: {
    title: '愛中醫健康管理中心',
    description: 'AI 智慧中醫健康管理平台',
    type: 'website',
  },
}

export default function Home() {
  return (
    <main className="bg-cream">
      <Header />
      <HeroBanner />
      <HealthJourneySection />
      <CoreServicesSection />
      <AiAcademySplitSection />
      <LongTermHealthManagementSection />
      <CoursesCommunitySection />
      <PatientTestimonialsSection />
      <MembershipPreviewSection />
      <HealthStorePreviewSection />
      <AboutSection />
      <ServicesSection />
      <HealthDashboardSection />
      <TeamSection />
      <ArticlesSection />
      <ContactSection />
      <FinalCtaSection />
      <Footer />
    </main>
  )
}
