import { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import VideoSection from '@/components/VideoSection';
import StatsSection from '@/components/StatsSection';
import ProductGrid from '@/components/ProductGrid';
import AboutSection from '@/components/AboutSection';
import ContactsSection from '@/components/ContactsSection';
import { getRegionFromHeaders, getRegionData } from '@/lib/region';

export async function generateMetadata(): Promise<Metadata> {
  const region = await getRegionFromHeaders();
  const regionData = getRegionData(region);

  return {
    title: regionData.title,
    description: regionData.description,
    keywords: regionData.keywords,
    openGraph: {
      title: regionData.title,
      description: regionData.description,
      url: 'https://doorhan-crimea.ru',
      siteName: 'DoorHan Крым',
      images: [
        {
          url: '/doorhan-crimea/og-image.jpg',
          width: 1200,
          height: 630,
          alt: regionData.cityName,
        },
      ],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: regionData.title,
      description: regionData.description,
      images: ['/doorhan-crimea/og-image.jpg'],
    },
    alternates: {
      canonical: 'https://doorhan-crimea.ru',
    },
  };
}

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
