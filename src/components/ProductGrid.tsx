'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Settings,
  Zap,
  Lock,
  Star,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

const ProductGrid = () => {
  const products = [
    {
      id: 1,
      title: 'Секционные ворота DoorHan 40',
      description: 'Надежные секционные ворота с утеплением для частных домов',
      image: '/images/product-1.jpg',
      features: ['Утепление', 'Автоматика', 'Гарантия 3 года'],
      price: '125 000 ₽',
      category: 'Ворота для дома',
      icon: Shield,
      color: 'bg-[#00205B]',
      hoverColor: 'hover:bg-[#00153E]',
      href: '/categories/products/',
    },
    {
      id: 2,
      title: 'Откатные ворота DoorHan 50',
      description: 'Прочные откатные ворота для больших проемов',
      image: '/images/product-2.jpg',
      features: ['Прочность', 'Долговечность', 'Простота установки'],
      price: '95 000 ₽',
      category: 'Ворота для дома',
      icon: Shield,
      color: 'bg-[#F6A800]',
      hoverColor: 'hover:bg-[#ffb700]',
      href: '/categories/products/',
    },
    {
      id: 3,
      title: 'Гаражные ворота DoorHan 30',
      description: 'Компактные гаражные ворота с автоматическим приводом',
      image: '/images/product-3.jpg',
      features: ['Автоматика', 'Безопасность', 'Экономия места'],
      price: '85 000 ₽',
      category: 'Ворота для гаража',
      icon: Settings,
      color: 'bg-[#00205B]',
      hoverColor: 'hover:bg-[#00153E]',
      href: '/categories/products/',
    },
    {
      id: 4,
      title: 'Промышленные ворота DoorHan 100',
      description: 'Мощные промышленные ворота для складов и ангаров',
      image: '/images/product-4.jpg',
      features: [
        'Высокая прочность',
        'Большие размеры',
        'Промышленная автоматика',
      ],
      price: '250 000 ₽',
      category: 'Промышленные ворота',
      icon: Shield,
      color: 'bg-[#F6A800]',
      hoverColor: 'hover:bg-[#ffb700]',
      href: '/categories/products/',
    },
    {
      id: 5,
      title: 'Роллеты DoorHan Roll',
      description: 'Защитные роллеты с электроприводом для окон и дверей',
      image: '/images/product-5.jpg',
      features: ['Электропривод', 'Защита от взлома', 'Шумоизоляция'],
      price: '45 000 ₽',
      category: 'Роллеты',
      icon: Lock,
      color: 'bg-[#00205B]',
      hoverColor: 'hover:bg-[#00153E]',
      href: '/categories/products/',
    },
    {
      id: 6,
      title: 'Автоматика DoorHan Drive',
      description: 'Система автоматизации для ворот и роллет',
      image: '/images/product-6.jpg',
      features: [
        'Дистанционное управление',
        'Безопасность',
        'Простота монтажа',
      ],
      price: '35 000 ₽',
      category: 'Автоматика',
      icon: Settings,
      color: 'bg-[#F6A800]',
      hoverColor: 'hover:bg-[#ffb700]',
      href: '/categories/products/',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="products" className="pt-12 pb-8 md:py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Заголовок секции */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#00205B] font-montserrat mb-6">
            Наша продукция
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Широкий ассортимент качественных ворот, роллет и автоматических
            систем
          </p>
        </motion.div>

        {/* Сетка продуктов */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="group bg-white rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#F6A800]/20"
            >
              {/* Изображение продукта */}
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00205B]/20 to-[#F6A800]/20 z-10"></div>
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <product.icon className="w-16 h-16 text-gray-400" />
                </div>
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-white/90 text-[#00205B] px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 z-20">
                  <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                    <Star
                      className="w-5 h-5 text-[#F6A800]"
                      fill="currentColor"
                    />
                  </div>
                </div>
              </div>

              {/* Контент карточки */}
              <div className="p-8">
                <h3 className="text-xl font-bold text-[#00205B] mb-3 font-montserrat group-hover:text-[#F6A800] transition-colors">
                  {product.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {product.description}
                </p>

                {/* Особенности */}
                <div className="mb-4">
                  {product.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <CheckCircle className="w-4 h-4 text-[#F6A800] flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Цена и кнопка */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-[#00205B] font-montserrat">
                      {product.price}
                    </span>
                  </div>
                  <Link
                    href={product.href + product.id}
                    className={`group/btn ${product.color} ${product.hoverColor} text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 hover:scale-105`}
                  >
                    <span>Подробнее</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Hover эффект */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F6A800]/5 to-[#00205B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </motion.div>
          ))}
        </motion.div>

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
              Нужна консультация?
            </h3>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Наши специалисты помогут подобрать оптимальное решение для вашего
              объекта
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#contacts"
                className="bg-[#F6A800] hover:bg-[#ffb700] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
              >
                <span>Получить консультацию</span>
                <ExternalLink size={20} />
              </Link>
              <Link
                href="/categories"
                className="border-2 border-white hover:bg-white hover:text-[#00205B] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Интернет-магазин</span>
                <ExternalLink size={20} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductGrid;
