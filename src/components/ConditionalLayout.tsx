'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import FloatingCallbackButton from './FloatingCallbackButton';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Header />}
      {children}
      {!isAdminPage && <Footer />}
      {!isAdminPage && <FloatingCallbackButton />}
    </>
  );
}

