'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  CheckCircle,
  Heart,
  Share2,
  Download,
  Phone,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import BreadCrumbs from './BreadCrumbs';
import CallbackModal from './CallbackModal';
import SimpleMarkdownRenderer from './SimpleMarkdownRenderer';
import SEOOptimizer from './SEOOptimizer';

interface ProductPageClientProps {
  product: {
    id: number;
    name: string;
    title?: string;
    description?: string;
    shortDescription?: string;
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
    mainImageUrl?: string;
    slug: string;
    sku?: string;
    seoTitle?: string;
    seoDescription?: string;
    h1?: string;
    category?: {
      id: number;
      name: string;
      slug: string;
    };
    images?: Array<{
      id: number;
      imageUrl: string;
      altText?: string;
      isMain: boolean;
      sortOrder: number;
    }>;
    specifications?: Array<{
      id: number;
      name: string;
      value: string;
      unit?: string;
      sortOrder: number;
    }>;
    colors?: Array<{
      id: number;
      name: string;
      value: string;
      hexColor: string;
      imageUrl?: string;
      sortOrder: number;
    }>;
    createdAt: string;
    updatedAt: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
  };
}

export default function ProductPageClient({
  product: apiProduct,
  category,
}: ProductPageClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);

  // Преобразуем данные из API в формат компонента

  const product = apiProduct
    ? {
        ...apiProduct,
        images:
          apiProduct.images?.map(
            (
              img: {
                id: number;
                imageUrl: string;
                altText?: string;
                isMain: boolean;
                sortOrder: number;
              },
              index: number
            ) => ({
              id: `img_${img.id || index}`,
              fileName: img.imageUrl?.split('/').pop() || `image_${index}`,
              url: img.imageUrl || '',
              type: img.imageUrl?.includes('video') ? 'video' : 'image',
              size: 0,
              originalName: img.altText || `Image ${index + 1}`,
              isMain: img.isMain || false,
              sortOrder: img.sortOrder || index,
              altText: img.altText || '',
            })
          ) || [],
        features: [
          'Высокое качество материалов',
          'Долговечность конструкции',
          'Простота установки',
          'Надежность в эксплуатации',
          'Современный дизайн',
          'Гарантия производителя',
        ],
      }
    : null;

  // Показываем ошибку если нет продукта
  if (!product) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-red-600 mb-2">
              Товар не найден
            </h3>
            <p className="text-red-500 mb-4">
              Товар с указанным ID не существует
            </p>
            <Link
              href="/categories"
              className="bg-[#F6A800] hover:bg-[#ffb700] text-white px-6 py-2 rounded-xl font-medium transition-all duration-300"
            >
              Вернуться к каталогу
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* SEO Оптимизатор */}
      <SEOOptimizer
        productName={product.name || ''}
        productDescription={product.description || ''}
        productImages={
          product.images?.map((img: { url: string }) => img.url) || []
        }
        productPrice={product.price.toString()}
        productCategory={product.category?.name || ''}
      />

      {/* Хлебные крошки */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8 max-w-7xl"
      >
        <BreadCrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Категории', href: '/categories' },
            { label: category.name, href: `/${category.slug}` },
            { label: product.name, href: `/${category.slug}/${product.slug}` },
          ]}
        />

        {/* Основная информация о товаре */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Галерея изображений */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Главное изображение */}

            <div className="relative aspect-square bg-white rounded-3xl shadow-soft overflow-hidden">
              {product.images?.[selectedImage]?.type === 'video' ? (
                <video
                  src={product.images[selectedImage].url}
                  className="w-full h-full object-contain"
                  controls
                  muted
                  style={{ backgroundColor: '#f9fafb' }}
                />
              ) : (
                <Image
                  src={(() => {
                    // Игнорируем дефолтные изображения из seed.js
                    const defaultImages = ['/window.svg', '/globe.svg'];
                    const selectedImg = product.images?.[selectedImage]?.url;
                    const mainImg = product.mainImageUrl;
                    
                    if (selectedImg && !defaultImages.includes(selectedImg)) return selectedImg;
                    if (mainImg && !defaultImages.includes(mainImg)) return mainImg;
                    
                    // Ищем первое валидное изображение
                    const validImage = product.images?.find(img => 
                      img.url && !defaultImages.includes(img.url)
                    );
                    return validImage?.url || '/images/placeholder.svg';
                  })()}
                  alt={product.name}
                  fill
                  className="object-contain"
                  style={{
                    objectFit: 'contain',
                    backgroundColor: '#f9fafb',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.svg';
                  }}
                />
              )}
              {/* Кнопки навигации по изображениям */}
              <button
                onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() =>
                  setSelectedImage(
                    Math.min(
                      (product.images?.length || 1) - 1,
                      selectedImage + 1
                    )
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              {/* Индикаторы */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {(product.images || []).map((_, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === selectedImage ? 'bg-[#F6A800]' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Миниатюры */}
            <div className="grid grid-cols-4 gap-3">
              {(product.images || []).map(
                (image: { url: string; type?: string }, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all ${
                      index === selectedImage
                        ? 'border-[#F6A800]'
                        : 'border-gray-200'
                    }`}
                  >
                    {image.type === 'video' ? (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-6 h-6 mx-auto mb-1 bg-gray-400 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-2 border-l-gray-600 border-t-1 border-b-1 border-t-transparent border-b-transparent ml-0.5"></div>
                          </div>
                          <span className="text-xs text-gray-500">Видео</span>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={image.url || '/images/placeholder.svg'}
                        alt={`${product.name} ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-contain"
                        style={{
                          objectFit: 'contain',
                          backgroundColor: '#f9fafb',
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.svg';
                        }}
                      />
                    )}
                  </button>
                )
              )}
            </div>
          </motion.div>

          {/* Информация о товаре */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Заголовок и рейтинг */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-[#F6A800]/10 text-[#F6A800] px-3 py-1 rounded-full text-sm font-medium">
                  {product.category?.name || 'Товар'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#00205B] font-montserrat mb-4">
                {product.h1 || product.title || product.name}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(Number(product.rating))
                          ? 'text-[#F6A800] fill-current'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {product.rating.toFixed(1)} ({product.reviewsCount} отзывов)
                  </span>
                </div>
              </div>
            </div>

            {/* Цена */}
            {product.price > 0 && (
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-[#00205B]">
                {product.price.toLocaleString('ru-RU')} {product.currency}
              </span>
              {product.oldPrice && (
                <span className="text-xl text-gray-500 line-through">
                  {product.oldPrice.toLocaleString('ru-RU')} {product.currency}
                </span>
              )}
              {product.oldPrice && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                  -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                </span>
              )}
            </div>
            )}

            {/* Краткое описание */}
            {product.shortDescription && (
              <div className="bg-blue-50 border-l-4 border-[#F6A800] p-4 rounded-r-lg">
                <p className="text-gray-700 font-medium text-lg leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>
            )}

            {/* Количество и кнопки */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-[#00205B]">
                  Количество:
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#F6A800] to-[#ffb700] hover:from-[#ffb700] hover:to-[#F6A800] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <ShoppingCart size={20} />
                  <span>Добавить в корзину</span>
                </motion.button>
                <motion.button
                  onClick={() => setIsCallbackModalOpen(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 border-2 border-[#00205B] hover:bg-[#00205B] text-[#00205B] hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Phone size={20} />
                  <span>Заказать звонок</span>
                </motion.button>
              </div>

              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-[#F6A800] transition-colors">
                  <Heart size={20} />
                  <span>В избранное</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-[#F6A800] transition-colors">
                  <Share2 size={20} />
                  <span>Поделиться</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-[#F6A800] transition-colors">
                  <Download size={20} />
                  <span>Скачать каталог</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Основное описание */}
        {product.description && (
          <motion.div variants={itemVariants} className="mb-16">
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <h2 className="text-2xl font-bold text-[#00205B] font-montserrat mb-6">
                Описание товара
              </h2>
              <SimpleMarkdownRenderer
                content={product.description}
                className="text-gray-700"
              />
            </div>
          </motion.div>
        )}

        {/* Характеристики */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="bg-white rounded-3xl shadow-soft p-8">
            <h2 className="text-2xl font-bold text-[#00205B] font-montserrat mb-8">
              Характеристики
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(product.specifications || []).map(
                (spec: { name: string; value: string }, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-gray-600 font-medium">
                      {spec.name}:
                    </span>
                    <span className="text-[#00205B] font-semibold">
                      {spec.value}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </motion.div>

        {/* Преимущества */}
        <motion.div variants={itemVariants} className="mb-16">
          <h2 className="text-2xl font-bold text-[#00205B] font-montserrat mb-8 text-center">
            Преимущества товара
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Высокое качество материалов',
              'Долговечность конструкции',
              'Простота установки',
              'Надежность в эксплуатации',
              'Современный дизайн',
              'Гарантия производителя',
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-soft flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#F6A800] to-[#E59400] rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA секция */}
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-r from-[#00205B] to-[#00153E] rounded-3xl p-8 md:p-16 text-white text-center">
            <h3 className="text-2xl md:text-3xl font-bold font-montserrat mb-4">
              Нужна консультация?
            </h3>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Наши специалисты помогут подобрать оптимальное решение для вашего
              объекта
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contacts"
                className="bg-[#F6A800] hover:bg-[#ffb700] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
              >
                <Phone size={20} />
                <span>Получить консультацию</span>
              </Link>
              <Link
                href="/categories"
                className="border-2 border-white hover:bg-white hover:text-[#00205B] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Все товары</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Callback Modal */}
      <CallbackModal
        isOpen={isCallbackModalOpen}
        onClose={() => setIsCallbackModalOpen(false)}
      />
    </main>
  );
}
