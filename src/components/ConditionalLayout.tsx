'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import FloatingCallbackButton from './FloatingCallbackButton';
import CustomAssets from './CustomAssets';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const { settings } = useSiteSettings();

  return (
    <>
      {!isAdminPage && <Header />}
      {children}
      {!isAdminPage && <Footer />}
      {!isAdminPage && <FloatingCallbackButton />}
      <CustomAssets customCss={settings?.customCss} customJs={settings?.customJs} />
    </>
  );
}

