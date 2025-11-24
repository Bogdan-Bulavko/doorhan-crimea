'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, CheckCircle, MessageSquare } from 'lucide-react';

interface RequestQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequestQuoteModal = ({ isOpen, onClose }: RequestQuoteModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'contact',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage(result.message);
        setFormData({ name: '', phone: '', email: '', message: '' });
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          onClose();
        }, 3000);
      } else {
        setSubmitMessage(
          result.message || 'Произошла ошибка при отправке заявки'
        );
      }
    } catch (error) {
      console.error('Request quote form error:', error);
      setSubmitMessage(
        'Произошла ошибка при отправке заявки. Попробуйте еще раз.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ name: '', phone: '', email: '', message: '' });
      setSubmitMessage('');
      setIsSubmitted(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#F6A800] rounded-lg">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#00205B] font-montserrat">
                  Запросить расчёт
                </h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#00205B] mb-2">
                    Заявка отправлена!
                  </h3>
                  <p className="text-gray-600">
                    Мы подготовим коммерческое предложение в течение рабочего дня
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Имя */}
                  <div>
                    <label
                      htmlFor="quoteName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Ваше имя *
                    </label>
                    <input
                      type="text"
                      id="quoteName"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F6A800] focus:border-transparent transition-colors"
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  {/* Телефон */}
                  <div>
                    <label
                      htmlFor="quotePhone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      id="quotePhone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F6A800] focus:border-transparent transition-colors"
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="quoteEmail"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="quoteEmail"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F6A800] focus:border-transparent transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Сообщение */}
                  <div>
                    <label
                      htmlFor="quoteMessage"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Параметры ворот и пожелания *
                    </label>
                    <textarea
                      id="quoteMessage"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F6A800] focus:border-transparent transition-colors resize-none"
                      placeholder="Опишите параметры ворот, размеры, комплектацию..."
                    />
                  </div>

                  {/* Чекбокс согласия */}
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="quotePrivacyConsent"
                      required
                      className="mt-1 w-4 h-4 text-[#F6A800] border-gray-300 rounded focus:ring-[#F6A800]"
                    />
                    <label htmlFor="quotePrivacyConsent" className="text-sm text-gray-700">
                      Даю согласие на{' '}
                      <a
                        href="/pages/personal-data"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="text-[#F6A800] underline hover:text-[#ffb700]"
                      >
                        обработку персональных данных
                      </a>
                    </label>
                  </div>

                  {/* Сообщения об ошибках/успехе */}
                  {submitMessage && (
                    <div
                      className={`p-3 rounded-xl text-center ${
                        submitMessage.includes('успешно') ||
                        submitMessage.includes('отправлена')
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {submitMessage}
                    </div>
                  )}

                  {/* Кнопки */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-[#F6A800] hover:bg-[#ffb700] text-white px-4 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Отправляем...</span>
                        </>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4" />
                          <span>Запросить расчёт</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RequestQuoteModal;

