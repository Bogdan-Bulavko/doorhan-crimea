import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
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
  
  // Формируем домен для текущего региона
  let siteUrl: string;
  const isLocalhost = host.includes('localhost');
  
  if (isLocalhost) {
    // Для localhost используем текущий host как есть
    siteUrl = `http://${host}`;
  } else if (region === 'default') {
    // Для default региона используем базовый домен
    siteUrl = `https://${baseDomain}`;
  } else {
    // Для региональных поддоменов в production
    siteUrl = `https://${region}.${baseDomain}`;
  }
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/signin/', '/_next/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

