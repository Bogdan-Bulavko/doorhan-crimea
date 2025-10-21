'use client';
import { useEffect, useMemo, useState } from 'react';
import { Category } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Home,
  Car,
  Warehouse,
  Lock,
  Shield,
  Settings,
  Zap,
} from 'lucide-react';

const CategoriesGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true); // ✅ Добавить состояние загрузки

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

  const fallbackOption: Category[] = useMemo(
    () => [
      {
        id: 1,
        name: 'Ворота для дома',
        description:
          'Секционные, распашные и откатные ворота для частных домов',
        image: '/RSD02LUX.webp',
        icon: Home,
        color: 'bg-blue-500',
        hoverColor: 'hover:bg-blue-600',
        productCount: 24,
        href: '/categories/products?category=home',
      },
      {
        id: 2,
        name: 'Ворота для гаража',
        description: 'Автоматические и механические ворота для гаражей',
        image: '/RSD02LUX.webp',
        icon: Car,
        color: 'bg-green-500',
        hoverColor: 'hover:bg-green-600',
        productCount: 18,
        href: '/categories/products?category=garage',
      },
      {
        id: 3,
        name: 'Промышленные ворота',
        description: 'Ворота для складов, ангаров и промышленных объектов',
        image: '/RSD02LUX.webp',
        icon: Warehouse,
        color: 'bg-purple-500',
        hoverColor: 'hover:bg-purple-600',
        productCount: 32,
        href: '/categories/products?category=industrial',
      },
      {
        id: 4,
        name: 'Роллеты',
        description: 'Защитные роллеты для окон, дверей и витрин',
        image: '/RSD02LUX.webp',
        icon: Shield,
        color: 'bg-orange-500',
        hoverColor: 'hover:bg-orange-600',
        productCount: 28,
        href: '/categories/products?category=rollers',
      },
      {
        id: 5,
        name: 'Автоматика',
        description: 'Системы автоматизации для ворот и роллет',
        image: '/RSD02LUX.webp',
        icon: Settings,
        color: 'bg-red-500',
        hoverColor: 'hover:bg-red-600',
        productCount: 15,
        href: '/categories/products?category=automation',
      },
      {
        id: 6,
        name: 'Замки и фурнитура',
        description: 'Замки, ручки и другая фурнитура для ворот',
        image: '/RSD02LUX.webp',
        icon: Lock,
        color: 'bg-indigo-500',
        hoverColor: 'hover:bg-indigo-600',
        productCount: 42,
        href: '/categories/products?category=locks',
      },
    ],
    []
  );

  useEffect(() => {
    // Используем только локальные данные, так как у нас есть только 2 товара
    setCategories(fallbackOption);
    setLoading(false);
  }, [fallbackOption]);

  return (
    <section className="pt-12 pb-8 md:pt-8 md:pb-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Заголовок секции */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#00205B] font-montserrat mb-6">
            Категории товаров
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Выберите категорию, чтобы просмотреть все доступные товары DoorHan
          </p>
        </motion.div>

        {/* ✅ Убрать Suspense и использовать loading состояние */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6A800]"></div>
            <span className="ml-4 text-gray-600">Загрузка категорий...</span>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                className="group"
              >
                <Link href={category.href}>
                  <div className="bg-white rounded-3xl shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105">
                    {/* Изображение категории */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <category.icon className="w-16 h-16 text-gray-400" />
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 text-[#00205B] px-3 py-1 rounded-full text-sm font-medium">
                          {category.productCount} товаров
                        </span>
                      </div>
                    </div>

                    {/* Контент карточки */}
                    <div className="p-8">
                      <div className="flex items-center space-x-3 mb-4">
                        <div
                          className={`p-3 ${category.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}
                        >
                          <category.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-[#00205B] font-mонтserrat group-hover:text-[#F6A800] transition-colors">
                          {category.name}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Посмотреть товары
                        </span>
                        <div
                          className={`${category.color} ${category.hoverColor} text-white p-2 rounded-lg group-hover:scale-110 transition-all duration-300`}
                        >
                          <Zap className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA секция */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-[#00205B] to-[#00153E] rounded-3xl p-8 md:p-16 text-white">
            <h3 className="text-2xl md:text-3xl font-bold font-montserrat mb-4">
              Нужна помощь с выбором?
            </h3>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Наши специалисты помогут подобрать оптимальное решение для вашего
              объекта
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#contacts"
                className="bg-[#F6A800] hover:bg-[#ffb700] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
              >
                <span>Получить консультацию</span>
              </Link>
              <Link
                href="/"
                className="border-2 border-white hover:bg-white hover:text-[#00205B] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>На главную</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
