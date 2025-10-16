// Обязательно для статического экспорта
export const dynamic = 'force-static';

interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export default function sitemap(): SitemapEntry[] {
  const baseUrl = 'https://doorhan-crimea.ru';
  const currentDate = new Date();

  // Основные страницы
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    },
  ];

  // Категории товаров
  const categories = [
    'home',      // Ворота для дома
    'garage',    // Ворота для гаража
    'industrial', // Промышленные ворота
    'rollers',   // Роллеты
    'automation', // Автоматика
    'locks',     // Замки и фурнитура
  ];

  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/products?category=${category}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Примеры страниц товаров (в реальном проекте это будет динамически из API)
  const productPages = [
    {
      url: `${baseUrl}/page-product/1`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/page-product/2`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/page-product/3`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  return [...staticPages, ...categoryPages, ...productPages];
}
