import { useState, useEffect } from 'react';

export interface SiteSettings {
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
  
  // Карта
  mapIframe: string;
  
  // Кастомные CSS и JS
  customCss?: string | null;
  customJs?: string | null;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/settings');
        const result = await response.json();
        
        if (result.success) {
          setSettings(result.data);
        } else {
          setError('Ошибка при загрузке настроек');
        }
      } catch (err) {
        setError('Ошибка при загрузке настроек');
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
