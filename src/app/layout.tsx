import type { Metadata } from 'next';
import { Open_Sans, Montserrat } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';

import ConditionalLayout from '@/components/ConditionalLayout';
import DynamicMetadata from '@/components/DynamicMetadata';
import { RegionProvider } from '@/contexts/RegionContext';
import regions from '@/app/metadata/regions';

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

// Функция для получения региона из заголовков
function getRegionFromHeaders(): string {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const subdomain = host.split('.')[0];
  return SUPPORTED_REGIONS.includes(subdomain) ? subdomain : 'default';
}

// Динамическая генерация метатегов на основе региона
export async function generateMetadata(): Promise<Metadata> {
  const region = getRegionFromHeaders();
  const regionData = regions[region as keyof typeof regions] || regions.default;
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'zavod-doorhan.ru';
  const host = headers().get('host') || '';
  
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

  return {
    title: regionData.title,
    description: regionData.description,
    keywords: regionData.keywords,
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
      canonical: '/',
    },
    openGraph: {
      title: regionData.title,
      description: regionData.description,
      url: baseUrl,
      siteName: 'DoorHan Крым',
      images: [
        {
          url: '/doorhan-crimea/og-image.jpg',
          width: 1200,
          height: 630,
          alt: regionData.title,
        },
      ],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: regionData.title,
      description: regionData.description,
      images: ['/doorhan-crimea/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
