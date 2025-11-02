import type { Metadata } from 'next';
import { Open_Sans, Montserrat } from 'next/font/google';
import './globals.css';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingCallbackButton from '@/components/FloatingCallbackButton';
import DynamicMetadata from '@/components/DynamicMetadata';

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
  metadataBase: new URL('https://doorhan-crimea.ru'),
  authors: [{ name: 'DoorHan Крым' }],
  creator: 'DoorHan Крым',
  publisher: 'DoorHan Крым',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
        <DynamicMetadata />
        <Header />
        {children}
        <Footer />
        <FloatingCallbackButton />
      </body>
    </html>
  );
}
