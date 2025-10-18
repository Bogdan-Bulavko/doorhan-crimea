'use client';

import dynamic from 'next/dynamic';

const CategoriesGrid = dynamic(() => import('@/components/CategoriesGrid'), {
  ssr: false,
});

export default function CategoriesPage() {
  return (
    <main className="min-h-screen">
      <CategoriesGrid />
    </main>
  );
}
