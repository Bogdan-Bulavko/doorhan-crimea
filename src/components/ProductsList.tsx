'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

import BreadCrumbs from './BreadCrumbs';
import ProductGrid from './ProductGrid';
import CallbackModal from './CallbackModal';
import { useAllProducts } from '@/hooks/useAllProducts';
import { useMainCategories } from '@/hooks/useAllCategories';

interface Product {
  id: number;
  name: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  mainImageUrl?: string;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  slug: string;
  sku?: string;
  price: number;
  oldPrice?: number | null;
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  isNew: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  rating: number;
  reviewsCount: number;
  seoTitle?: string;
  seoDescription?: string;
  images?: Array<{
    id: number;
    imageUrl: string;
    altText?: string;
    sortOrder: number;
    isMain: boolean;
  }>;
  specifications?: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  colors?: Array<{
    id: number;
    name: string;
    hex: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ProductsListProps {
  initialSearch?: string;
}

const ProductsList = ({ initialSearch = '' }: ProductsListProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('name');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allDisplayedProducts, setAllDisplayedProducts] = useState<Product[]>(
    []
  );

  // Получаем категорию из URL параметров
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category');
      if (category) {
        setSelectedCategory(category);
      }
      setIsInitialized(true);
    }
  }, []);

  // Обновляем поисковый термин при изменении initialSearch
  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
      setDebouncedSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  // Сбрасываем страницу и накопленные товары при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
    setAllDisplayedProducts([]);
  }, [selectedCategory, debouncedSearchTerm, sortBy]);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Получаем категории из БД
  const { categories, loading: categoriesLoading } = useMainCategories();
  
  // Получаем информацию о выбранной категории для отображения контента
  const selectedCategoryData = useMemo(() => {
    if (selectedCategory === 'all' || !isInitialized) return null;
    return categories.find(cat => cat.slug === selectedCategory);
  }, [categories, selectedCategory, isInitialized]);

  // Получаем общее количество всех товаров
  const { totalCount: allProductsTotalCount } = useAllProducts({});

  // Получаем отфильтрованные товары для отображения с пагинацией
  const {
    products,
    loading: productsLoading,
    error: productsError,
    pagination,
  } = useAllProducts({
    categorySlug:
      isInitialized && selectedCategory !== 'all'
        ? selectedCategory
        : undefined,
    search:
      debouncedSearchTerm && debouncedSearchTerm.trim() !== ''
        ? debouncedSearchTerm
        : undefined,
    sortBy:
      sortBy === 'name'
        ? 'name'
        : sortBy === 'price-low'
        ? 'price'
        : sortBy === 'price-high'
        ? 'price'
        : 'name',
    sortOrder: sortBy === 'price-high' ? 'desc' : 'asc',
    page: currentPage,
    limit: 12, // Показываем по 12 товаров
  });

  // Получаем общее количество отфильтрованных товаров для отображения
  const { pagination: filteredPagination } = useAllProducts({
    categorySlug:
      isInitialized && selectedCategory !== 'all'
        ? selectedCategory
        : undefined,
    search:
      debouncedSearchTerm && debouncedSearchTerm.trim() !== ''
        ? debouncedSearchTerm
        : undefined,
    sortBy:
      sortBy === 'name'
        ? 'name'
        : sortBy === 'price-low'
        ? 'price'
        : sortBy === 'price-high'
        ? 'price'
        : 'name',
    sortOrder: sortBy === 'price-high' ? 'desc' : 'asc',
    // Без пагинации для подсчета
  });

  // Вычисляем правильное количество товаров для отображения
  const getTotalCount = () => {
    // Если выбрана категория "Все товары" и нет поиска, показываем общее количество
    if (
      selectedCategory === 'all' &&
      (!debouncedSearchTerm || debouncedSearchTerm.trim() === '')
    ) {
      return allProductsTotalCount;
    }
    // Иначе показываем количество отфильтрованных товаров из пагинации
    return filteredPagination?.total || 0;
  };

  // Формируем список категорий для селекта с подсчетом товаров
  const categoriesForSelect = useMemo(() => {
    // Используем productCount из API категорий (загружается напрямую из БД)
    const totalCount = allProductsTotalCount;

    return [
      { id: 'all', name: 'Все товары', count: totalCount },
      ...categories.map((category) => ({
        id: category.slug,
        name: category.name,
        count: category.productCount || 0,
      })),
    ];
  }, [categories, allProductsTotalCount]);

  // Накопление товаров при загрузке новых страниц
  useEffect(() => {
    if (products && products.length > 0) {
      if (currentPage === 1) {
        // Первая страница - заменяем
        setAllDisplayedProducts(products);
      } else {
        // Последующие страницы - добавляем
        setAllDisplayedProducts((prev) => [...prev, ...products]);
      }
    }
  }, [products, currentPage]);

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
            {selectedCategoryData?.name || 'Каталог товаров'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {selectedCategoryData?.description || 'Выберите подходящие ворота, роллеты и автоматику DoorHan'}
          </p>
        </motion.div>

        {/* ContentTop - контент сверху страницы категории */}
        {selectedCategoryData?.contentTop && selectedCategoryData.contentTop.trim() !== '' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 max-w-none [&_p]:mb-4 [&_p]:text-gray-700 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#00205B] [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#00205B] [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2 [&_a]:text-[#F6A800] [&_a]:hover:underline [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: selectedCategoryData.contentTop }}
          />
        )}

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
              {getTotalCount()}
            </span>
          </p>
        </motion.div>

        {/* Сетка товаров */}
        <ProductGrid
          products={allDisplayedProducts || []}
          loading={productsLoading}
          error={productsError}
        />

        {/* ContentBottom - контент снизу страницы категории */}
        {selectedCategoryData?.contentBottom && selectedCategoryData.contentBottom.trim() !== '' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 mb-8 max-w-none [&_p]:mb-4 [&_p]:text-gray-700 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#00205B] [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#00205B] [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2 [&_a]:text-[#F6A800] [&_a]:hover:underline [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: selectedCategoryData.contentBottom }}
          />
        )}

        {/* Кнопка "Загрузить еще" */}
        {pagination && pagination.pages > currentPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={productsLoading}
              className="bg-[#F6A800] hover:bg-[#ffb700] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
            >
              {productsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Загрузка...</span>
                </div>
              ) : (
                'Загрузить еще'
              )}
            </button>
          </motion.div>
        )}

        {/* Блок консультации */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-br from-[#F6A800] to-[#ffb700] rounded-3xl p-8 md:p-12 text-white shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold font-montserrat mb-4">
              Нужна консультация?
            </h3>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Наши специалисты помогут подобрать оптимальное решение для вашего объекта
            </p>
            <button
              onClick={() => setIsCallbackModalOpen(true)}
              className="bg-[#00205B] hover:bg-[#00153E] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 mx-auto"
            >
              <span>Получить консультацию</span>
            </button>
          </div>
        </motion.div>

        {/* CTA секция */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-8"
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

        {/* Модальное окно заказа звонка */}
        <CallbackModal
          isOpen={isCallbackModalOpen}
          onClose={() => setIsCallbackModalOpen(false)}
        />
      </div>
    </section>
  );
};

export default ProductsList;
