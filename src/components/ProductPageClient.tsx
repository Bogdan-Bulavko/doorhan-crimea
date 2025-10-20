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
import { Product } from '@/types';

interface ProductPageClientProps {
  productId?: string;
}

export default function ProductPageClient({
  productId = '1',
}: ProductPageClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Функция для получения данных товара по ID
  const getProductById = (id: string): Product => {
    const products: Record<string, Product> = {
      '1': {
        id: 1,
        name: 'Гаражные секционные ворота RSD02LUX',
        title: 'Гаражные секционные ворота RSD02LUX',
        description:
          'Секционные ворота RSD02LUX представляют собой модификацию хорошо зарекомендовавших себя ворот RSD01LUX с одной отличительной особенностью — балансировочным механизмом и экономичным автоматическим приводом, размещенными внутри вала, что позволяет сэкономить пространство в гараже. Легкая и прочная панель из алюминия обладает высокой коррозионной стойкостью. Конструкция ворот термоэффективна, прочна и проста в монтаже.',
        shortDescription:
          'Секционные ворота с автоматическим приводом и балансировочным механизмом',
        image: '/images/RSD02LUX.webp',
        images: [
          '/images/RSD02LUX.webp',
          '/images/RSD02LUX2padding.jpg',
          '/images/RSD02LUXdrawing.jpg',
          '/images/RSD02LUXscheme.png',
        ],
        features: [
          'Автоматическое открытие/закрытие',
          'Высокая коррозионная стойкость',
          'Изоляция тепла',
          'Лёгкость',
          'Простая установка',
          'Гарантия 10 лет',
        ],
        price: 125000,
        oldPrice: 145000,
        currency: 'RUB',
        category: 'Ворота для дома',
        categoryId: 1,
        slug: 'garage-section-gates-rsd02lux',
        sku: 'RSD02LUX-001',
        inStock: true,
        stockQuantity: 10,
        isNew: false,
        isPopular: true,
        isFeatured: true,
        rating: 4.8,
        reviews: 127,
        color: '#00205B',
        hoverColor: '#F6A800',
        specifications: [
          { name: 'Ширина проёма, мм', value: '2 000–3 000' },
          { name: 'Высота проема, мм', value: '1 800–3 000' },
          { name: 'Материал', value: 'Алюминий' },
          { name: 'Притолока, мм', value: 'От 180' },
          { name: 'Пристенки, мм', value: 'От 100' },
          { name: 'Гарантия', value: '10 лет' },
        ],
        colors: [
          { name: 'Синий', value: 'blue', hex: '#00205B' },
          { name: 'Белый', value: 'white', hex: '#FFFFFF' },
          { name: 'Серый', value: 'gray', hex: '#6B7280' },
        ],
        relatedProducts: [2, 3, 4],
        seoTitle: 'Гаражные секционные ворота RSD02LUX - DoorHan Крым',
        seoDescription:
          'Качественные секционные ворота RSD02LUX с автоматическим приводом. Установка и гарантия в Крыму.',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      '2': {
        id: 2,
        name: 'Откатные уличные ворота SLG-A',
        title: 'Откатные уличные ворота SLG-A',
        description:
          'Легкие и надежные ворота с уникальной конструкцией из алюминия и сэндвич-панелей. Устанавливаются на объекты частного или промышленного сектора: дачные участки, поселки, складские и производственные комплексы.',
        shortDescription: 'Прочные откатные ворота для больших проемов',
        image: '/images/SLG-A.png',
        images: [
          '/images/SLG-A.png',
          '/images/SLG-A3dmodel.jpg',
          '/images/SLG-Adrawing.jpg',
          '/images/schemaSLG-A.jpg',
        ],
        features: [
          'Прочность и надежность',
          'Долговечность конструкции',
          'Простота установки',
          'Автоматическое управление',
          'Защита от коррозии',
          'Гарантия 5 лет',
        ],
        price: 95000,
        oldPrice: 110000,
        currency: 'RUB',
        category: 'Ворота для дома',
        categoryId: 1,
        slug: 'sliding-gates-doorhan-50',
        sku: 'DH-SG-50',
        inStock: true,
        stockQuantity: 8,
        isNew: false,
        isPopular: true,
        isFeatured: false,
        rating: 4.6,
        reviews: 89,
        color: '#F6A800',
        hoverColor: '#00205B',
        specifications: [
          { name: 'Ширина проёма, мм', value: '2 000–7 500' },
          { name: 'Высота проема, мм', value: '1 000–3 200' },
          { name: 'Материал', value: 'Алюминий' },
          { name: 'Просвет, мм', value: 'От 74' },
          { name: 'Гарантия', value: '5 лет' },
        ],
        colors: [
          { name: 'Белый', value: 'white', hex: '#FFFFFF' },
          { name: 'Серый', value: 'gray', hex: '#6B7280' },
          { name: 'Коричневый', value: 'brown', hex: '#8B4513' },
        ],
        relatedProducts: [1, 3, 4],
        seoTitle: 'Откатные ворота DoorHan 50 - DoorHan Крым',
        seoDescription:
          'Качественные откатные ворота DoorHan 50 для больших проемов. Установка и гарантия в Крыму.',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
      },
    };

    return products[id] || products['1'];
  };

  const product: Product = getProductById(productId);

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
      {/* Хлебные крошки */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8 max-w-7xl"
      >
        <BreadCrumbs productName={product.name} />

        {/* Основная информация о товаре */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Галерея изображений */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Главное изображение */}

            <div className="relative aspect-square bg-white rounded-3xl shadow-soft overflow-hidden">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
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
                    Math.min(product.images.length - 1, selectedImage + 1)
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              {/* Индикаторы */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {product.images.map((_, index) => (
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
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all ${
                    index === selectedImage
                      ? 'border-[#F6A800]'
                      : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Информация о товаре */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Заголовок и рейтинг */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-[#F6A800]/10 text-[#F6A800] px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#00205B] font-montserrat mb-4">
                {product.title || product.name}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(product.rating)
                          ? 'text-[#F6A800] fill-current'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {product.rating} ({product.reviews} отзывов)
                  </span>
                </div>
              </div>
            </div>

            {/* Цена */}
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

            {/* Описание */}
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>

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

        {/* Характеристики */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="bg-white rounded-3xl shadow-soft p-8">
            <h2 className="text-2xl font-bold text-[#00205B] font-montserrat mb-8">
              Характеристики
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.specifications.map((spec, index) => (
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
              ))}
            </div>
          </div>
        </motion.div>

        {/* Преимущества */}
        <motion.div variants={itemVariants} className="mb-16">
          <h2 className="text-2xl font-bold text-[#00205B] font-montserrat mb-8 text-center">
            Преимущества товара
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.features.map((feature, index) => (
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
    </main>
  );
}
