'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Grid, List, Search, Filter, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { ProductCard } from '../_components/ProductCard';
import { useAlert } from '@/contexts/AlertContext';
import { useDebounce } from '@/hooks/useDebounce';

type Product = {
  id: number;
  name: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  oldPrice?: number;
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  isNew: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  rating: number;
  reviewsCount: number;
  mainImageUrl?: string;
  category?: { 
    id: number;
    name: string; 
  };
  images?: Array<{
    id: number;
    imageUrl: string;
    altText?: string;
    isMain: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
};

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ProductsList() {
  const { showSuccess, showError } = useAlert();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Загрузка продуктов
  const loadProducts = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }

      if (filterCategory !== 'all') {
        params.append('categoryId', filterCategory);
      }

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      } else {
        showError('Ошибка загрузки', data.message || 'Не удалось загрузить товары');
      }
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
      showError('Ошибка загрузки', 'Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filterCategory, pagination.limit, showError]);

  // Загрузка категорий
  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
    }
  }, []);

  // Эффекты
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Перезагружаем текущую страницу
        await loadProducts(pagination.page);
        showSuccess('Товар удален', 'Товар успешно удален');
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Ошибка удаления товара');
      }
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      showError('Ошибка удаления', 'Не удалось удалить товар');
      throw error;
    }
  };

  // Обработчики пагинации
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      loadProducts(newPage);
    }
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      handlePageChange(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.pages) {
      handlePageChange(pagination.page + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка добавления */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Товары</h1>
          <p className="text-gray-600 mt-1">
            Управление товарами и их характеристиками
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00205B] text-white rounded-lg hover:bg-[#001a4a] transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          Добавить товар
        </Link>
      </div>

      {/* Панель управления */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Поиск */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            />
          </div>

          {/* Фильтр по категории */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
            >
              <option value="all">Все категории</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Переключатель вида */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-[#00205B] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-[#00205B] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
          <span>Всего товаров: {pagination.total}</span>
          <span>Страница {pagination.page} из {pagination.pages}</span>
          {debouncedSearchTerm && (
            <span className="text-[#00205B]">
              По запросу &quot;{debouncedSearchTerm}&quot;
            </span>
          )}
        </div>
      </div>

      {/* Список товаров */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00205B] mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Загрузка товаров...</h3>
            </div>
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Товары не найдены</h3>
              <p className="text-gray-500">
                {debouncedSearchTerm 
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Добавьте первый товар, чтобы начать работу'
                }
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Пагинация */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={handlePrevPage}
            disabled={pagination.page === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Предыдущая
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pageNum === pagination.page
                      ? 'bg-[#00205B] text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextPage}
            disabled={pagination.page === pagination.pages}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Следующая
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
