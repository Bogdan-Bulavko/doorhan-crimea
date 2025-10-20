import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Open_Sans, Montserrat } from 'next/font/google';
import './globals.css';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import regions from './metadata/regions';
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

export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const regionKey = hdrs.get('x-region') || 'default';
  const region =
    (
      regions as Record<
        string,
        { title: string; description: string; keywords: string }
      >
    )[regionKey] || regions.default;

  const title = region.title;
  const description = region.description;
  const keywords = region.keywords;

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'DoorHan Крым' }],
    creator: 'DoorHan Крым',
    publisher: 'DoorHan Крым',
    formatDetection: { email: false, address: false, telephone: false },
    metadataBase: new URL('https://doorhan-crimea'),
    alternates: { canonical: '/' },
    openGraph: {
      title,
      description,
      url: 'https://doorhan-crimea',
      siteName: 'DoorHan Крым',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'DoorHan Крым',
        },
      ],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
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
    <html lang="ru" className="scroll-smooth">
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
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
