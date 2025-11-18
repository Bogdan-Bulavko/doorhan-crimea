'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce поискового запроса - увеличен до 500ms для снижения нагрузки
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Минимальная длина запроса для поиска - начинаем поиск только с 3 символов
  const MIN_SEARCH_LENGTH = 3;
  const shouldSearch =
    debouncedSearchQuery &&
    debouncedSearchQuery.trim().length >= MIN_SEARCH_LENGTH;

  // Получаем результаты поиска только если есть поисковый запрос
  const { products, loading, error } = useProducts({
    search: shouldSearch ? debouncedSearchQuery.trim() : undefined,
    limit: 8,
  });

  // Фокус на input при открытии модального окна
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Закрытие модального окна по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const handleProductClick = () => {
    handleClose();
  };

  const getProductImage = (product: {
    mainImageUrl?: string;
    images?: Array<{
      imageUrl: string;
      isMain: boolean;
    }>;
  }): string => {
    // Игнорируем дефолтные изображения из seed.js
    const defaultImages = ['/window.svg', '/globe.svg'];
    const hasValidMainImage = product.mainImageUrl && !defaultImages.includes(product.mainImageUrl);
    
    if (hasValidMainImage && product.mainImageUrl) return product.mainImageUrl;
    
    const mainImage = product.images?.find((img) => img.isMain && img.imageUrl && !defaultImages.includes(img.imageUrl));
    if (mainImage && mainImage.imageUrl) return mainImage.imageUrl;
    
    const firstImage = product.images?.find((img) => img.imageUrl && !defaultImages.includes(img.imageUrl));
    if (firstImage && firstImage.imageUrl) return firstImage.imageUrl;
    
    return '/images/placeholder.svg';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute top-0 md:top-20 left-0 md:left-1/2 md:transform md:-translate-x-1/2 w-full md:max-w-2xl md:mx-4 h-full md:h-auto md:max-h-[calc(100vh-10rem)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full md:h-auto">
              {/* Заголовок */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-lg md:text-xl font-bold text-[#00205B]">
                  Поиск товаров
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Поле поиска */}
              <div className="p-4 md:p-6 pb-4 flex-shrink-0">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Введите название товара..."
                    className="w-full pl-12 pr-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl focus:border-[#F6A800] focus:outline-none transition-colors text-base md:text-lg"
                  />
                  {loading && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Loader2
                        size={20}
                        className="text-[#F6A800] animate-spin"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Результаты поиска */}
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] md:max-h-96">
                {searchQuery.length === 0 ? (
                  <div className="p-6 md:p-8 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-base md:text-lg font-medium mb-2">
                      Начните поиск
                    </p>
                    <p className="text-xs md:text-sm">
                      Введите название товара для поиска в каталоге
                    </p>
                  </div>
                ) : searchQuery.trim().length > 0 &&
                  searchQuery.trim().length < MIN_SEARCH_LENGTH ? (
                  <div className="p-6 md:p-8 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-base md:text-lg font-medium mb-2">
                      Введите минимум {MIN_SEARCH_LENGTH} символа
                    </p>
                    <p className="text-xs md:text-sm">
                      Продолжайте ввод для начала поиска
                    </p>
                  </div>
                ) : error ? (
                  <div className="p-6 md:p-8 text-center text-red-500">
                    <p className="text-base md:text-lg font-medium mb-2">
                      Ошибка поиска
                    </p>
                    <p className="text-xs md:text-sm">{error}</p>
                  </div>
                ) : products.length === 0 && !loading ? (
                  <div className="p-6 md:p-8 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-base md:text-lg font-medium mb-2">
                      Товары не найдены
                    </p>
                    <p className="text-xs md:text-sm">
                      Попробуйте изменить поисковый запрос
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-2 md:p-4">
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          href={`/${product.category?.slug}/${product.slug}`}
                          onClick={handleProductClick}
                          className="flex items-center p-3 md:p-4 hover:bg-gray-50 rounded-xl transition-colors group"
                        >
                          {/* Изображение товара */}
                          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0 mr-3 md:mr-4">
                            <Image
                              src={getProductImage(product)}
                              alt={product.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder.svg';
                              }}
                            />
                          </div>

                          {/* Информация о товаре */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm md:text-base text-gray-900 group-hover:text-[#F6A800] transition-colors truncate">
                              {product.name}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-500 truncate">
                              {product.category?.name}
                            </p>
                            {product.price > 0 && (
                              <p className="text-xs md:text-sm font-semibold text-[#00205B]">
                                {product.price.toLocaleString('ru-RU')}{' '}
                                {product.currency || '₽'}
                              </p>
                            )}
                          </div>

                          {/* Стрелка */}
                          <ArrowRight
                            size={16}
                            className="text-gray-400 group-hover:text-[#F6A800] transition-colors"
                          />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Подвал */}
              {searchQuery.length > 0 && products.length > 0 && (
                <div className="p-3 md:p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                  <Link
                    href={`/categories/products?search=${encodeURIComponent(
                      searchQuery
                    )}`}
                    onClick={handleClose}
                    className="flex items-center justify-center space-x-2 text-sm md:text-base text-[#00205B] hover:text-[#F6A800] font-medium transition-colors"
                  >
                    <span>Посмотреть все результаты</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
