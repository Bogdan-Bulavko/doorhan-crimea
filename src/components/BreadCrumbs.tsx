'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface BreadCrumbItem {
  label: string;
  href: string;
}

interface BreadCrumbsProps {
  items: BreadCrumbItem[];
}

export default function BreadCrumbs({ items = [] }: BreadCrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <nav className="flex items-center space-x-1 text-sm text-gray-600 overflow-x-auto pb-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center flex-shrink-0">
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            {index === items.length - 1 ? (
              <span 
                className="text-[#00205B] font-medium max-w-[200px] truncate" 
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href} 
                className="hover:text-[#F6A800] transition-colors max-w-[150px] truncate block"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </motion.div>
  );
}
