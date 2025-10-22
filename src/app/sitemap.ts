import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

// Обязательно для статического экспорта
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://doorhan-crimea.ru';
  
  // Получаем все категории
  const categories = await db.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  // Получаем все товары
  const products = await db.product.findMany({
    where: { inStock: true },
    select: {
      slug: true,
      category: {
        select: { slug: true },
      },
    },
  });

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Добавляем страницы категорий
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Добавляем страницы товаров
  const productPages = products.map((product) => ({
    url: `${baseUrl}/${product.category.slug}/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
