'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { getAvailableVariables } from '@/lib/template-variables';
import { Info } from 'lucide-react';

interface SettingsData {
  // Основные контакты
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  phoneDescription: string;
  emailDescription: string;
  addressDescription: string;
  workingHoursDescription: string;
  
  // Глобальные SEO настройки
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  siteOgImage: string;
  
  // SEO для страниц каталога
  catalogTitle: string;
  catalogDescription: string;
  catalogKeywords: string;
  
  // SEO для страницы категорий
  categoriesTitle: string;
  categoriesDescription: string;
  categoriesKeywords: string;
  
  // SEO для домашней страницы
  homeSeoTitle: string;
  homeSeoDescription: string;
  homeH1: string;
  homeCanonicalUrl: string;
  homeRobotsMeta: string;
  homeSchemaMarkup: string;
  
  // Сквозная микроразметка
  globalSchemaMarkup: string;
  
  // Кастомные CSS и JS
  customCss: string;
  customJs: string;
  
  // Карта
  mapIframe: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    // Основные контакты
    phone: '+7 (978) 294 41 49',
    email: 'zakaz@doorhan-zavod.ru',
    address: 'Симферополь, ул. Примерная, 1',
    workingHours: 'Пн-Пт: 9:00-18:00, Сб: 9:00-15:00',
    phoneDescription: 'Звонки принимаются ежедневно',
    emailDescription: 'Ответим в течение часа',
    addressDescription: 'Офис и выставочный зал DoorHan Крым',
    workingHoursDescription: 'Воскресенье - выходной',
    
    // Глобальные SEO настройки
    siteTitle: 'DoorHan Крым - Ворота и автоматика',
    siteDescription: 'Официальный представитель DoorHan в Крыму. Ворота, автоматика, рольставни, шлагбаумы. Установка и обслуживание.',
    siteKeywords: 'DoorHan, ворота, автоматика, рольставни, шлагбаумы, Крым, Симферополь',
    siteOgImage: '',
    
    // SEO для страниц каталога
    catalogTitle: 'Каталог товаров DoorHan',
    catalogDescription: 'Полный каталог ворот, автоматики и аксессуаров DoorHan в Крыму',
    catalogKeywords: 'каталог, DoorHan, ворота, автоматика, товары',
    
    // SEO для страницы категорий
    categoriesTitle: 'Категории товаров DoorHan',
    categoriesDescription: 'Выберите категорию товаров DoorHan: ворота, автоматика, рольставни',
    categoriesKeywords: 'категории, DoorHan, ворота, автоматика, рольставни',
    
    // SEO для домашней страницы
    homeSeoTitle: '',
    homeSeoDescription: '',
    homeH1: '',
    homeCanonicalUrl: '',
    homeRobotsMeta: 'index, follow',
    homeSchemaMarkup: '',
    
    // Сквозная микроразметка
    globalSchemaMarkup: '',
    
    // Кастомные CSS и JS
    customCss: '',
    customJs: '',
    
    // Карта
    mapIframe: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();

  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const result = await response.json();
      
      if (result.success) {
        setSettings(prev => ({
          ...prev,
          ...result.data,
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showAlert({ type: 'error', title: 'Ошибка при загрузке настроек' });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();
      
      if (result.success) {
        showAlert({ type: 'success', title: 'Настройки успешно сохранены' });
      } else {
        showAlert({ type: 'error', title: result.message || 'Ошибка при сохранении настроек' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert({ type: 'error', title: 'Ошибка при сохранении настроек' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00205B]"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#00205B]">Настройки сайта</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[#00205B] text-white rounded-lg hover:bg-[#00153E] transition-colors disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      <div className="grid gap-6">
        {/* Основные контакты */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Основные контакты</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="+7 (978) 294 41 49"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание для телефона
              </label>
              <input
                type="text"
                value={settings.phoneDescription}
                onChange={(e) => handleChange('phoneDescription', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Звонки принимаются ежедневно"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="zakaz@doorhan-zavod.ru"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание для email
              </label>
              <input
                type="text"
                value={settings.emailDescription}
                onChange={(e) => handleChange('emailDescription', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Ответим в течение часа"
              />
            </div>
          </div>
        </div>

        {/* Адрес и режим работы */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Адрес и режим работы</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Симферополь, ул. Примерная, 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание для адреса
              </label>
              <input
                type="text"
                value={settings.addressDescription}
                onChange={(e) => handleChange('addressDescription', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Офис и выставочный зал"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Режим работы
              </label>
              <input
                type="text"
                value={settings.workingHours}
                onChange={(e) => handleChange('workingHours', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Пн-Пт: 9:00-18:00, Сб: 9:00-15:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание для режима работы
              </label>
              <input
                type="text"
                value={settings.workingHoursDescription}
                onChange={(e) => handleChange('workingHoursDescription', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Воскресенье - выходной"
              />
            </div>
          </div>
        </div>

        {/* Глобальные SEO настройки */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Глобальные SEO настройки</h2>
            <div className="group relative">
              <Info className="w-5 h-5 text-gray-400 cursor-help" />
              <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <p className="font-semibold mb-2">Доступные переменные:</p>
                {getAvailableVariables().map((v, i) => (
                  <p key={i} className="mb-1">
                    <code className="bg-gray-800 px-1 rounded">{v.variable}</code> - {v.description}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок сайта
              </label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => handleChange('siteTitle', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="DoorHan [город] - Ворота и автоматика"
              />
              <p className="text-xs text-gray-500 mt-1">
                Пример: DoorHan [город] - Ворота и автоматика
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание сайта
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Официальный представитель DoorHan в [город_в_предложном]..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Пример: Официальный представитель DoorHan в [город_в_предложном]. Ворота, роллеты, автоматические системы.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ключевые слова
              </label>
              <input
                type="text"
                value={settings.siteKeywords}
                onChange={(e) => handleChange('siteKeywords', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="DoorHan, ворота, автоматика, рольставни, шлагбаумы, Крым"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Open Graph изображение (URL)
              </label>
              <input
                type="url"
                value={settings.siteOgImage}
                onChange={(e) => handleChange('siteOgImage', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="https://example.com/og-image.jpg"
              />
            </div>
          </div>
        </div>

        {/* SEO для страниц каталога */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">SEO для страниц каталога</h2>
            <div className="group relative">
              <Info className="w-5 h-5 text-gray-400 cursor-help" />
              <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <p className="font-semibold mb-2">Доступные переменные:</p>
                {getAvailableVariables().map((v, i) => (
                  <p key={i} className="mb-1">
                    <code className="bg-gray-800 px-1 rounded">{v.variable}</code> - {v.description}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок страницы каталога
              </label>
              <input
                type="text"
                value={settings.catalogTitle}
                onChange={(e) => handleChange('catalogTitle', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Каталог товаров DoorHan в [город_в_предложном]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Пример: Каталог товаров DoorHan в [город_в_предложном]
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание страницы каталога
              </label>
              <textarea
                value={settings.catalogDescription}
                onChange={(e) => handleChange('catalogDescription', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Полный каталог ворот, автоматики и аксессуаров DoorHan в [город_в_предложном]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Пример: Полный каталог ворот, автоматики и аксессуаров DoorHan в [город_в_предложном]
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ключевые слова для каталога
              </label>
              <input
                type="text"
                value={settings.catalogKeywords}
                onChange={(e) => handleChange('catalogKeywords', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="каталог, DoorHan, ворота, автоматика, товары"
              />
            </div>
          </div>
        </div>

        {/* SEO для страницы категорий */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">SEO для страницы категорий</h2>
            <div className="group relative">
              <Info className="w-5 h-5 text-gray-400 cursor-help" />
              <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <p className="font-semibold mb-2">Доступные переменные:</p>
                {getAvailableVariables().map((v, i) => (
                  <p key={i} className="mb-1">
                    <code className="bg-gray-800 px-1 rounded">{v.variable}</code> - {v.description}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок страницы категорий
              </label>
              <input
                type="text"
                value={settings.categoriesTitle}
                onChange={(e) => handleChange('categoriesTitle', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Категории товаров DoorHan в [город_в_предложном]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Пример: Категории товаров DoorHan в [город_в_предложном]
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание страницы категорий
              </label>
              <textarea
                value={settings.categoriesDescription}
                onChange={(e) => handleChange('categoriesDescription', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Выберите категорию товаров DoorHan в [город_в_предложном]: ворота, автоматика, рольставни"
              />
              <p className="text-xs text-gray-500 mt-1">
                Пример: Выберите категорию товаров DoorHan в [город_в_предложном]: ворота, автоматика, рольставни
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ключевые слова для категорий
              </label>
              <input
                type="text"
                value={settings.categoriesKeywords}
                onChange={(e) => handleChange('categoriesKeywords', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="категории, DoorHan, ворота, автоматика, рольставни"
              />
            </div>
          </div>
        </div>

        {/* SEO для домашней страницы */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">SEO для домашней страницы</h2>
            <div className="group relative">
              <Info className="w-5 h-5 text-gray-400 cursor-help" />
              <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <p className="font-semibold mb-2">Доступные переменные:</p>
                {getAvailableVariables().map((v, i) => (
                  <p key={i} className="mb-1">
                    <code className="bg-gray-800 px-1 rounded">{v.variable}</code> - {v.description}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={settings.homeSeoTitle}
                onChange={(e) => handleChange('homeSeoTitle', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="DoorHan [город] - Ворота и автоматика"
              />
              <p className="text-xs text-gray-500 mt-1">
                Пример: DoorHan [город] - Ворота и автоматика
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
              </label>
              <textarea
                value={settings.homeSeoDescription}
                onChange={(e) => handleChange('homeSeoDescription', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Официальный представитель DoorHan в [город_в_предложном]. Ворота, роллеты, автоматические системы."
              />
              <p className="text-xs text-gray-500 mt-1">
                Пример: Официальный представитель DoorHan в [город_в_предложном]. Ворота, роллеты, автоматические системы.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                H1 заголовок
              </label>
              <input
                type="text"
                value={settings.homeH1}
                onChange={(e) => handleChange('homeH1', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="Ворота и автоматика DoorHan в [город_в_предложном]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Пример: Ворота и автоматика DoorHan в [город_в_предложном]
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canonical URL
              </label>
              <input
                type="text"
                value={settings.homeCanonicalUrl}
                onChange={(e) => handleChange('homeCanonicalUrl', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
                placeholder="https://example.com/ или оставьте пустым для автогенерации"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Robots Meta
              </label>
              <select
                value={settings.homeRobotsMeta}
                onChange={(e) => handleChange('homeRobotsMeta', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent"
              >
                <option value="index, follow">index, follow</option>
                <option value="noindex, follow">noindex, follow</option>
                <option value="index, nofollow">index, nofollow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schema Markup (JSON-LD)
              </label>
              <textarea
                value={settings.homeSchemaMarkup}
                onChange={(e) => handleChange('homeSchemaMarkup', e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent font-mono text-sm"
                placeholder='{"@context":"https://schema.org","@type":"Organization",...}'
              />
              <p className="text-sm text-gray-500 mt-2">
                JSON-LD разметка для главной страницы. Будет выведена в &lt;head&gt;.
              </p>
            </div>
          </div>
        </div>

        {/* Сквозная микроразметка */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Сквозная микроразметка</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Global Schema Markup (JSON-LD)
              </label>
              <textarea
                value={settings.globalSchemaMarkup}
                onChange={(e) => handleChange('globalSchemaMarkup', e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent font-mono text-sm"
                placeholder='{"@context":"https://schema.org","@type":"Organization",...}'
              />
              <p className="text-sm text-gray-500 mt-2">
                JSON-LD разметка, которая будет выводиться на всех страницах сайта (например, Organization).
              </p>
            </div>
          </div>
        </div>

        {/* Кастомные CSS и JS */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Кастомные CSS и JS</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom CSS
              </label>
              <textarea
                value={settings.customCss}
                onChange={(e) => handleChange('customCss', e.target.value)}
                rows={10}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent font-mono text-sm"
                placeholder="/* Ваш кастомный CSS код */"
              />
              <p className="text-sm text-gray-500 mt-2">
                Кастомный CSS код будет добавлен в &lt;head&gt; страницы.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom JavaScript
              </label>
              <textarea
                value={settings.customJs}
                onChange={(e) => handleChange('customJs', e.target.value)}
                rows={10}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent font-mono text-sm"
                placeholder="// Ваш кастомный JavaScript код"
              />
              <p className="text-sm text-gray-500 mt-2">
                Кастомный JavaScript код будет добавлен перед закрывающим тегом &lt;/body&gt;.
              </p>
            </div>
          </div>
        </div>

        {/* Карта */}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Карта</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Код iframe карты (Яндекс.Карты)
              </label>
              <textarea
                value={settings.mapIframe}
                onChange={(e) => handleChange('mapIframe', e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00205B] focus:border-transparent font-mono text-sm"
                placeholder='<iframe src="https://yandex.ru/map-widget/v1/?um=constructor%3A..." width="100%" height="400" frameborder="0"></iframe>'
              />
              <p className="text-sm text-gray-500 mt-2">
                Вставьте код iframe карты из Яндекс.Карт. Код будет отображаться в секции &quot;Как нас найти&quot;.
              </p>
            </div>
          </div>
        </div>

        {/* Предварительный просмотр */}
        <div className="rounded-xl border bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Предварительный просмотр</h2>
          <div className="grid gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Контакты (главная страница)</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <strong>Телефон:</strong> {settings.phone}
                  <br />
                  <span className="text-gray-500">{settings.phoneDescription}</span>
                </div>
                <div>
                  <strong>Email:</strong> {settings.email}
                  <br />
                  <span className="text-gray-500">{settings.emailDescription}</span>
                </div>
                <div>
                  <strong>Адрес:</strong> {settings.address}
                  <br />
                  <span className="text-gray-500">{settings.addressDescription}</span>
                </div>
                <div>
                  <strong>Режим работы:</strong> {settings.workingHours}
                  <br />
                  <span className="text-gray-500">{settings.workingHoursDescription}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">SEO настройки</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <strong>Заголовок сайта:</strong> {settings.siteTitle}
                </div>
                <div>
                  <strong>Описание:</strong> {settings.siteDescription}
                </div>
                <div>
                  <strong>Ключевые слова:</strong> {settings.siteKeywords}
                </div>
              </div>
            </div>
            
            {settings.mapIframe && (
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Карта</h3>
                <div className="text-sm text-gray-600">
                  <p>Карта будет отображаться в секции &quot;Как нас найти&quot;</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
