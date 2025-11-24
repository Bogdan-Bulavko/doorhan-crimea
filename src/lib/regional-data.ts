/**
 * Региональные контактные данные для каждого поддомена
 * Теперь данные берутся из базы данных через API
 * С кэшированием для улучшения производительности
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

// Клиентский кэш для регионов
interface CacheEntry {
  data: RegionalContactData;
  timestamp: number;
}

const regionsCache = new Map<string, CacheEntry>();

// Время жизни кэша: 5 минут (300000 мс)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Проверяет, действителен ли кэш
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

/**
 * Очищает устаревшие записи из кэша
 */
function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of regionsCache.entries()) {
    if (now - entry.timestamp >= CACHE_TTL) {
      regionsCache.delete(key);
    }
  }
}

// Периодическая очистка кэша (каждые 2 минуты)
if (typeof window !== 'undefined' && typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanExpiredCache();
  }, 2 * 60 * 1000);
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
 * С кэшированием для улучшения производительности
 */
export async function getRegionalContacts(region: string): Promise<RegionalContactData> {
  // Проверяем кэш для конкретного региона
  const cached = regionsCache.get(region);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }

  try {
    // Используем публичный API endpoint с кэшированием на уровне fetch
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Используем 'force-cache' для кэширования на уровне браузера
    // Next.js автоматически кэширует ответы API на сервере
    const response = await fetch(`${baseUrl}/api/regions`, {
      next: { revalidate: 300 }, // 5 минут для Next.js кэша
      cache: 'force-cache', // Используем кэш браузера
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const regionData = result.data.find((r: { code: string }) => 
          r.code === region
        );
        
        let regionalData: RegionalContactData;
        
        if (regionData) {
          regionalData = {
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
        } else {
          // Если регион не найден, пробуем default
          const defaultData = result.data.find((r: { code: string }) => r.code === 'default');
          if (defaultData) {
            regionalData = {
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
          } else {
            // Fallback на статические данные
            regionalData = fallbackContacts[region] || fallbackContacts.default;
          }
        }

        // Сохраняем в кэш
        regionsCache.set(region, {
          data: regionalData,
          timestamp: Date.now(),
        });

        return regionalData;
      }
    }
  } catch (error) {
    console.error('Error fetching regional contacts:', error);
    
    // Если есть кэш, даже устаревший, используем его при ошибке
    if (cached) {
      return cached.data;
    }
  }
  
  // Fallback на статические данные
  const fallbackData = fallbackContacts[region] || fallbackContacts.default;
  
  // Сохраняем fallback в кэш на короткое время (1 минута)
  regionsCache.set(region, {
    data: fallbackData,
    timestamp: Date.now(),
  });
  
  return fallbackData;
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

