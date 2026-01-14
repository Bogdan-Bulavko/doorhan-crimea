import type { Metadata } from 'next';
import { Open_Sans, Montserrat } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';

import ConditionalLayout from '@/components/ConditionalLayout';
import DynamicMetadata from '@/components/DynamicMetadata';
import { RegionProvider } from '@/contexts/RegionContext';
import regions from '@/app/metadata/regions';
import { getSiteSettings } from '@/lib/site-settings';
import { generateCanonical } from '@/lib/canonical-utils';

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: ['normal'],
});

// Список поддерживаемых регионов
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

// Динамическая генерация метатегов на основе региона
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const subdomain = host.split('.')[0];
  const region = SUPPORTED_REGIONS.includes(subdomain) ? subdomain : 'default';
  const regionData = regions[region as keyof typeof regions] || regions.default;
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'zavod-doorhan.ru';
  const siteSettings = await getSiteSettings();
  const homeTitle = siteSettings.homeSeoTitle?.trim();
  const homeDescription = siteSettings.homeSeoDescription?.trim();
  const homeRobots = siteSettings.homeRobotsMeta?.trim();
  const homeCanonical = siteSettings.homeCanonicalUrl?.trim();
  
  // Определяем базовый URL
  let baseUrl: string;
  if (region === 'default' || host.includes('localhost')) {
    baseUrl = host.includes('localhost') 
      ? `http://${host}` 
      : `https://${baseDomain}`;
  } else {
    baseUrl = host.includes('localhost')
      ? `http://${region}.localhost:3000`
      : `https://${region}.${baseDomain}`;
  }

  const canonical = generateCanonical('home', region, {
    customCanonical: homeCanonical || undefined,
    useFullUrl: true,
    forceMainDomain: true,
  });
  const metadataTitle = homeTitle || regionData.title;
  const metadataDescription = homeDescription || regionData.description;

  return {
    title: metadataTitle,
    description: metadataDescription,
    // keywords удален - считается спамом в 2026 году
    authors: [{ name: 'DoorHan Крым' }],
    creator: 'DoorHan Крым',
    publisher: 'DoorHan Крым',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical,
    },
    openGraph: {
      title: metadataTitle,
      description: metadataDescription,
      url: canonical,
      siteName: 'DoorHan Крым',
      images: [
        {
          url: '/doorhan-crimea/og-image.jpg',
          width: 1200,
          height: 630,
          alt: metadataTitle,
        },
      ],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metadataTitle,
      description: metadataDescription,
      images: ['/doorhan-crimea/og-image.jpg'],
    },
    robots: homeRobots || 'index, follow',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings();
  const globalSchemaMarkup = siteSettings.globalSchemaMarkup?.trim();

  return (
    <html lang="ru" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/doorhan-crimea/favicon.ico" />
        <link
          rel="apple-touch-icon"
          href="/doorhan-crimea/apple-touch-icon.png"
        />
        <meta name="theme-color" content="#00205B" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {globalSchemaMarkup && (
          <script
            id="global-schema-markup"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: globalSchemaMarkup }}
          />
        )}
      </head>
      <body
        className={`${openSans.variable} ${montserrat.variable} antialiased bg-white text-gray-900`}
      >
        <RegionProvider>
          <DynamicMetadata />
          <ConditionalLayout>{children}</ConditionalLayout>
        </RegionProvider>
      </body>
    </html>
  );
}
