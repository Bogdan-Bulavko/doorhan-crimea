'use client';

import { motion } from 'framer-motion';

const VideoSection = () => {
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

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-12"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#00205B] font-montserrat mb-6"
          >
            Посмотрите на DoorHan
            <span className="block text-[#F6A800] mt-2">в действии</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Убедитесь в качестве и надёжности наших ворот и автоматических
            систем
          </motion.p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
            <video
              className="w-full h-full object-cover"
              poster="/video-poster.jpg"
              controls
              loop
              preload="metadata"
            >
              <source src="/video.mp4" type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>

            {/* Декоративные элементы */}
            <div className="absolute top-4 left-4 bg-[#F6A800] text-white px-3 py-1 rounded-full text-sm font-medium">
              Демонстрация
            </div>
          </div>

          {/* Дополнительная информация под видео */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600 text-lg mb-6">
              Хотите увидеть больше? Посетите наш шоу-рум или закажите выезд
              специалиста
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#F6A800] hover:bg-[#ffb700] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Записаться на просмотр
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-[#00205B] hover:bg-[#00205B] text-[#00205B] hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                Вызвать замерщика
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
