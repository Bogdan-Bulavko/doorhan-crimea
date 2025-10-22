import { Metadata } from 'next';
import CategoriesGrid from '@/components/CategoriesGrid';
import CatalogSEO from '@/components/CatalogSEO';

export const metadata: Metadata = {
  title: 'Каталог товаров | DoorHan Крым',
  description: 'Полный каталог товаров DoorHan в Крыму. Ворота, роллеты, автоматические системы. Выберите подходящую категорию.',
  keywords: 'каталог, DoorHan, ворота, роллеты, автоматика, Крым, категории товаров',
  openGraph: {
    title: 'Каталог товаров | DoorHan Крым',
    description: 'Полный каталог товаров DoorHan в Крыму. Ворота, роллеты, автоматические системы.',
    url: 'https://doorhan-crimea/categories',
    siteName: 'DoorHan Крым',
    images: [
      {
        url: '/doorhan-crimea/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DoorHan Крым - Каталог',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Каталог товаров | DoorHan Крым',
    description: 'Полный каталог товаров DoorHan в Крыму. Ворота, роллеты, автоматические системы.',
    images: ['/doorhan-crimea/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://doorhan-crimea/categories',
  },
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen">
      <CatalogSEO />
      <CategoriesGrid />
    </main>
  );
}
