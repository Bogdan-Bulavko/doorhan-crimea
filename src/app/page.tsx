import { Metadata } from 'next';
import { headers } from 'next/headers';
import HeroSection from '@/components/HeroSection';
import VideoSection from '@/components/VideoSection';
import StatsSection from '@/components/StatsSection';
import ProductGrid from '@/components/ProductGrid';
import AboutSection from '@/components/AboutSection';
import ContactsSection from '@/components/ContactsSection';
import RegionalContent from '@/components/RegionalContent';
import { db } from '@/lib/db';
import { getRegionFromHeaders } from '@/lib/metadata-generator';
import { processShortcodes, getRegionData, type ShortcodeContext } from '@/lib/shortcodes';

export const metadata: Metadata = {
  title: 'DoorHan Крым | Ворота и автоматика',
  description:
    'Официальный представитель DoorHan в Крыму. Ворота, роллеты, автоматические системы. Качество и надежность с 1993 года.',
  keywords:
    'DoorHan, ворота, роллеты, автоматика, Крым, гаражные ворота, рольставни',
  openGraph: {
    title: 'DoorHan Крым | Ворота и автоматика',
    description:
      'Официальный представитель DoorHan в Крыму. Ворота, роллеты, автоматические системы.',
    url: 'https://doorhan-crimea.ru',
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
    description:
      'Официальный представитель DoorHan в Крыму. Ворота, роллеты, автоматические системы.',
    images: ['/doorhan-crimea/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://doorhan-crimea.ru',
  },
};

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Получаем региональные данные
  const headersList = await headers();
  const regionCode = getRegionFromHeaders(headersList);
  const region = await db.region.findUnique({
    where: { code: regionCode, isActive: true },
  });

  // Обрабатываем региональный контент с шорткодами
  let processedHomeContent = '';
  if (region?.homeContent) {
    const regionData = await getRegionData(regionCode);
    const shortcodeContext: ShortcodeContext = {
      region: regionData || undefined,
    };
    processedHomeContent = processShortcodes(region.homeContent, shortcodeContext);
  }

  return (
    <main className="min-h-screen">
      <HeroSection />
      <VideoSection />
      <StatsSection />
      <ProductGrid />
      {processedHomeContent && <RegionalContent content={processedHomeContent} />}
      <AboutSection />
      <ContactsSection />
    </main>
  );
}
