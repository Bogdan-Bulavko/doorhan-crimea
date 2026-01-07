'use client';

import { motion } from 'framer-motion';

interface RegionalContentProps {
  content: string;
}

/**
 * Компонент для отображения регионального контента на главной странице
 * Контент обрабатывается на сервере с заменой шорткодов
 */
export default function RegionalContent({ content }: RegionalContentProps) {
  if (!content || content.trim() === '') {
    return null;
  }

  return (
    <section className="bg-white py-12 border-t">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto [&_p]:mb-4 [&_p]:text-gray-700 [&_p]:text-lg [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-[#00205B] [&_h2]:mb-6 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-[#00205B] [&_h3]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2 [&_li]:text-gray-700 [&_a]:text-[#F6A800] [&_a]:hover:underline [&_strong]:font-semibold [&_strong]:text-[#00205B]"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}

