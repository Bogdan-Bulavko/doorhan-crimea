import type { Metadata } from 'next';
import { Open_Sans, Montserrat } from 'next/font/google';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'DoorHan Крым | Ворота и автоматика',
  description:
    'Официальный представитель DoorHan в Крыму. Ворота, роллеты, автоматические системы. Качество и надежность с 1993 года.',
  keywords: 'DoorHan, ворота, роллеты, автоматика, Крым',
  authors: [{ name: 'DoorHan Крым' }],
  creator: 'DoorHan Крым',
  publisher: 'DoorHan Крым',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://bogdan-bulavko.github.io/doorhan-crimea'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DoorHan Крым | Ворота и автоматика',
    description:
      'Официальный представитель DoorHan в Крыму. Ворота, роллеты, автоматические системы.',
    url: 'https://bogdan-bulavko.github.io/doorhan-crimea',
    siteName: 'DoorHan Крым',
    images: [
      {
        url: '/doorhan-crimea/og-image.jpg',
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
    title: 'DoorHan Крым | Ворота и автоматика',
    description:
      'Официальный представитель DoorHan в Крыму. Ворота, роллеты, автоматические системы.',
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
        {children}
      </body>
    </html>
  );
}
