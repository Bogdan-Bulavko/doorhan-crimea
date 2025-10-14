import type { MetadataRoute } from 'next';

// Обязательно для статического экспорта
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://bogdan-bulavko.github.io/doorhan-crimea',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://bogdan-bulavko.github.io/doorhan-crimea/categories',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://bogdan-bulavko.github.io/doorhan-crimea/products',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
