import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

// Список всех поддерживаемых регионов
const SUPPORTED_REGIONS = [
  'simferopol',
  'kerch',
  'evpatoria',
  'yalta',
  'feodosia',
  'sevastopol',
  'alushta',
  'dzhankoy',
  'bakhchisaray',
  'krasnoperekopsk',
  'saki',
  'armyansk',
  'sudak',
  'belogorsk',
  'inkerman',
  'balaklava',
  'shchelkino',
  'stary-krym',
  'alupka',
  'gurzuf',
  'simeiz',
  'foros',
  'koktebel',
  'livadia',
  'massandra',
  'nikita',
  'gaspra',
  'miskhor',
  'partenit',
  'kacha',
];

// Делаем динамическим для поддержки разных доменов
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // Определяем регион из поддомена
  const subdomain = host.split('.')[0];
  const region = SUPPORTED_REGIONS.includes(subdomain) ? subdomain : 'default';
  
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

  // Для поддоменов включаем только главную, категории и товары
  // Для основного домена включаем все страницы
  const isSubdomain = region !== 'default' && !host.includes('localhost');

  // Формируем статические страницы в зависимости от типа домена
  const staticPages: MetadataRoute.Sitemap = isSubdomain
    ? [
        {
          url: baseUrl,
          lastModified: new Date(),
          changeFrequency: 'yearly' as const,
          priority: 1,
        },
      ]
    : [
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
        {
          url: `${baseUrl}/articles`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
      ];

  // Добавляем страницы категорий (для всех доменов)
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Добавляем страницы товаров (для всех доменов)
  const productPages = products.map((product) => ({
    url: `${baseUrl}/${product.category.slug}/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Информационные страницы и статьи только для основного домена
  let infoPages: MetadataRoute.Sitemap = [];
  let articlePages: MetadataRoute.Sitemap = [];

  if (!isSubdomain) {
    // Получаем все активные страницы
    const pages = await db.page.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    // Получаем все активные статьи
    const articles = await db.article.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });

    infoPages = pages.map((page) => ({
      url: `${baseUrl}/pages/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    articlePages = articles.map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  }

  return [...staticPages, ...categoryPages, ...productPages, ...infoPages, ...articlePages];
}
