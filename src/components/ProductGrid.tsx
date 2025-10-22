'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

interface ProductImage {
  id: number;
  imageUrl: string;
  altText?: string;
  sortOrder: number;
  isMain: boolean;
}

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
  price: string;
  oldPrice?: string | null;
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  isNew: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  rating: string;
  reviewsCount: number;
  seoTitle?: string;
  seoDescription?: string;
  images?: ProductImage[];
  specifications?: unknown[];
  colors?: unknown[];
  createdAt: string;
  updatedAt: string;
}

interface ProductGridProps {
  products?: Product[];
  loading?: boolean;
  error?: string | null;
}

const ProductGrid = ({
  products: externalProducts,
  loading: externalLoading,
  error: externalError,
}: ProductGridProps) => {
  // Если данные переданы извне, используем их
  const {
    products: hookProducts,
    loading: hookLoading,
    error: hookError,
  } = useProducts({ limit: 8 });

  // Используем переданные данные или данные из хука
  const products = externalProducts || hookProducts;
  const loading = externalLoading !== undefined ? externalLoading : hookLoading;
  const error = externalError !== undefined ? externalError : hookError;

  // Проверяем, что products существует
  if (!products) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6A800]"></div>
        <span className="ml-4 text-gray-600">Инициализация...</span>
      </div>
    );
  }

  // Обработка ошибок
  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-red-600 mb-2">
              Ошибка загрузки товаров
            </h3>
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#F6A800] hover:bg-[#ffb700] text-white px-6 py-2 rounded-xl font-medium transition-all duration-300"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Показываем загрузку с таймаутом
  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6A800] mx-auto mb-4"></div>
              <span className="text-gray-600 text-lg">Загрузка товаров...</span>
              <p className="text-gray-500 text-sm mt-2">
                Если загрузка занимает слишком много времени, попробуйте обновить страницу
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }


  // Если есть ошибка
  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-red-600 mb-2">
              Ошибка загрузки товаров
            </h3>
            <p className="text-gray-500 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Если нет товаров
  if (!products || products.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Товары не найдены
            </h3>
            <p className="text-gray-500">
              Попробуйте изменить параметры поиска или фильтры
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Сетка товаров */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="group bg-white rounded-3xl shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <Link href={`/${product.category?.slug}/${product.slug || product.id}`}>
                {/* Изображение товара */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <Image
                    src={(() => {
                      const mainImage = product.mainImageUrl;
                      const mainFromImages = product.images?.find(img => img.isMain)?.imageUrl;
                      const firstImage = product.images?.[0]?.imageUrl;
                      return mainImage || mainFromImages || firstImage || '/images/placeholder.svg';
                    })()}
                    alt={product.title || product.name}
                    fill
                    className="object-contain"
                    style={{ 
                      objectFit: 'contain',
                      backgroundColor: '#f9fafb'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.svg';
                    }}
                  />

                  {/* Бейджи */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    {product.isNew && (
                      <span className="bg-[#F6A800] text-white px-3 py-1 rounded-full text-xs font-medium">
                        Новинка
                      </span>
                    )}
                    {product.oldPrice && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Скидка
                  </span>
                    )}
                </div>

                  {/* Действия */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
              </div>

                {/* Контент товара */}
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">
                        {parseFloat(product.rating).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.reviewsCount} отзывов)
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#00205B] font-montserrat mb-2 group-hover:text-[#F6A800] transition-colors">
                  {product.title || product.name}
                </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {product.shortDescription || product.description}
                </p>

                {/* Особенности */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.isPopular && (
                      <span className="bg-[#F6A800] text-white px-2 py-1 rounded-lg text-xs">
                        Популярный
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="bg-[#00205B] text-white px-2 py-1 rounded-lg text-xs">
                        Рекомендуем
                      </span>
                    )}
                    {product.inStock ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs">
                        В наличии
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-lg text-xs">
                        Нет в наличии
                      </span>
                    )}
                </div>

                {/* Цена и кнопка */}
                <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-[#00205B]">
                        {parseFloat(product.price).toLocaleString('ru-RU')}{' '}
                      {product.currency || '₽'}
                      </div>
                    {product.oldPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {parseFloat(product.oldPrice).toLocaleString('ru-RU')}{' '}
                        {product.currency || '₽'}
                        </div>
                    )}
                  </div>
                    <button className="bg-[#F6A800] hover:bg-[#ffb700] text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 hover:scale-105">
                      <ShoppingCart className="w-4 h-4" />
                      <span>В корзину</span>
                    </button>
                </div>
              </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductGrid;
