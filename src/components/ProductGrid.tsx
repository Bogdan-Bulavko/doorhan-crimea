'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Shield,
  Star,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

const ProductGrid = () => {
  const products = [
    {
      id: 1,
      name: 'Гаражные секционные ворота RSD02LUX',
      title: 'Гаражные секционные ворота RSD02LUX',
      description:
        'Легкая и прочная панель из алюминия обладает высокой коррозионной стойкостью',
      shortDescription: 'Секционные ворота с автоматическим приводом',
      image: '/images/RSD02LUX.webp',
      images: [
        '/images/RSD02LUX.webp',
        '/images/RSD02LUX2padding.jpg',
        '/images/RSD02LUXdrawing.jpg',
        '/images/RSD02LUXscheme.png',
      ],
      features: ['Лёгкость', 'Прочность', 'Гарантия 10 лет'],
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
      icon: Shield,
      bgColor: 'bg-[#00205B]',
      bgHoverColor: 'hover:bg-[#00153E]',
      href: '/categories/products/1',
    },
    {
      id: 2,
      name: 'Откатные уличные ворота SLG-A',
      title: 'Откатные уличные ворота SLG-A',
      description:
        'Легкие и надежные ворота с уникальной конструкцией из алюминия',
      shortDescription: 'Прочные откатные ворота для больших проемов',
      image: '/images/SLG-A.png',
      images: [
        '/images/SLG-A.png',
        '/images/SLG-A3dmodel.jpg',
        '/images/SLG-Adrawing.jpg',
        '/images/schemaSLG-A.jpg',
      ],
      features: ['Прочность', 'Долговечность', 'Простота установки'],
      price: 95000,
      oldPrice: 110000,
      currency: 'RUB',
      category: 'Ворота для дома',
      categoryId: 1,
      slug: 'sliding-gates-slg-a',
      sku: 'SLG-A-001',
      inStock: true,
      stockQuantity: 8,
      isNew: false,
      isPopular: true,
      isFeatured: false,
      rating: 4.6,
      reviews: 89,
      color: '#F6A800',
      hoverColor: '#00205B',
      icon: Shield,
      bgColor: 'bg-[#F6A800]',
      bgHoverColor: 'hover:bg-[#ffb700]',
      href: '/categories/products/2',
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
                <div className="absolute inset-0 z-10">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                  ></Image>
                </div>
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
                  {product.title || product.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {product.shortDescription || product.description}
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
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-[#00205B]">
                      {product.price?.toLocaleString('ru-RU')}{' '}
                      {product.currency || '₽'}
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {product.oldPrice.toLocaleString('ru-RU')}{' '}
                        {product.currency || '₽'}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/categories/products/${product.id}`}
                    className={`group/btn ${product.bgColor || product.color} ${
                      product.bgHoverColor || product.hoverColor
                    } text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 hover:scale-105`}
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
