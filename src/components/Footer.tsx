'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  ArrowUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import RegionSelector from './RegionSelector';
import { useSettings } from '@/hooks/useSettings';

const Footer = () => {
  const { settings } = useSettings();

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const footerSections = [
    {
      title: 'Продукция',
      links: [
        { name: 'Ворота', href: '#gates' },
        { name: 'Роллеты', href: '#rollers' },
        { name: 'Автоматика', href: '#automation' },
        { name: 'Фурнитура', href: '#hardware' },
      ],
    },
    {
      title: 'Услуги',
      links: [
        { name: 'Установка', href: '#installation' },
        { name: 'Сервис', href: '#service' },
        { name: 'Гарантия', href: '#warranty' },
        { name: 'Консультации', href: '#consultation' },
      ],
    },
    {
      title: 'Компания',
      links: [
        { name: 'О нас', href: '#about' },
        { name: 'История', href: '#history' },
        { name: 'Сертификаты', href: '#certificates' },
        { name: 'Партнеры', href: '#partners' },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: 'Телефон',
      content: settings.phone,
      href: `tel:${settings.phone.replace(/\D/g, '')}`,
    },
    {
      icon: Mail,
      title: 'Email',
      content: settings.email,
      href: `mailto:${settings.email}`,
    },
    {
      icon: MapPin,
      title: 'Адрес',
      content: settings.address,
      href: '#',
    },
    {
      icon: Clock,
      title: 'Режим работы',
      content: settings.workingHours,
      href: '#',
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-[#00205B] text-white">
      {/* Основной контент футера */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Логотип и описание */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="relative w-12 h-12">
                <Image
                  src="https://crimea-doorhan.ru/local/templates/skd/images/logo.svg"
                  alt="DoorHan Крым"
                  fill
                  className="object-contain filter brightness-0 invert"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold font-montserrat">
                  DoorHan Крым
                </h3>
                <p className="text-sm text-gray-300">
                  Официальный представитель
                </p>
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Официальный представитель DoorHan в Крыму. Качественные ворота,
              роллеты и автоматические системы с 1993 года.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className="p-2 bg-white/10 hover:bg-[#F6A800] rounded-lg transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </Link>
              ))}
            </div>
          </div>

          {/* Секции меню */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold mb-4 font-montserrat">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-[#F6A800] transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Контактная информация */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start space-x-3"
              >
                <div className="p-2 bg-[#F6A800] rounded-lg flex-shrink-0">
                  <contact.icon size={16} />
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-1">{contact.title}</h5>
                  <Link
                    href={contact.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {contact.content}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Региональные поддомены */}
      <RegionSelector variant="footer" />

      {/* Нижняя полоса */}
      <div className="bg-[#00153E] py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-300 text-center md:text-left">
              © 2024 DoorHan Крым. Все права защищены.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                href="#privacy"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Политика конфиденциальности
              </Link>
              <Link
                href="#terms"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Условия использования
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка "Наверх" */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 p-3 bg-[#F6A800] hover:bg-[#ffb700] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Наверх"
      >
        <ArrowUp size={20} />
      </motion.button>
    </footer>
  );
};

export default Footer;
