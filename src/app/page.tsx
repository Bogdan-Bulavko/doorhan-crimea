// Обязательно для статического экспорта
export const dynamic = 'force-static';

import { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import VideoSection from '@/components/VideoSection';
import StatsSection from '@/components/StatsSection';
import ProductGrid from '@/components/ProductGrid';
import AboutSection from '@/components/AboutSection';
import ContactsSection from '@/components/ContactsSection';

export const metadata: Metadata = {
  title: 'DoorHan Крым | Ворота и автоматика',
  description: 'Официальный представитель DoorHan в Крыму. Ворота, роллеты, автоматические системы. Качество и надежность с 1993 года.',
  keywords: 'DoorHan, ворота, роллеты, автоматика, Крым, гаражные ворота, рольставни',
  openGraph: {
    title: 'DoorHan Крым | Ворота и автоматика',
    description: 'Официальный представитель DoorHan в Крыму. Ворота, роллеты, автоматические системы.',
    url: 'https://doorhan-crimea',
    siteName: 'DoorHan Крым',
    images: [
      {
        url: '/doorhan-crimea/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DoorHan Крым',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DoorHan Крым | Ворота и автоматика',
    description: 'Официальный представитель DoorHan в Крыму. Ворота, роллеты, автоматические системы.',
    images: ['/doorhan-crimea/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://doorhan-crimea',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <VideoSection />
      <StatsSection />
      <ProductGrid />
      <AboutSection />
      <ContactsSection />
    </main>
  );
}
