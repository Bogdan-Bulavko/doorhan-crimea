import type { MetadataRoute } from 'next';
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

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // Определяем регион из поддомена
  const subdomain = host.split('.')[0];
  const region = SUPPORTED_REGIONS.includes(subdomain) ? subdomain : 'default';
  
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

