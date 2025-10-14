'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Shield,
  CheckCircle,
  Heart,
  Share2,
  Download,
  Phone,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Package,
  Wrench,
} from 'lucide-react';

export default function PageProduct() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('blue');
  const [quantity, setQuantity] = useState(1);

  // Пример данных товара (замените на реальные данные)
  const product = {
    id: 1,
    name: 'Секционные ворота DoorHan 4.0',
    category: 'Ворота для дома',
    price: 125000,
    oldPrice: 145000,
    rating: 4.8,
    reviews: 127,
    images: [
      '/images/product-1.jpg',
      '/images/product-2.jpg',
      '/images/product-3.jpg',
      '/images/product-4.jpg',
    ],
    colors: [
      { name: 'Синий', value: 'blue', hex: '#00205B' },
      { name: 'Белый', value: 'white', hex: '#FFFFFF' },
      { name: 'Серый', value: 'gray', hex: '#6B7280' },
    ],
    features: [
      'Автоматическое открытие/закрытие',
      'Защита от взлома',
      'Изоляция тепла и шума',
      'Современный дизайн',
      'Простая установка',
      'Гарантия 5 лет',
    ],
    specifications: [
      { name: 'Ширина', value: 'до 6 метров' },
      { name: 'Высота', value: 'до 3 метров' },
      { name: 'Материал', value: 'Оцинкованная сталь' },
      { name: 'Изоляция', value: 'Полиуретан 40мм' },
      { name: 'Привод', value: 'Электрический' },
      { name: 'Гарантия', value: '5 лет' },
    ],
    description:
      'Секционные ворота DoorHan 4.0 — это современное решение для защиты и удобства. Высокое качество материалов и продуманная конструкция обеспечивают надежность и долговечность.',
  };

  const relatedProducts = [
    {
      id: 2,
      name: 'Распашные ворота DoorHan Classic',
      price: 98000,
      image: '/images/related-1.jpg',
    },
    {
      id: 3,
      name: 'Откатные ворота DoorHan Pro',
      price: 156000,
      image: '/images/related-2.jpg',
    },
    {
      id: 4,
      name: 'Роллеты DoorHan Security',
      price: 75000,
      image: '/images/related-3.jpg',
    },
  ];

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
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-100 py-4"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#F6A800] transition-colors">
              Главная
            </Link>
            <span>/</span>
            <Link
              href="/categories"
              className="hover:text-[#F6A800] transition-colors"
            >
              Категории
            </Link>
            <span>/</span>
            <Link
              href="/products"
              className="hover:text-[#F6A800] transition-colors"
            >
              Ворота для дома
            </Link>
            <span>/</span>
            <span className="text-[#00205B] font-medium">{product.name}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8 max-w-7xl"
      >
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
                    fill
                    className="object-cover"
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
                {product.name}
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
                {product.price.toLocaleString('ru-RU')} ₽
              </span>
              {product.oldPrice && (
                <span className="text-xl text-gray-500 line-through">
                  {product.oldPrice.toLocaleString('ru-RU')} ₽
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

            {/* Цвета */}
            <div>
              <h3 className="text-lg font-semibold text-[#00205B] mb-3">
                Цвет:
              </h3>
              <div className="flex space-x-3">
                {product.colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-12 h-12 rounded-xl border-2 transition-all ${
                      selectedColor === color.value
                        ? 'border-[#F6A800] scale-110'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

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

        {/* Дополнительные услуги */}
        <motion.div variants={itemVariants} className="mb-16">
          <h2 className="text-2xl font-bold text-[#00205B] font-montserrat mb-8 text-center">
            Дополнительные услуги
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00205B] to-[#1a3a6b] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#00205B] mb-2">
                Установка
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Профессиональная установка нашими специалистами
              </p>
              <span className="text-[#F6A800] font-bold">от 15 000 ₽</span>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00205B] to-[#1a3a6b] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#00205B] mb-2">
                Гарантия
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Расширенная гарантия до 7 лет
              </p>
              <span className="text-[#F6A800] font-bold">от 5 000 ₽</span>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00205B] to-[#1a3a6b] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#00205B] mb-2">
                Доставка
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Быстрая доставка по всему Крыму
              </p>
              <span className="text-[#F6A800] font-bold">от 3 000 ₽</span>
            </div>
          </div>
        </motion.div>

        {/* Похожие товары */}
        <motion.div variants={itemVariants} className="mb-16">
          <h2 className="text-2xl font-bold text-[#00205B] font-montserrat mb-8 text-center">
            Похожие товары
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/product/${relatedProduct.id}`}
                className="group bg-white rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#00205B] mb-2 group-hover:text-[#F6A800] transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <span className="text-xl font-bold text-[#F6A800]">
                    {relatedProduct.price.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </Link>
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
