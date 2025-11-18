'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Menu,
  X,
  ShoppingCart,
  Phone,
  MapPin,
  Search,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CallbackModal from './CallbackModal';
import SearchModal from './SearchModal';
import { useRegion } from '@/contexts/RegionContext';
import RegionSelector from './RegionSelector';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { regionalData, loading: regionLoading } = useRegion();

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setIsScrolled(window.scrollY > 50);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const menuItems = [
    { name: 'Главная', href: '/' },
    { name: 'Категории', href: '/categories' },
    { name: 'О компании', href: '/#about' },
    { name: 'Контакты', href: '/#contacts' },
  ];

  return (
    <>
      {/* Верхняя информационная полоса */}
      <div className="hidden lg:block bg-gradient-to-r from-[#00153E] to-[#00205B] text-white py-3 relative overflow-hidden">
        {/* Декоративный фон */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-8">
              {!regionLoading && regionalData && (
                <>
                  <Link
                    href={`tel:${regionalData.phone.replace(/\D/g, '')}`}
                    className="flex items-center space-x-2 hover:text-[#F6A800] transition-all duration-300 group"
                  >
                    <div className="p-1 bg-[#F6A800]/20 rounded-full group-hover:bg-[#F6A800]/30 transition-colors">
                      <Phone size={14} />
                    </div>
                    <span className="font-medium">{regionalData.phoneFormatted || regionalData.phone}</span>
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center space-x-2 hover:text-[#F6A800] transition-all duration-300 group"
                  >
                    <div className="p-1 bg-[#F6A800]/20 rounded-full group-hover:bg-[#F6A800]/30 transition-colors">
                      <MapPin size={14} />
                    </div>
                    <span className="font-medium">{regionalData.address}</span>
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {!regionLoading && regionalData && (
                <div className="text-sm text-gray-300">
                  <span className="text-[#F6A800] font-semibold">Работаем:</span>{' '}
                  {regionalData.workingHours}
                </div>
              )}
              <div className="w-px h-4 bg-white/20"></div>
              <button
                onClick={() => setIsCallbackModalOpen(true)}
                className="text-sm hover:text-[#F6A800] transition-colors font-medium"
              >
                Заказать звонок
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Основной header */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-gradient-to-r from-[#00205B] to-[#00153E] shadow-2xl shadow-[#00205B]/20 border-b border-[#F6A800]/20'
            : 'bg-gradient-to-r from-[#00205B]/95 to-[#00153E]/95 backdrop-blur-sm'
        }`}
      >
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Логотип */}
            <Link href="/" className="flex items-center group">
              <motion.div
                className="relative w-32 h-4 group-hover:scale-105 transition-transform duration-300"
                whileHover={{ rotate: 1 }}
                style={{ aspectRatio: '150/19' }}
              >
                <Image
                  src="https://crimea-doorhan.ru/local/templates/skd/images/logo.svg"
                  alt="DoorHan Крым"
                  fill
                  className="object-contain"
                />
              </motion.div>
            </Link>

            {/* Навигация */}
            <nav className="hidden max-[1100px]:hidden min-[1100px]:flex items-center space-x-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="relative px-4 py-2 text-white hover:text-[#F6A800] font-medium transition-all duration-300 rounded-lg group"
                >
                  <span className="relative z-10">{item.name}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F6A800]/20 to-[#F6A800]/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              ))}
            </nav>

            {/* Правая часть */}
            <div className="flex items-center space-x-2">
              {/* Селектор региона */}
              <div className="hidden lg:block">
                <RegionSelector variant="header" />
              </div>
              
              {/* Поиск */}
              <motion.button
                onClick={() => setIsSearchModalOpen(true)}
                className="hidden md:flex items-center justify-center w-11 h-11 text-white hover:text-[#F6A800] hover:bg-white/10 rounded-xl transition-all duration-300 border border-transparent hover:border-[#F6A800]/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search size={18} />
              </motion.button>

              {/* Профиль */}
              <motion.button
                className="hidden md:flex items-center justify-center w-11 h-11 text-white hover:text-[#F6A800] hover:bg-white/10 rounded-xl transition-all duration-300 border border-transparent hover:border-[#F6A800]/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User size={18} />
              </motion.button>

              {/* CTA кнопка */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden min-[1100px]:block"
              >
                <Link
                  href="/categories"
                  className="flex items-center space-x-2 bg-gradient-to-r from-[#F6A800] to-[#ffb700] hover:from-[#ffb700] hover:to-[#F6A800] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <ShoppingCart size={18} className="relative z-10" />
                  <span className="relative z-10 hidden md:inline">
                    Каталог
                  </span>
                </Link>
              </motion.div>

              {/* Мобильная кнопка меню */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="min-[1100px]:hidden p-2 text-white hover:text-[#F6A800] hover:bg-white/10 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Мобильное меню */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="min-[1100px]:hidden bg-gradient-to-b from-[#00205B] to-[#00153E] border-t border-[#F6A800]/20 shadow-lg"
            >
              <div className="container mx-auto px-4 py-6 max-w-7xl">
                <nav className="flex flex-col space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-3 text-white hover:text-[#F6A800] hover:bg-white/10 font-medium rounded-lg transition-all duration-300"
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                  {/* Поиск в мобильном меню */}
                  <div className="pt-4 mt-4 border-t border-[#F6A800]/20">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mb-4"
                    >
                      <div className="mb-4">
                        <RegionSelector variant="header" />
                      </div>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsSearchModalOpen(true);
                        }}
                        className="flex items-center justify-center space-x-2 w-full bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-medium transition-all duration-300"
                      >
                        <Search size={20} />
                        <span>Поиск товаров</span>
                      </button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Link
                        href="/categories"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#F6A800] to-[#ffb700] hover:from-[#ffb700] hover:to-[#F6A800] text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <ShoppingCart size={20} />
                        <span>Каталог товаров</span>
                      </Link>
                    </motion.div>
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Callback Modal */}
      <CallbackModal
        isOpen={isCallbackModalOpen}
        onClose={() => setIsCallbackModalOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
};

export default Header;
