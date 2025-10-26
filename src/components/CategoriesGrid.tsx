'use client';
// import { Category } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useMainCategories } from '@/hooks/useAllCategories';

const CategoriesGrid = () => {
  const { categories, loading, error } = useMainCategories();

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

  // Обработка ошибок
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Ошибка при загрузке категорий: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок секции */}
        <section className="bg-gradient-to-r from-[#00205B] to-[#00153E] text-white py-16 mb-8 rounded-xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Категории товаров
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Выберите категорию, чтобы просмотреть все доступные товары DoorHan
            </p>
          </div>
        </section>

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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                className="group"
              >
                <Link href={`/${category.slug}`}>
                  <div className="bg-white rounded-3xl shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-105 h-full flex flex-col">
                    {/* Изображение категории */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#ffb700] to-[#F6A800] rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-2xl font-bold">
                              {category.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Контент карточки */}
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-[#00205B] font-montserrat group-hover:text-[#F6A800] transition-colors">
                          {category.name}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3 flex-grow">
                        {category.description
                          ? category.description.length > 120
                            ? `${category.description.substring(0, 120)}...`
                            : category.description
                          : 'Описание категории'}
                      </p>
                      <div className="flex items-center justify-start mt-auto">
                        <span className="text-sm font-medium text-gray-600 group-hover:text-[#ffb700] bg-gray-100 group-hover:bg-[#ffb700]/10 px-4 py-2 rounded-lg group-hover:scale-105 transition-all duration-300">
                          Посмотреть товары
                        </span>
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
          <div className="bg-gradient-to-r from-[#00205B] to-[#00153E] rounded-xl p-8 md:p-16 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Нужна помощь с выбором?
            </h3>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Наши специалисты помогут подобрать оптимальное решение для вашего
              объекта
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#contacts"
                className="bg-[#F6A800] hover:bg-[#ffb700] text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
              >
                <span>Получить консультацию</span>
              </Link>
              <Link
                href="/"
                className="border-2 border-white hover:bg-white hover:text-[#00205B] text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>На главную</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CategoriesGrid;
