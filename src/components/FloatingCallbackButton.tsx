'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import CallbackModal from './CallbackModal';

const FloatingCallbackButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#F6A800] hover:bg-[#ffb700] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        aria-label="Заказать звонок"
      >
        <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />

        {/* Пульсирующий эффект */}
        <motion.div
          className="absolute inset-0 bg-[#F6A800] rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Текст на мобильных */}
        <span className="hidden sm:block absolute right-full mr-3 bg-[#00205B] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Заказать звонок
        </span>
      </motion.button>

      {/* Callback Modal */}
      <CallbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default FloatingCallbackButton;
