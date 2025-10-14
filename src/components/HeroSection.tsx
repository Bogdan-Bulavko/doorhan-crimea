'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Award, Users, Clock } from 'lucide-react';

const HeroSection = () => {
  const features = [
    { icon: Shield, text: 'Гарантия качества' },
    { icon: Award, text: 'Сертификаты' },
    { icon: Users, text: 'Опытная команда' },
    { icon: Clock, text: 'Быстрая установка' },
  ];

  const titleCites = {
    default: 'Крыму',
    simferopol: 'Симферополе',
    sevastopol: 'Севастополе',
    alusta: 'Алуште',
    yalta: 'Ялте',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Градиентный фон */}
      <div className="absolute inset-0 gradient-primary">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Анимированные элементы фона */}
      <div className="absolute inset-0 overflow-hidden">
        {[
          { left: 10, top: 20, duration: 3.5, delay: 0.5 },
          { left: 80, top: 15, duration: 4.2, delay: 1.2 },
          { left: 25, top: 60, duration: 3.8, delay: 0.8 },
          { left: 70, top: 75, duration: 4.5, delay: 1.5 },
          { left: 45, top: 40, duration: 3.2, delay: 0.3 },
          { left: 90, top: 50, duration: 4.0, delay: 1.0 },
        ].map((config, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#F6A800] rounded-full opacity-30"
            style={{
              left: `${config.left}%`,
              top: `${config.top}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              delay: config.delay,
            }}
          />
        ))}
      </div>

      {/* Основной контент */}
      <div className="container mx-auto px-4 pt-8 pb-8 md:py-20 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center text-white max-w-6xl mx-auto"
        >
          {/* Заголовок */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold font-montserrat mb-6 leading-tight"
          >
            <span className="block">Ворота и роллеты</span>
            <span className="block text-[#F6A800]">DoorHan</span>
            <span className="block text-2xl md:text-3xl lg:text-4xl font-normal mt-4">
              в {titleCites.default}
            </span>
          </motion.h1>

          {/* Подзаголовок */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Официальный представитель DoorHan в Крыму. Качественные ворота,
            роллеты и автоматические системы с гарантией качества.
          </motion.p>

          {/* CTA кнопки */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link
              href="/categories"
              className="group bg-[#F6A800] hover:bg-[#ffb700] text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
            >
              <span>Посмотреть продукцию</span>
              <ArrowRight
                className="group-hover:translate-x-1 transition-transform"
                size={20}
              />
            </Link>
            <Link
              href="#contacts"
              className="group border-2 border-white hover:bg-white hover:text-[#00205B] text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center space-x-2"
            >
              <span>Получить консультацию</span>
              <ArrowRight
                className="group-hover:translate-x-1 transition-transform"
                size={20}
              />
            </Link>
          </motion.div>

          {/* Особенности */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto px-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={floatingVariants}
                animate="animate"
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/20"
              >
                <feature.icon
                  className="mx-auto mb-2 md:mb-3 text-[#F6A800]"
                  size={24}
                />
                <p className="text-xs md:text-sm font-medium leading-tight">
                  {feature.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Плавающие элементы */}
      <motion.div
        className="absolute top-1/4 left-10 hidden lg:block"
        variants={floatingVariants}
        animate="animate"
      >
        <div className="w-20 h-20 bg-[#F6A800]/20 rounded-full blur-xl"></div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 right-10 hidden lg:block"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 1 }}
      >
        <div className="w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </motion.div>

      {/* Стрелка вниз */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
