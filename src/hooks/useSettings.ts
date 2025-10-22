import { useState, useEffect } from 'react';

interface SettingsData {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  phoneDescription: string;
  emailDescription: string;
  addressDescription: string;
  workingHoursDescription: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData>({
    phone: '+7 (978) 294 41 49',
    email: 'zakaz@doorhan-zavod.ru',
    address: 'Симферополь, ул. Примерная, 1',
    workingHours: 'Пн-Пт: 9:00-18:00, Сб: 9:00-15:00',
    phoneDescription: 'Звонки принимаются ежедневно',
    emailDescription: 'Ответим в течение часа',
    addressDescription: 'Офис и выставочный зал',
    workingHoursDescription: 'Воскресенье - выходной',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
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
      // Используем значения по умолчанию при ошибке
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
}
