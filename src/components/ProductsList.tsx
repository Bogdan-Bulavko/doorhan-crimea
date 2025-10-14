'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Star,
  ShoppingCart,
  Eye,
  Heart,
  Zap,
} from 'lucide-react';

const ProductsList = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Получаем категорию из URL параметров
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, []);

  const categories = [
    { id: 'all', name: 'Все товары', count: 159 },
    { id: 'home', name: 'Ворота для дома', count: 24 },
    { id: 'garage', name: 'Ворота для гаража', count: 18 },
    { id: 'industrial', name: 'Промышленные ворота', count: 32 },
    { id: 'rollers', name: 'Роллеты', count: 28 },
    { id: 'automation', name: 'Автоматика', count: 15 },
    { id: 'locks', name: 'Замки и фурнитура', count: 42 },
  ];

  const products = [
    {
      id: 1,
      name: 'Секционные ворота DoorHan 40',
      description: 'Надежные секционные ворота с утеплением для частных домов',
      price: '125 000 ₽',
      oldPrice: '150 000 ₽',
      image: '/images/product-1.jpg',
      category: 'home',
      rating: 4.8,
      reviews: 24,
      inStock: true,
      isNew: true,
      features: ['Утепление', 'Автоматика', 'Гарантия 3 года'],
    },
    {
      id: 2,
      name: 'Откатные ворота DoorHan 50',
      description: 'Прочные откатные ворота для больших проемов',
      price: '95 000 ₽',
      oldPrice: null,
      image: '/images/product-2.jpg',
      category: 'home',
      rating: 4.6,
      reviews: 18,
      inStock: true,
      isNew: false,
      features: ['Прочность', 'Долговечность', 'Простота установки'],
    },
    {
      id: 3,
      name: 'Гаражные ворота DoorHan 30',
      description: 'Компактные гаражные ворота с автоматическим приводом',
      price: '85 000 ₽',
      oldPrice: '100 000 ₽',
      image: '/images/product-3.jpg',
      category: 'garage',
      rating: 4.9,
      reviews: 31,
      inStock: true,
      isNew: true,
      features: ['Автоматика', 'Безопасность', 'Экономия места'],
    },
    {
      id: 4,
      name: 'Промышленные ворота DoorHan 100',
      description: 'Мощные промышленные ворота для складов и ангаров',
      price: '250 000 ₽',
      oldPrice: null,
      image: '/images/product-4.jpg',
      category: 'industrial',
      rating: 4.7,
      reviews: 12,
      inStock: true,
      isNew: false,
      features: [
        'Высокая прочность',
        'Большие размеры',
        'Промышленная автоматика',
      ],
    },
    {
      id: 5,
      name: 'Роллеты DoorHan Roll',
      description: 'Защитные роллеты с электроприводом для окон и дверей',
      price: '45 000 ₽',
      oldPrice: '55 000 ₽',
      image: '/images/product-5.jpg',
      category: 'rollers',
      rating: 4.5,
      reviews: 22,
      inStock: true,
      isNew: true,
      features: ['Электропривод', 'Защита от взлома', 'Шумоизоляция'],
    },
    {
      id: 6,
      name: 'Автоматика DoorHan Drive',
      description: 'Система автоматизации для ворот и роллет',
      price: '35 000 ₽',
      oldPrice: null,
      image: '/images/product-6.jpg',
      category: 'automation',
      rating: 4.8,
      reviews: 19,
      inStock: true,
      isNew: false,
      features: [
        'Дистанционное управление',
        'Безопасность',
        'Простота монтажа',
      ],
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (
          parseInt(a.price.replace(/\D/g, '')) -
          parseInt(b.price.replace(/\D/g, ''))
        );
      case 'price-high':
        return (
          parseInt(b.price.replace(/\D/g, '')) -
          parseInt(a.price.replace(/\D/g, ''))
        );
      case 'rating':
        return b.rating - a.rating;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <section className="pt-12 pb-8 md:pt-24 md:pb-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Хлебные крошки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-gray-600 mb-8"
        >
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
          <span className="text-[#00205B] font-medium">Товары</span>
        </motion.div>

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
            </div>

            {/* Категории */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F6A800] focus:border-transparent"
            >
              {categories.map((category) => (
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
              {sortedProducts.length}
            </span>
          </p>
        </motion.div>

        {/* Сетка товаров */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {sortedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="group bg-white rounded-3xl shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <Link href={`/page-product`}>
                {/* Изображение товара */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-[#F6A800] rounded-full flex items-center justify-center">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                  </div>

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
                        {product.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({product.reviews} отзывов)
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#00205B] font-montserrat mb-2 group-hover:text-[#F6A800] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Особенности */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.features.slice(0, 2).map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Цена и кнопка */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-[#00205B]">
                        {product.price}
                      </div>
                      {product.oldPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {product.oldPrice}
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
                href="/contacts"
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
