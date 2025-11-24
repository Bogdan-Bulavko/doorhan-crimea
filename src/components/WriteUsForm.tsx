'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface WriteUsFormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const initialState: WriteUsFormState = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

export default function WriteUsForm() {
  const [formData, setFormData] = useState<WriteUsFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: 'contact',
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus('success');
        setFormData(initialState);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Write-us form error:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-[#00205B] rounded-3xl p-8 shadow-xl w-full">
      <h3 className="text-2xl font-bold font-montserrat mb-2">Напишите нам</h3>
      <p className="text-gray-600 mb-6">
        Оставьте сообщение — менеджер свяжется с вами в течение 15 минут в рабочее время.
      </p>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <label htmlFor="writeName" className="text-sm font-medium text-gray-700 block mb-1">
            Ваше имя *
          </label>
          <input
            id="writeName"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#F6A800] focus:border-transparent transition-colors"
            placeholder="Введите имя"
          />
        </div>

        <div>
          <label htmlFor="writeEmail" className="text-sm font-medium text-gray-700 block mb-1">
            Email *
          </label>
          <input
            id="writeEmail"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#F6A800] focus:border-transparent transition-colors"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="writePhone" className="text-sm font-medium text-gray-700 block mb-1">
            Телефон *
          </label>
          <input
            id="writePhone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#F6A800] focus:border-transparent transition-colors"
            placeholder="+7 (___) ___-__-__"
          />
        </div>

        <div>
          <label htmlFor="writeMessage" className="text-sm font-medium text-gray-700 block mb-1">
            Сообщение *
          </label>
          <textarea
            id="writeMessage"
            name="message"
            rows={4}
            required
            value={formData.message}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-[#F6A800] focus:border-transparent transition-colors resize-none"
            placeholder="Расскажите, что вам нужно..."
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            required
            className="mt-1 h-4 w-4 text-[#F6A800] border-gray-300 rounded focus:ring-[#F6A800]"
          />
          <span>
            Подтверждаю согласие с{' '}
            <a
              href="/pages/personal-data"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-[#F6A800] underline hover:text-[#ffb700]"
            >
              правилами обработки персональных данных
            </a>
          </span>
        </label>

        {status === 'success' && (
          <div className="bg-green-50 text-green-700 border border-green-200 rounded-2xl px-4 py-3 text-sm">
            Сообщение отправлено! Мы ответим вам в ближайшее время.
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl px-4 py-3 text-sm">
            Не удалось отправить сообщение. Попробуйте позже.
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 bg-[#00205B] text-white rounded-2xl px-6 py-3 font-semibold hover:bg-[#001a4a] transition-colors disabled:opacity-60"
        >
          {isSubmitting ? (
            'Отправляем...'
          ) : (
            <>
              <Send size={18} />
              <span>Написать нам</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

