'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  Building2,
  Users,
  Award,
  Clock,
  Shield,
  Star,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    {
      icon: Building2,
      number: 30,
      suffix: '+',
      label: 'Лет на рынке',
      description: 'Опыт работы с 1993 года',
      color: 'text-[#F6A800]',
      bgColor: 'bg-[#F6A800]/10',
    },
    {
      icon: Users,
      number: 15000,
      suffix: '+',
      label: 'Довольных клиентов',
      description: 'Установили наши ворота',
      color: 'text-[#00205B]',
      bgColor: 'bg-[#00205B]/10',
    },
    {
      icon: Award,
      number: 50,
      suffix: '+',
      label: 'Сертификатов качества',
      description: 'Международные стандарты',
      color: 'text-[#F6A800]',
      bgColor: 'bg-[#F6A800]/10',
    },
    {
      icon: Clock,
      number: 24,
      suffix: '/7',
      label: 'Служба поддержки',
      description: 'Всегда готовы помочь',
      color: 'text-[#00205B]',
      bgColor: 'bg-[#00205B]/10',
    },
  ];

  const achievements = [
    {
      icon: Shield,
      title: 'Гарантия 5 лет',
      description: 'На всю продукцию и установку',
    },
    {
      icon: Star,
      title: 'Премиум качество',
      description: 'Только оригинальные комплектующие',
    },
    {
      icon: TrendingUp,
      title: 'Постоянное развитие',
      description: 'Новые технологии и решения',
    },
    {
      icon: CheckCircle,
      title: 'Сертифицированные мастера',
      description: 'Профессиональная установка',
    },
  ];

  const AnimatedNumber = ({
    value,
    suffix = '',
    duration = 2000,
  }: {
    value: number;
    suffix?: string;
    duration?: number;
  }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      if (!isInView) return;

      let startTime: number;
      let animationId: number;
      const startValue = 0;
      const endValue = value;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue =
          startValue + (endValue - startValue) * easeOutQuart;

        setDisplayValue(Math.floor(currentValue));

        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        }
      };

      animationId = requestAnimationFrame(animate);

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }, [value, duration]);

    return (
      <span className="text-4xl md:text-5xl lg:text-6xl font-bold font-montserrat">
        {displayValue.toLocaleString()}
        {suffix}
      </span>
    );
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

  return (
    <section className="pt-12 pb-8 md:py-20 bg-gradient-to-br from-gray-50 to-white">
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
            DoorHan в цифрах
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Более 30 лет мы обеспечиваем качество и надежность для наших
            клиентов
          </p>
        </motion.div>

        {/* Статистика */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center group"
            >
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${stat.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className={`w-10 h-10 ${stat.color}`} />
              </div>
              <div className={`${stat.color} mb-2`}>
                <AnimatedNumber value={stat.number} suffix={stat.suffix} />
              </div>
              <h3 className="text-xl font-semibold text-[#00205B] mb-2 font-montserrat">
                {stat.label}
              </h3>
              <p className="text-gray-600 text-sm">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Достижения */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-soft p-12 md:p-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-[#00205B] font-montserrat mb-4">
              Наши преимущества
            </h3>
            <p className="text-gray-600">Почему клиенты выбирают именно нас</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F6A800]/10 rounded-xl mb-4 group-hover:bg-[#F6A800]/20 transition-colors duration-300">
                  <achievement.icon className="w-8 h-8 text-[#F6A800]" />
                </div>
                <h4 className="text-lg font-semibold text-[#00205B] mb-2 font-montserrat">
                  {achievement.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
