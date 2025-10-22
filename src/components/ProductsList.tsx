'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

import BreadCrumbs from './BreadCrumbs';
import ProductGrid from './ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { useMainCategories } from '@/hooks/useCategories';

const ProductsList = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isInitialized, setIsInitialized] = useState(false);

  // Получаем категорию из URL параметров
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category');
      console.log('🔍 URL категория:', category);
      if (category) {
        setSelectedCategory(category);
        console.log('🔍 Установлена категория:', category);
      }
      setIsInitialized(true);
    }
  }, []);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Получаем категории из БД
  const { categories, loading: categoriesLoading } = useMainCategories();

  // Получаем товары из БД (только после инициализации)
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts({
    categorySlug:
      isInitialized && selectedCategory !== 'all'
        ? selectedCategory
        : undefined,
    search: debouncedSearchTerm || undefined,
    sortBy:
      sortBy === 'name'
        ? 'createdAt'
        : sortBy === 'price-low'
        ? 'price'
        : sortBy === 'price-high'
        ? 'price'
        : 'createdAt',
    sortOrder: sortBy === 'price-high' ? 'desc' : 'asc',
  });


  // Получаем общее количество товаров для каждой категории (только один раз)
  const { products: allProducts } = useProducts({});

  // Формируем список категорий для селекта с мемоизацией
  const categoriesForSelect = useMemo(
    () => [
      { id: 'all', name: 'Все товары', count: allProducts.length },
      ...categories.map((category) => ({
        id: category.slug,
        name: category.name,
        count: allProducts.filter((p) => p.category?.slug === category.slug)
          .length,
      })),
    ],
    [categories, allProducts]
  );

  // Показываем загрузку для категорий или инициализации
  if (categoriesLoading || !isInitialized) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6A800]"></div>
        <span className="ml-4 text-gray-600">
          {!isInitialized ? 'Инициализация...' : 'Загрузка категорий...'}
        </span>
      </div>
    );
  }

  return (
    <section className="pt-12 pb-8 md:pt-8 md:pb-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Хлебные крошки */}
        <BreadCrumbs items={[]} />
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#00205B] font-montserrat mb-4">
            Каталог товаров
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Выберите подходящие ворота, роллеты и автоматику DoorHan
          </p>
        </motion.div>

        {/* Фильтры и поиск */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-2xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800] focus:border-transparent"
              />
              {searchTerm !== debouncedSearchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-[#F6A800] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Категории */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800] focus:border-transparent"
            >
              {categoriesForSelect.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>

            {/* Сортировка */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800] focus:border-transparent"
            >
              <option value="name">По названию</option>
              <option value="price-low">Цена: по возрастанию</option>
              <option value="price-high">Цена: по убыванию</option>
              <option value="rating">По рейтингу</option>
            </select>
          </div>
        </motion.div>

        {/* Результаты */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <p className="text-gray-600">
            Найдено товаров:{' '}
            <span className="font-semibold text-[#00205B]">
              {products.length}
            </span>
          </p>
        </motion.div>

        {/* Сетка товаров */}
        <ProductGrid
          products={products || []}
          loading={productsLoading}
          error={productsError}
        />

        {/* CTA секция */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-[#00205B] to-[#00153E] rounded-3xl p-8 md:p-16 text-white">
            <h3 className="text-2xl md:text-3xl font-bold font-montserrat mb-4">
              Не нашли подходящий товар?
            </h3>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Свяжитесь с нами, и мы подберем индивидуальное решение для ваших
              потребностей
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#contact"
                className="bg-[#F6A800] hover:bg-[#ffb700] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
              >
                <span>Связаться с нами</span>
              </Link>
              <Link
                href="/categories"
                className="border-2 border-white hover:bg-white hover:text-[#00205B] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>К категориям</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsList;
