/**
 * Утилиты для работы с Canonical URL
 * Поддерживает:
 * - Автоматическую генерацию на основе slug
 * - Кастомные canonical из БД
 * - Учет поддоменов
 * - Два формата: относительный и полный URL
 */

// Базовый домен (без www)
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'zavod-doorhan.ru';

// Протокол для production
const PROTOCOL = process.env.NODE_ENV === 'production' ? 'https' : 'http';

/**
 * Маппинг регионов на поддомены
 */
const REGION_SUBDOMAIN_MAP: Record<string, string | null> = {
  default: null, // Основной домен без поддомена
  simferopol: 'simferopol',
  yalta: 'yalta',
  alushta: 'alushta',
  sevastopol: 'sevastopol',
};

/**
 * Получает полный домен для региона
 * @param region - код региона ('default', 'simferopol', и т.д.)
 * @returns полный домен (например: 'zavod-doorhan.ru' или 'simferopol.zavod-doorhan.ru')
 */
export function getDomainForRegion(region: string): string {
  const subdomain = REGION_SUBDOMAIN_MAP[region];
  
  if (!subdomain) {
    return BASE_DOMAIN;
  }
  
  return `${subdomain}.${BASE_DOMAIN}`;
}

/**
 * Получает полный URL с протоколом для региона
 * @param region - код региона
 * @param path - путь (например: '/garage-vorota' или '/garage-vorota/dhs-2')
 * @returns полный URL (например: 'https://simferopol.zavod-doorhan.ru/garage-vorota')
 */
export function getFullUrlForRegion(region: string, path: string): string {
  const domain = getDomainForRegion(region);
  
  // Нормализуем путь (убираем дублирующие слеши)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${PROTOCOL}://${domain}${normalizedPath}`;
}

/**
 * Генерирует canonical URL для категории
 * @param categorySlug - slug категории
 * @param region - код региона
 * @param customCanonical - кастомный canonical из БД (опционально)
 * @param useFullUrl - использовать полный URL (true) или относительный (false)
 * @returns canonical URL
 */
export function generateCategoryCanonical(
  categorySlug: string,
  region: string,
  customCanonical?: string | null,
  useFullUrl: boolean = true
): string {
  // Если есть кастомный canonical, используем его
  if (customCanonical) {
    // Проверяем, является ли это полным URL
    if (customCanonical.startsWith('http://') || customCanonical.startsWith('https://')) {
      return customCanonical;
    }
    
    // Если это относительный путь, формируем полный URL при необходимости
    if (useFullUrl) {
      return getFullUrlForRegion(region, customCanonical);
    }
    
    return customCanonical.startsWith('/') ? customCanonical : `/${customCanonical}`;
  }
  
  // Генерируем автоматически на основе slug (поддерживает вложенные категории)
  // categorySlug может быть строкой с путём типа "parent/child"
  const path = categorySlug.startsWith('/') ? categorySlug : `/${categorySlug}`;
  
  if (useFullUrl) {
    return getFullUrlForRegion(region, path);
  }
  
  return path;
}

/**
 * Генерирует canonical URL для товара
 * @param categorySlug - slug категории
 * @param productSlug - slug товара
 * @param region - код региона
 * @param customCanonical - кастомный canonical из БД (опционально)
 * @param useFullUrl - использовать полный URL (true) или относительный (false)
 * @returns canonical URL
 */
export function generateProductCanonical(
  categorySlug: string,
  productSlug: string,
  region: string,
  customCanonical?: string | null,
  useFullUrl: boolean = true
): string {
  // Если есть кастомный canonical, используем его
  if (customCanonical) {
    // Проверяем, является ли это полным URL
    if (customCanonical.startsWith('http://') || customCanonical.startsWith('https://')) {
      return customCanonical;
    }
    
    // Если это относительный путь, формируем полный URL при необходимости
    if (useFullUrl) {
      return getFullUrlForRegion(region, customCanonical);
    }
    
    return customCanonical.startsWith('/') ? customCanonical : `/${customCanonical}`;
  }
  
  // Генерируем автоматически на основе slug (поддерживает вложенные категории)
  // categorySlug может быть строкой с путём типа "parent/child"
  const categoryPath = categorySlug.startsWith('/') ? categorySlug : `/${categorySlug}`;
  const path = `${categoryPath}/${productSlug}`;
  
  if (useFullUrl) {
    return getFullUrlForRegion(region, path);
  }
  
  return path;
}

/**
 * Генерирует canonical URL для статической страницы
 * @param pageSlug - slug страницы
 * @param region - код региона
 * @param customCanonical - кастомный canonical из БД (опционально)
 * @param useFullUrl - использовать полный URL (true) или относительный (false)
 * @returns canonical URL
 */
export function generatePageCanonical(
  pageSlug: string,
  region: string,
  customCanonical?: string | null,
  useFullUrl: boolean = true
): string {
  // Если есть кастомный canonical, используем его
  if (customCanonical) {
    // Проверяем, является ли это полным URL
    if (customCanonical.startsWith('http://') || customCanonical.startsWith('https://')) {
      return customCanonical;
    }
    
    // Если это относительный путь, формируем полный URL при необходимости
    if (useFullUrl) {
      return getFullUrlForRegion(region, customCanonical);
    }
    
    return customCanonical.startsWith('/') ? customCanonical : `/${customCanonical}`;
  }
  
  // Генерируем автоматически на основе slug
  const path = `/pages/${pageSlug}`;
  
  if (useFullUrl) {
    return getFullUrlForRegion(region, path);
  }
  
  return path;
}

/**
 * Извлекает регион из заголовков (установленных middleware)
 * @param headers - объект Headers из Next.js
 * @returns код региона
 */
export function getRegionFromHeaders(headers: Headers): string {
  return headers.get('x-region') || 'default';
}

/**
 * Извлекает host из заголовков
 * @param headers - объект Headers из Next.js
 * @returns host
 */
export function getHostFromHeaders(headers: Headers): string {
  return headers.get('host') || BASE_DOMAIN;
}

/**
 * Определяет, должен ли canonical указывать на основной домен (без поддомена)
 * Это полезно для SEO, чтобы избежать дублирования контента между поддоменами
 * @param forceMainDomain - принудительно использовать основной домен
 * @returns true, если нужно использовать основной домен
 */
export function shouldUseMainDomain(forceMainDomain: boolean = false): boolean {
  // В production canonical всегда должен указывать на основной домен
  // чтобы избежать дублирования контента
  if (process.env.NEXT_PUBLIC_CANONICAL_USE_MAIN_DOMAIN === 'true' || forceMainDomain) {
    return true;
  }
  
  return false;
}

/**
 * Универсальная функция генерации canonical для любого типа страницы
 * @param type - тип страницы ('category', 'product', 'page', 'home')
 * @param region - код региона
 * @param options - дополнительные параметры
 * @returns canonical URL
 */
export function generateCanonical(
  type: 'category' | 'product' | 'page' | 'home',
  region: string,
  options: {
    categorySlug?: string;
    productSlug?: string;
    pageSlug?: string;
    customCanonical?: string | null;
    useFullUrl?: boolean;
    forceMainDomain?: boolean;
  } = {}
): string {
  const {
    categorySlug,
    productSlug,
    pageSlug,
    customCanonical,
    useFullUrl = true,
    forceMainDomain = false,
  } = options;
  
  // Если нужно использовать основной домен, меняем регион на 'default'
  const effectiveRegion = shouldUseMainDomain(forceMainDomain) ? 'default' : region;
  
  switch (type) {
    case 'category':
      if (!categorySlug) throw new Error('categorySlug is required for category canonical');
      return generateCategoryCanonical(categorySlug, effectiveRegion, customCanonical, useFullUrl);
      
    case 'product':
      if (!categorySlug || !productSlug) {
        throw new Error('categorySlug and productSlug are required for product canonical');
      }
      return generateProductCanonical(
        categorySlug,
        productSlug,
        effectiveRegion,
        customCanonical,
        useFullUrl
      );
      
    case 'page':
      if (!pageSlug) throw new Error('pageSlug is required for page canonical');
      return generatePageCanonical(pageSlug, effectiveRegion, customCanonical, useFullUrl);
      
    case 'home':
      if (customCanonical) {
        if (customCanonical.startsWith('http://') || customCanonical.startsWith('https://')) {
          return customCanonical;
        }
        if (useFullUrl) {
          return getFullUrlForRegion(effectiveRegion, customCanonical);
        }
        return customCanonical.startsWith('/') ? customCanonical : `/${customCanonical}`;
      }
      
      return useFullUrl ? getFullUrlForRegion(effectiveRegion, '/') : '/';
      
    default:
      throw new Error(`Unknown canonical type: ${type}`);
  }
}

