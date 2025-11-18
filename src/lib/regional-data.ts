/**
 * Региональные контактные данные для каждого поддомена
 * Теперь данные берутся из базы данных через API
 */

export interface RegionalContactData {
  phone: string;
  phoneFormatted: string; // Для отображения
  email: string;
  address: string;
  addressDescription?: string | null;
  workingHours: string;
  workingHoursDescription?: string | null;
  mapIframe?: string | null; // HTML для карты
  officeName?: string | null; // Название офиса
  phoneDescription?: string | null; // Описание телефона
}

// Fallback данные на случай, если БД недоступна
const fallbackContacts: Record<string, RegionalContactData> = {
  default: {
    phone: '+7 (978) 294 41 49',
    phoneFormatted: '+7 (978) 294 41 49',
    email: 'info@doorhan-crimea.ru',
    address: 'Симферополь, ул. Примерная, 1',
    addressDescription: 'Офис и выставочный зал',
    workingHours: 'Пн-Пт: 9:00-18:00, Сб: 9:00-15:00',
    workingHoursDescription: 'Воскресенье - выходной',
    officeName: 'Главный офис',
  },
};

/**
 * Получает региональные контактные данные по региону из БД
 */
export async function getRegionalContacts(region: string): Promise<RegionalContactData> {
  try {
    // Используем публичный API endpoint
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/regions`, {
      cache: 'no-store',
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const regionData = result.data.find((r: { code: string }) => 
          r.code === region
        );
        
        if (regionData) {
          return {
            phone: regionData.phone,
            phoneFormatted: regionData.phoneFormatted,
            email: regionData.email,
            address: regionData.address,
            addressDescription: regionData.addressDescription,
            workingHours: regionData.workingHours,
            workingHoursDescription: regionData.workingHoursDescription,
            mapIframe: regionData.mapIframe,
            officeName: regionData.officeName,
            phoneDescription: regionData.phoneDescription || null,
          };
        }
        
        // Если регион не найден, пробуем default
        const defaultData = result.data.find((r: { code: string }) => r.code === 'default');
        if (defaultData) {
          return {
            phone: defaultData.phone,
            phoneFormatted: defaultData.phoneFormatted,
            email: defaultData.email,
            address: defaultData.address,
            addressDescription: defaultData.addressDescription,
            workingHours: defaultData.workingHours,
            workingHoursDescription: defaultData.workingHoursDescription,
            mapIframe: defaultData.mapIframe,
            officeName: defaultData.officeName,
            phoneDescription: defaultData.phoneDescription || null,
          };
        }
      }
    }
  } catch (error) {
    console.error('Error fetching regional contacts:', error);
  }
  
  // Fallback на статические данные
  return fallbackContacts[region] || fallbackContacts.default;
}

/**
 * Получает регион из заголовков запроса (клиентская сторона)
 */
export function getRegionFromClient(): string {
  if (typeof window === 'undefined') return 'default';
  
  const host = window.location.host;
  const subdomain = host.split('.')[0];
  
  if (subdomain === 'simferopol') return 'simferopol';
  if (subdomain === 'yalta') return 'yalta';
  if (subdomain === 'alushta') return 'alushta';
  if (subdomain === 'sevastopol') return 'sevastopol';
  
  return 'default';
}

