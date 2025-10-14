'use client';

import { motion } from 'framer-motion';
import {
  Award,
  Users,
  Shield,
  Clock,
  CheckCircle,
  Building2,
  Star,
} from 'lucide-react';

const AboutSection = () => {
  const values = [
    {
      icon: Shield,
      title: 'Качество',
      description:
        'Используем только сертифицированные материалы и комплектующие',
    },
    {
      icon: Users,
      title: 'Опыт',
      description: 'Более 30 лет работы на рынке ворот и автоматики',
    },
    {
      icon: Award,
      title: 'Надежность',
      description: 'Гарантируем долговечность и стабильную работу',
    },
    {
      icon: Clock,
      title: 'Скорость',
      description: 'Быстрая установка и оперативное сервисное обслуживание',
    },
  ];

  const achievements = [
    {
      year: '1993',
      title: 'Основание компании',
      description: 'Начало работы в сфере ворот и автоматики',
    },
    {
      year: '2005',
      title: 'Официальный партнер DoorHan',
      description: 'Стали официальным представителем в Крыму',
    },
    {
      year: '2015',
      title: 'Расширение ассортимента',
      description: 'Добавили роллетные системы и умную автоматику',
    },
    {
      year: '2024',
      title: 'Современные технологии',
      description: 'Внедрили IoT решения и системы умного дома',
    },
  ];

  const team = [
    {
      name: 'Александр Петров',
      position: 'Директор',
      experience: '15 лет опыта',
      image: '/images/team-1.jpg',
    },
    {
      name: 'Мария Сидорова',
      position: 'Менеджер по продажам',
      experience: '8 лет опыта',
      image: '/images/team-2.jpg',
    },
    {
      name: 'Дмитрий Козлов',
      position: 'Главный инженер',
      experience: '12 лет опыта',
      image: '/images/team-3.jpg',
    },
  ];

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
    <section
      id="about"
      className="pt-12 pb-8 md:py-20 bg-gradient-to-br from-gray-50 to-white"
    >
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
            О компании DoorHan Крым
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Мы — официальный представитель DoorHan в Крыму с более чем 30-летним
            опытом работы
          </p>
        </motion.div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Текстовая часть */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-[#00205B] font-montserrat mb-4">
              Наша история
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Компания DoorHan Крым была основана в 1993 году и с тех пор
              является ведущим поставщиком ворот, роллет и автоматических систем
              в регионе. Мы гордимся тем, что являемся официальным
              представителем DoorHan — одного из мировых лидеров в области
              производства ворот и автоматики.
            </p>
            <p className="text-gray-600 leading-relaxed">
              За годы работы мы установили более 15 000 ворот и роллет, заслужив
              доверие тысяч клиентов. Наша команда состоит из сертифицированных
              специалистов, которые постоянно повышают свою квалификацию и
              следят за новейшими технологиями.
            </p>

            <div className="flex items-center space-x-4 pt-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-[#F6A800]" fill="currentColor" />
                <span className="text-sm text-gray-600">
                  4.9/5 рейтинг клиентов
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-[#F6A800]" />
                <span className="text-sm text-gray-600">
                  Сертифицированные мастера
                </span>
              </div>
            </div>
          </motion.div>

          {/* Изображение */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-[#00205B] to-[#00153E] rounded-3xl p-12 text-white h-full flex items-center justify-center">
              <div className="text-center">
                <Building2 className="w-20 h-20 text-[#F6A800] mx-auto mb-6" />
                <h4 className="text-2xl font-bold font-montserrat mb-4">
                  Официальный представитель
                </h4>
                <p className="text-gray-200 mb-6">
                  DoorHan — мировой лидер в производстве ворот и автоматики
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-[#F6A800]">30+</div>
                    <div className="text-sm text-gray-300">Лет опыта</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#F6A800]">
                      15K+
                    </div>
                    <div className="text-sm text-gray-300">Установок</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Наши ценности */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-2xl font-bold text-[#00205B] font-montserrat text-center mb-12">
            Наши ценности
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F6A800]/10 rounded-2xl mb-4 group-hover:bg-[#F6A800]/20 transition-colors duration-300">
                  <value.icon className="w-8 h-8 text-[#F6A800]" />
                </div>
                <h4 className="text-lg font-semibold text-[#00205B] mb-2 font-montserrat">
                  {value.title}
                </h4>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* История компании */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-24"
        >
          <h3 className="text-xl md:text-2xl font-bold text-[#00205B] font-montserrat text-center mb-8 md:mb-12">
            История развития
          </h3>

          {/* Новый дизайн - горизонтальная карточная система */}
          <div className="px-4 md:px-6 lg:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  {/* Карточка */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                    {/* Год - в верхней части карточки */}
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#F6A800] to-[#E59400] text-white rounded-2xl font-bold text-lg shadow-lg">
                        {achievement.year}
                      </div>
                    </div>

                    {/* Заголовок */}
                    <h4 className="text-lg md:text-xl font-bold text-[#00205B] mb-3 font-montserrat leading-tight">
                        {achievement.title}
                      </h4>

                    {/* Описание */}
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed flex-grow">
                        {achievement.description}
                      </p>
                    </div>

                  {/* Номер этапа (опционально) */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#00205B] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                    {index + 1}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Дополнительная информация */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <div className="bg-gradient-to-r from-[#00205B] to-[#1a3a6b] rounded-2xl p-6 md:p-8 text-white">
                <h4 className="text-lg md:text-xl font-bold mb-2 font-montserrat">
                  Более 30 лет развития
                </h4>
                <p className="text-gray-300 text-sm md:text-base">
                  От небольшой компании до ведущего представителя DoorHan в
                  Крыму
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Команда */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-[#00205B] font-montserrat text-center mb-12">
            Наша команда
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#00205B] to-[#00153E] rounded-full mx-auto flex items-center justify-center">
                    <Users className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#F6A800] text-white px-3 py-1 rounded-full text-xs font-medium">
                    {member.experience}
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-[#00205B] mb-1 font-montserrat">
                  {member.name}
                </h4>
                <p className="text-gray-600 text-sm">{member.position}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
