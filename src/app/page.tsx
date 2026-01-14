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
  // keywords удален - считается спамом в 2026 году
  openGraph: {
    title: 'DoorHan Крым | Ворота и автоматика',
    description:
      'Официальный представитель DoorHan в Крыму. Ворота, роллеты, автоматические системы.',
    url: 'https://zavod-doorhan.ru',
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
    canonical: 'https://zavod-doorhan.ru',
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

  // Получаем выбранные товары для главной страницы из настроек
  const featuredProductIdsSetting = await db.siteSetting.findUnique({
    where: { key: 'featuredProductIds' },
  });
  
  let featuredProductIds: number[] = [];
  if (featuredProductIdsSetting?.value) {
    try {
      featuredProductIds = JSON.parse(featuredProductIdsSetting.value);
    } catch (e) {
      console.error('Error parsing featuredProductIds:', e);
    }
  }

  // Если есть выбранные товары, загружаем их
  let featuredProducts = null;
  if (featuredProductIds.length > 0) {
    const products = await db.product.findMany({
      where: {
        id: { in: featuredProductIds },
        inStock: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });
    
    // Сортируем по порядку в featuredProductIds
    products.sort((a, b) => {
      const indexA = featuredProductIds.indexOf(a.id);
      const indexB = featuredProductIds.indexOf(b.id);
      return indexA - indexB;
    });
    
    // Преобразуем данные Prisma в формат для ProductGrid (null -> undefined)
    featuredProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      title: p.title || undefined,
      description: p.description || undefined,
      shortDescription: p.shortDescription || undefined,
      mainImageUrl: p.mainImageUrl || undefined,
      categoryId: p.categoryId,
      category: p.category ? {
        id: p.category.id,
        name: p.category.name,
        slug: p.category.slug,
      } : undefined,
      slug: p.slug,
      sku: p.sku || undefined,
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
      currency: p.currency,
      inStock: p.inStock,
      stockQuantity: p.stockQuantity,
      isNew: p.isNew,
      isPopular: p.isPopular,
      isFeatured: p.isFeatured,
      rating: Number(p.rating),
      reviewsCount: p.reviewsCount,
      seoTitle: p.seoTitle || undefined,
      seoDescription: p.seoDescription || undefined,
      images: p.images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText || undefined,
        sortOrder: img.sortOrder,
        isMain: img.isMain,
      })),
      specifications: [],
      colors: [],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  return (
    <main className="min-h-screen">
      <HeroSection />
      <VideoSection />
      <StatsSection />
      <ProductGrid products={featuredProducts || undefined} />
      {processedHomeContent && <RegionalContent content={processedHomeContent} />}
      <AboutSection />
      <ContactsSection />
    </main>
  );
}
