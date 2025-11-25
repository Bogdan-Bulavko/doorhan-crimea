'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';

interface BreadCrumbItem {
  label: string;
  href: string;
}

interface BreadCrumbsProps {
  items: BreadCrumbItem[];
}

export default function BreadCrumbs({ items = [] }: BreadCrumbsProps) {
  useEffect(() => {
    // Генерируем JSON-LD микроразметку для хлебных крошек
    if (items && items.length > 0) {
      const breadcrumbList = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items.map((item, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': item.label,
          'item': typeof window !== 'undefined' 
            ? `${window.location.origin}${item.href}`
            : item.href
        }))
      };

      // Удаляем предыдущую микроразметку хлебных крошек, если есть
      const existingScript = document.getElementById('breadcrumb-schema');
      if (existingScript) {
        existingScript.remove();
      }

      // Добавляем новую микроразметку
      const script = document.createElement('script');
      script.id = 'breadcrumb-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(breadcrumbList);
      document.head.appendChild(script);

      // Очистка при размонтировании
      return () => {
        const scriptToRemove = document.getElementById('breadcrumb-schema');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [items]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <nav 
        className="flex items-center space-x-1 text-sm text-gray-600 overflow-x-auto pb-2"
        vocab="https://schema.org/" 
        typeof="BreadcrumbList"
      >
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center flex-shrink-0"
            property="itemListElement" 
            typeof="ListItem"
          >
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            {index === items.length - 1 ? (
              <>
                <span 
                  className="text-[#00205B] font-medium max-w-[200px] truncate" 
                  title={item.label}
                  property="name"
                >
                  {item.label}
                </span>
                <meta property="position" content={String(index + 1)} />
              </>
            ) : (
              <>
                <Link 
                  href={item.href} 
                  className="hover:text-[#F6A800] transition-colors max-w-[150px] truncate block"
                  title={item.label}
                  property="item"
                  typeof="Thing"
                >
                  <span property="name">{item.label}</span>
                </Link>
                <meta property="position" content={String(index + 1)} />
              </>
            )}
          </div>
        ))}
      </nav>
    </motion.div>
  );
}
