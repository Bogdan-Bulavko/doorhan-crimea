// Обязательно для статического экспорта
export const dynamic = 'force-static';

import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import ProductGrid from '@/components/ProductGrid';
import AboutSection from '@/components/AboutSection';
import ContactsSection from '@/components/ContactsSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <ProductGrid />
      <AboutSection />
      <ContactsSection />
    </main>
  );
}
