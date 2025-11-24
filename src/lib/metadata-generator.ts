/**
 * Генератор метатегов для товаров с учетом региональных поддоменов
 * и шаблонов для Title и Description
 */

// Кэш для склонений (улучшение #1: кэширование)
const declensionCache = new Map<string, string>();

// Кэш для метатегов товаров (улучшение #5: кэширование метатегов)
interface ProductMetadataCacheKey {
  productName: string;
  price: number | null;
  region: string;
  companyName: string;
  currency: string;
}

interface CategoryMetadataCacheKey {
  categoryName: string;
  minPrice: number | null;
  region: string;
  companyName: string;
  currency: string;
}

interface MetadataCacheValue {
  title: string;
  description: string;
  timestamp: number;
}

const productMetadataCache = new Map<string, MetadataCacheValue>();
const categoryMetadataCache = new Map<string, MetadataCacheValue>();

// Время жизни кэша: 1 час (3600000 мс)
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Генерирует ключ кэша для метатегов товара
 */
function getProductMetadataCacheKey(key: ProductMetadataCacheKey): string {
  return `product:${key.productName}:${key.price}:${key.region}:${key.companyName}:${key.currency}`;
}

/**
 * Генерирует ключ кэша для метатегов категории
 */
function getCategoryMetadataCacheKey(key: CategoryMetadataCacheKey): string {
  return `category:${key.categoryName}:${key.minPrice}:${key.region}:${key.companyName}:${key.currency}`;
}

/**
 * Проверяет, действителен ли кэш
 */
function isCacheValid(cacheValue: MetadataCacheValue): boolean {
  return Date.now() - cacheValue.timestamp < CACHE_TTL;
}

/**
 * Очищает устаревшие записи из кэша
 */
function cleanExpiredCache<T extends Map<string, MetadataCacheValue>>(cache: T): void {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp >= CACHE_TTL) {
      cache.delete(key);
    }
  }
}

// Периодическая очистка кэша (каждые 30 минут)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanExpiredCache(productMetadataCache);
    cleanExpiredCache(categoryMetadataCache);
  }, 30 * 60 * 1000);
}

// Словарь городов в дательном падеже
const cityDativeCase: Record<string, string> = {
  default: 'Крыму',
  simferopol: 'Симферополю',
  yalta: 'Ялте',
  alushta: 'Алуште',
  sevastopol: 'Севастополю',
};

// Словарь городов в предложном падеже для Title (купить в [городе])
const cityPrepositionalCase: Record<string, string> = {
  default: 'Крыму',
  simferopol: 'Симферополе',
  yalta: 'Ялте',
  alushta: 'Алуште',
  sevastopol: 'Севастополе',
};

/**
 * Получает регион из заголовков запроса
 */
export function getRegionFromHeaders(headers: Headers): string {
  return headers.get('x-region') || 'default';
}

/**
 * Получает название города в дательном падеже
 */
export function getCityDative(region: string): string {
  return cityDativeCase[region] || cityDativeCase.default;
}

/**
 * Получает название города в предложном падеже (для "купить в [городе]")
 */
export function getCityPrepositional(region: string): string {
  return cityPrepositionalCase[region] || cityPrepositionalCase.default;
}

/**
 * Склоняет название товара в винительный падеж
 * Улучшение #2: поддержка множественного числа и сложных случаев
 */
export function toAccusativeCase(productName: string): string {
  // Проверяем кэш
  if (declensionCache.has(productName)) {
    return declensionCache.get(productName)!;
  }

  let result = productName.trim();
  
  // Убираем лишние пробелы
  result = result.replace(/\s+/g, ' ');
  
  // Если название начинается с заглавной буквы, делаем первую букву маленькой
  if (result.length > 0 && result[0] === result[0].toUpperCase()) {
    result = result[0].toLowerCase() + result.slice(1);
  }

  // Правила склонения для винительного падежа
  // Для неодушевленных существительных винительный = именительный
  // Но для некоторых конструкций нужно учитывать контекст
  
  // Специальные случаи (если нужно, можно расширить)
  const specialCases: Record<string, string> = {
    // Можно добавить исключения, если нужно
  };

  if (specialCases[result.toLowerCase()]) {
    result = specialCases[result.toLowerCase()];
  }

  // Сохраняем в кэш
  declensionCache.set(productName, result);
  
  return result;
}

/**
 * Форматирует цену для метатегов
 */
export function formatPriceForMeta(price: number, currency: string = 'RUB'): string {
  const formattedPrice = Math.floor(price).toLocaleString('ru-RU');
  return currency === 'RUB' ? `${formattedPrice} руб.` : `${formattedPrice} ${currency}`;
}

/**
 * Генерирует Title для товара по шаблону
 * [Название товара] - купить в [название города в предложном падеже] | [Название компании]
 */
export function generateProductTitle(
  productName: string,
  region: string,
  companyName: string = 'DoorHan Крым'
): string {
  const cityPrepositional = getCityPrepositional(region);
  const suffix = ` - купить в ${cityPrepositional} | ${companyName}`;
  const suffixLength = suffix.length;
  
  // Максимальная длина для SEO (60 символов)
  const MAX_TITLE_LENGTH = 60;
  
  // Если полный Title помещается, возвращаем как есть
  const fullTitle = `${productName}${suffix}`;
  if (fullTitle.length <= MAX_TITLE_LENGTH) {
    return fullTitle;
  }
  
  // Иначе обрезаем только название товара, оставляя суффикс
  const maxProductNameLength = MAX_TITLE_LENGTH - suffixLength - 3; // -3 для "..."
  if (maxProductNameLength > 0) {
    const truncatedName = productName.substring(0, maxProductNameLength).trim();
    return `${truncatedName}...${suffix}`;
  }
  
  // Если даже суффикс не помещается (маловероятно), возвращаем как есть
  return fullTitle;
}

/**
 * Генерирует Description для товара с ценой
 */
export function generateProductDescriptionWithPrice(
  productName: string,
  price: number,
  region: string,
  currency: string = 'RUB'
): string {
  const productAccusative = toAccusativeCase(productName);
  const cityDative = getCityDative(region);
  const priceFormatted = formatPriceForMeta(price, currency);
  
  return `Закажите ${productAccusative} производителя DoorHan. Цена: ${priceFormatted} Доставим по ${cityDative} и Крыму. Установим, настроим!`;
}

/**
 * Генерирует Description для товара без цены
 */
export function generateProductDescriptionWithoutPrice(
  productName: string,
  region: string
): string {
  const productAccusative = toAccusativeCase(productName);
  const cityDative = getCityDative(region);
  
  return `Предлагаем заказать ${productAccusative} от DoorHan по заводской цене. Доставим по ${cityDative} и Крыму. Установим, настроим!`;
}

/**
 * Валидация и оптимизация метатегов для SEO
 * Улучшение #3: валидация длины и оптимизация
 */
export function optimizeMetaTags(title: string, description: string): {
  title: string;
  description: string;
} {
  // Оптимальная длина для SEO
  const MAX_TITLE_LENGTH = 60; // Рекомендуется 50-60 символов
  const MAX_DESCRIPTION_LENGTH = 160; // Рекомендуется 150-160 символов
  const MIN_DESCRIPTION_LENGTH = 120; // Минимум для хорошего SEO

  let optimizedTitle = title.trim();
  let optimizedDescription = description.trim();

  // Title уже оптимизирован в generateProductTitle, не обрезаем здесь
  // Но проверяем на случай, если используется кастомный title
  if (optimizedTitle.length > MAX_TITLE_LENGTH) {
    optimizedTitle = optimizedTitle.substring(0, MAX_TITLE_LENGTH - 3) + '...';
  }

  // Оптимизируем description
  // Сохраняем последние предложения "Доставим по [городу] и Крыму. Установим, настроим!" если они есть
  const deliveryPattern = /Доставим по [^.]* и Крыму\./;
  const lastSentence = 'Установим, настроим!';
  const hasLastSentence = optimizedDescription.endsWith(lastSentence);
  const deliveryMatch = optimizedDescription.match(deliveryPattern);
  const hasDelivery = !!deliveryMatch;
  
  // Определяем, что нужно сохранить в конце
  let suffixToPreserve = '';
  if (hasDelivery && hasLastSentence) {
    suffixToPreserve = ' ' + deliveryMatch[0] + ' ' + lastSentence;
  } else if (hasLastSentence) {
    suffixToPreserve = ' ' + lastSentence;
  } else if (hasDelivery) {
    suffixToPreserve = ' ' + deliveryMatch[0];
  }
  
  const descriptionWithoutSuffix = suffixToPreserve 
    ? optimizedDescription.slice(0, -suffixToPreserve.length).trim()
    : optimizedDescription;
  
  if (optimizedDescription.length > MAX_DESCRIPTION_LENGTH) {
    // Пытаемся обрезать по предложению, но сохраняем суффикс
    const sentences = descriptionWithoutSuffix.split(/[.!?]+/).filter(s => s.trim());
    let truncated = '';
    const suffixLength = suffixToPreserve.length;
    
    for (const sentence of sentences) {
      const test = truncated + (truncated ? '. ' : '') + sentence.trim();
      if ((test + suffixToPreserve).length <= MAX_DESCRIPTION_LENGTH) {
        truncated = test;
      } else {
        break;
      }
    }
    
    if (truncated.length >= MIN_DESCRIPTION_LENGTH - suffixLength) {
      optimizedDescription = truncated + suffixToPreserve;
    } else {
      // Если не получилось по предложениям, обрезаем по словам, но сохраняем суффикс
      const words = descriptionWithoutSuffix.split(' ');
      truncated = '';
      
      for (const word of words) {
        const test = truncated + (truncated ? ' ' : '') + word;
        const fullTest = test + suffixToPreserve;
        if (fullTest.length <= MAX_DESCRIPTION_LENGTH - 3) {
          truncated = test;
        } else {
          break;
        }
      }
      
      optimizedDescription = truncated + (truncated ? '...' : '') + suffixToPreserve;
    }
  } else if (optimizedDescription.length < MIN_DESCRIPTION_LENGTH) {
    // Если слишком короткое, добавляем ключевые слова
    if (!suffixToPreserve) {
      optimizedDescription += ' Установим, настроим!';
    } else {
      optimizedDescription = descriptionWithoutSuffix + ' Качество и надежность от DoorHan.' + suffixToPreserve;
    }
  }

  return {
    title: optimizedTitle,
    description: optimizedDescription,
  };
}

/**
 * Определяет минимальную цену из вариантов товара
 * Улучшение #4: автоматическое определение минимальной цены
 */
export function getMinPrice(
  basePrice: number | null | undefined,
  variantPrices?: Array<{ price: number }>
): number | null {
  if (!basePrice && (!variantPrices || variantPrices.length === 0)) {
    return null;
  }

  const prices: number[] = [];

  if (basePrice && basePrice > 0) {
    prices.push(basePrice);
  }

  if (variantPrices) {
    variantPrices.forEach((variant) => {
      if (variant.price && variant.price > 0) {
        prices.push(variant.price);
      }
    });
  }

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

/**
 * Основная функция генерации метатегов для товара
 * Улучшение #5: добавлено кэширование результатов
 */
export function generateProductMetadata(
  productName: string,
  price: number | null | undefined,
  region: string,
  companyName: string = 'DoorHan Крым',
  currency: string = 'RUB',
  variantPrices?: Array<{ price: number }>
): {
  title: string;
  description: string;
} {
  // Определяем минимальную цену (учитывая варианты)
  const minPrice = getMinPrice(price, variantPrices);

  // Проверяем кэш
  const cacheKey = getProductMetadataCacheKey({
    productName,
    price: minPrice,
    region,
    companyName,
    currency,
  });

  const cached = productMetadataCache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    return {
      title: cached.title,
      description: cached.description,
    };
  }

  // Генерируем title
  const title = generateProductTitle(productName, region, companyName);

  // Генерируем description в зависимости от наличия цены
  const description =
    minPrice && minPrice > 0
      ? generateProductDescriptionWithPrice(productName, minPrice, region, currency)
      : generateProductDescriptionWithoutPrice(productName, region);

  // Оптимизируем для SEO
  const result = optimizeMetaTags(title, description);

  // Сохраняем в кэш
  productMetadataCache.set(cacheKey, {
    title: result.title,
    description: result.description,
    timestamp: Date.now(),
  });

  return result;
}

/**
 * Генерирует Title для категории по шаблону
 * [Название категории] - купить в [название города в предложном падеже] | [Название компании]
 */
export function generateCategoryTitle(
  categoryName: string,
  region: string,
  companyName: string = 'DoorHan Крым'
): string {
  const cityPrepositional = getCityPrepositional(region);
  const suffix = ` - купить в ${cityPrepositional} | ${companyName}`;
  const suffixLength = suffix.length;
  
  // Максимальная длина для SEO (60 символов)
  const MAX_TITLE_LENGTH = 60;
  
  // Если полный Title помещается, возвращаем как есть
  const fullTitle = `${categoryName}${suffix}`;
  if (fullTitle.length <= MAX_TITLE_LENGTH) {
    return fullTitle;
  }
  
  // Иначе обрезаем только название категории, оставляя суффикс
  const maxCategoryNameLength = MAX_TITLE_LENGTH - suffixLength - 3; // -3 для "..."
  if (maxCategoryNameLength > 0) {
    const truncatedName = categoryName.substring(0, maxCategoryNameLength).trim();
    return `${truncatedName}...${suffix}`;
  }
  
  // Если даже суффикс не помещается (маловероятно), возвращаем как есть
  return fullTitle;
}

/**
 * Генерирует Description для категории с ценой
 */
export function generateCategoryDescriptionWithPrice(
  categoryName: string,
  minPrice: number,
  region: string,
  currency: string = 'RUB'
): string {
  const categoryAccusative = toAccusativeCase(categoryName);
  const cityDative = getCityDative(region);
  const priceFormatted = formatPriceForMeta(minPrice, currency);
  
  return `Закажите ${categoryAccusative} производителя DoorHan. Цена: ${priceFormatted} Доставим по ${cityDative} и Крыму. Установим, настроим!`;
}

/**
 * Генерирует Description для категории без цены
 */
export function generateCategoryDescriptionWithoutPrice(
  categoryName: string,
  region: string
): string {
  const categoryAccusative = toAccusativeCase(categoryName);
  const cityDative = getCityDative(region);
  
  return `Предлагаем заказать ${categoryAccusative} от DoorHan по заводской цене. Доставим по ${cityDative} и Крыму. Установим, настроим!`;
}

/**
 * Определяет минимальную цену среди всех товаров категории
 * Поддерживает как Decimal (Prisma), так и number
 */
export function getMinPriceFromProducts(
  products: Array<{ price: number | null | { toNumber?: () => number } }>
): number | null {
  const prices: number[] = [];

  products.forEach((product) => {
    if (product.price) {
      // Конвертируем Decimal в number, если это объект Decimal
      let priceValue: number;
      if (typeof product.price === 'number') {
        priceValue = product.price;
      } else {
        const decimalPrice = product.price as { toNumber?: () => number };
        priceValue = decimalPrice.toNumber?.() ?? Number(product.price);
      }
      
      if (priceValue && priceValue > 0) {
        prices.push(priceValue);
      }
    }
  });

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

/**
 * Основная функция генерации метатегов для категории
 * Улучшение #5: добавлено кэширование результатов
 */
export function generateCategoryMetadata(
  categoryName: string,
  products: Array<{ price: number | null }>,
  region: string,
  companyName: string = 'DoorHan Крым',
  currency: string = 'RUB'
): {
  title: string;
  description: string;
} {
  // Определяем минимальную цену среди товаров категории
  const minPrice = getMinPriceFromProducts(products);

  // Проверяем кэш
  const cacheKey = getCategoryMetadataCacheKey({
    categoryName,
    minPrice,
    region,
    companyName,
    currency,
  });

  const cached = categoryMetadataCache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    return {
      title: cached.title,
      description: cached.description,
    };
  }

  // Генерируем title
  const title = generateCategoryTitle(categoryName, region, companyName);

  // Генерируем description в зависимости от наличия цены
  const description =
    minPrice && minPrice > 0
      ? generateCategoryDescriptionWithPrice(categoryName, minPrice, region, currency)
      : generateCategoryDescriptionWithoutPrice(categoryName, region);

  // Оптимизируем для SEO
  const result = optimizeMetaTags(title, description);

  // Сохраняем в кэш
  categoryMetadataCache.set(cacheKey, {
    title: result.title,
    description: result.description,
    timestamp: Date.now(),
  });

  return result;
}

