'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BreadCrumbs({ productName }: { productName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2 text-sm text-gray-600 mb-8"
    >
      <Link href="/" className="hover:text-[#F6A800] transition-colors">
        Главная
      </Link>
      <span>/</span>
      <Link
        href="/categories"
        className="hover:text-[#F6A800] transition-colors"
      >
        Категории
      </Link>
      <span>/</span>
      <Link
        href="/categories/products/"
        className={`${
          productName
            ? 'hover:text-[#F6A800] transition-colors'
            : 'text-[#00205B] font-medium'
        }`}
      >
        Товары
      </Link>
      {productName && (
        <>
          <span>/</span>
          <Link
            href={`/categories/products/${productName}`}
            className="text-[#00205B] font-medium"
          >
            {productName}
          </Link>
        </>
      )}
    </motion.div>
  );
}
