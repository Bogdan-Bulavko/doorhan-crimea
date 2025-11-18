import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

// Делаем динамическим для поддержки разных доменов
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // Определяем регион из поддомена
  const subdomain = host.split('.')[0];
  let region = 'default';
  
  if (subdomain === 'simferopol') region = 'simferopol';
  else if (subdomain === 'yalta') region = 'yalta';
  else if (subdomain === 'alushta') region = 'alushta';
  else if (subdomain === 'sevastopol') region = 'sevastopol';
  
  // Получаем базовый домен из env
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'zavod-doorhan.ru';
  
  // Формируем базовый URL для текущего региона
  let baseUrl: string;
  if (region === 'default' || host.includes('localhost')) {
    // Для default региона или localhost используем базовый домен
    if (host.includes('localhost')) {
      baseUrl = `http://${host}`;
    } else {
      baseUrl = `https://${baseDomain}`;
    }
  } else {
    // Для региональных поддоменов
    if (host.includes('localhost')) {
      baseUrl = `http://${region}.localhost:3000`;
    } else {
      baseUrl = `https://${region}.${baseDomain}`;
    }
  }
  
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

  // Получаем все активные страницы
  const pages = await db.page.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
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
    {
      url: `${baseUrl}/pages`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
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

  // Добавляем информационные страницы
  const infoPages = pages.map((page) => ({
    url: `${baseUrl}/pages/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...infoPages];
}
