import { Metadata } from 'next';
import CategoriesGrid from '@/components/CategoriesGrid';
import CategoriesSEO from '@/components/CategoriesSEO';

export const metadata: Metadata = {
  title: 'Категории товаров | DoorHan Крым',
  description: 'Выберите категорию товаров DoorHan: ворота, автоматика, рольставни. Доставка и установка по Крыму.',
  keywords: 'категории, DoorHan, ворота, автоматика, рольставни, Крым',
  openGraph: {
    title: 'Категории товаров | DoorHan Крым',
    description: 'Выберите категорию товаров DoorHan: ворота, автоматика, рольставни.',
    url: 'https://doorhan-crimea/categories',
    siteName: 'DoorHan Крым',
    images: [
      {
        url: '/doorhan-crimea/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DoorHan Крым - Категории',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Категории товаров | DoorHan Крым',
    description: 'Выберите категорию товаров DoorHan: ворота, автоматика, рольставни.',
    images: ['/doorhan-crimea/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://doorhan-crimea/categories',
  },
};

export default function CategoriesPage() {
  return (
    <main className="min-h-screen">
      <CategoriesSEO />
      <CategoriesGrid />
    </main>
  );
}
