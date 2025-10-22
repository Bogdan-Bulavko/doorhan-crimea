'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ProductsList from '@/components/ProductsList';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search');

  return <ProductsList initialSearch={search || ''} />;
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6A800]"></div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
