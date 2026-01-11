'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

const VideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Intersection Observer для запуска видео только при видимости
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Видео видно - можно запустить (но не автоматически на мобильных)
            // На мобильных видео будет запускаться только по нажатию пользователя
            // playsInline предотвращает автоматический полноэкранный режим
          } else {
            // Видео не видно - паузим, чтобы экономить трафик
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      {
        threshold: 0.3, // Видео должно быть видно минимум на 30%
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

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
          <div ref={containerRef} className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls
              loop
              muted
              preload="metadata"
              playsInline
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
          ></motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
