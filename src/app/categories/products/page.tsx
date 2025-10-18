'use client';

import dynamic from 'next/dynamic';

const ProductsList = dynamic(() => import('@/components/ProductsList'), {
  ssr: false,
});

export default function ProductsPage() {
  return (
    <main className="min-h-screen">
      <ProductsList />
    </main>
  );
}
