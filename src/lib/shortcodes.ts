/**
 * Система обработки шорткодов
 * 
 * Поддерживаемые шорткоды:
 * 
 * Региональные:
 * - [city] - название города
 * - [city_prepositional] - город в предложном падеже (в Симферополе)
 * - [phone] - телефон
 * - [phone_formatted] - отформатированный телефон
 * - [email] - email
 * - [address] - адрес
 * - [address_description] - описание адреса
 * - [working_hours] - рабочие часы
 * - [working_hours_description] - описание рабочих часов
 * - [office_name] - название офиса
 * 
 * Товарные (только в контексте товара):
 * - [product_name] - название товара
 * - [product_price] - цена товара
 * - [product_price_from] - цена от (minPrice или price)
 * - [product_category] - категория товара
 * 
 * Категорийные (только в контексте категории):
 * - [category_name] - название категории
 * - [category_description] - описание категории
 * 
 * Общие:
 * - [site_name] - название сайта
 * - [year] - текущий год
 */

import { db } from './db';

export interface ShortcodeContext {
  region?: {
    code: string;
    name: string;
    phone: string;
    phoneFormatted: string;
    email: string;
    address: string;
    addressDescription?: string | null;
    workingHours: string;
    workingHoursDescription?: string | null;
    officeName?: string | null;
  };
  product?: {
    name: string;
    price: number;
    minPrice?: number | null;
    category?: {
      name: string;
    } | null;
  };
  category?: {
    name: string;
    description?: string | null;
  };
}

/**
 * Получает региональные данные для шорткодов
 */
export async function getRegionData(regionCode: string) {
  const region = await db.region.findUnique({
    where: { code: regionCode, isActive: true },
  });

  if (!region) {
    return null;
  }

  return {
    code: region.code,
    name: region.name,
    phone: region.phone,
    phoneFormatted: region.phoneFormatted,
    email: region.email,
    address: region.address,
    addressDescription: region.addressDescription,
    workingHours: region.workingHours,
    workingHoursDescription: region.workingHoursDescription,
    officeName: region.officeName,
  };
}

/**
 * Маппинг городов в предложном падеже
 */
const CITY_PREPOSITIONAL_MAP: Record<string, string> = {
  default: 'Симферополе',
  simferopol: 'Симферополе',
  kerch: 'Керчи',
  evpatoria: 'Евпатории',
  yalta: 'Ялте',
  feodosia: 'Феодосии',
  sevastopol: 'Севастополе',
  alushta: 'Алуште',
  dzhankoy: 'Джанкое',
  bakhchisaray: 'Бахчисарае',
  krasnoperekopsk: 'Красноперекопске',
  saki: 'Саках',
  armyansk: 'Армянске',
  sudak: 'Судаке',
  belogorsk: 'Белогорске',
  inkerman: 'Инкермане',
  balaklava: 'Балаклаве',
  shchelkino: 'Щелкино',
  'stary-krym': 'Старом Крыму',
  alupka: 'Алупке',
  gurzuf: 'Гурзуфе',
  simeiz: 'Симеизе',
  foros: 'Форосе',
  koktebel: 'Коктебеле',
  livadia: 'Ливадии',
  massandra: 'Массандре',
  nikita: 'Никите',
  gaspra: 'Гаспре',
  miskhor: 'Мисхоре',
  partenit: 'Партените',
  kacha: 'Каче',
};

/**
 * Обрабатывает один шорткод
 */
function processShortcode(
  shortcode: string,
  context: ShortcodeContext
): string {
  const cleanShortcode = shortcode.replace(/[\[\]]/g, '').toLowerCase().trim();

  // Региональные шорткоды
  if (context.region) {
    switch (cleanShortcode) {
      case 'city':
        return context.region.name;
      case 'city_prepositional':
        return CITY_PREPOSITIONAL_MAP[context.region.code] || context.region.name;
      case 'phone':
        return context.region.phone;
      case 'phone_formatted':
        return context.region.phoneFormatted;
      case 'email':
        return context.region.email;
      case 'address':
        return context.region.address;
      case 'address_description':
        return context.region.addressDescription || '';
      case 'working_hours':
        return context.region.workingHours;
      case 'working_hours_description':
        return context.region.workingHoursDescription || '';
      case 'office_name':
        return context.region.officeName || '';
    }
  }

  // Товарные шорткоды
  if (context.product) {
    switch (cleanShortcode) {
      case 'product_name':
        return context.product.name;
      case 'product_price':
        return formatPrice(context.product.price);
      case 'product_price_from':
        const price = context.product.minPrice || context.product.price;
        return `от ${formatPrice(price)}`;
      case 'product_category':
        return context.product.category?.name || '';
    }
  }

  // Категорийные шорткоды
  if (context.category) {
    switch (cleanShortcode) {
      case 'category_name':
        return context.category.name;
      case 'category_description':
        return context.category.description || '';
    }
  }

  // Общие шорткоды
  switch (cleanShortcode) {
    case 'site_name':
      return 'DoorHan Крым';
    case 'year':
      return new Date().getFullYear().toString();
  }

  // Если шорткод не найден, возвращаем его как есть
  return `[${cleanShortcode}]`;
}

/**
 * Форматирует цену
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Обрабатывает все шорткоды в тексте
 */
export function processShortcodes(
  content: string | null | undefined,
  context: ShortcodeContext
): string {
  if (!content) {
    return '';
  }

  // Регулярное выражение для поиска шорткодов [shortcode]
  const shortcodeRegex = /\[([^\]]+)\]/g;

  return content.replace(shortcodeRegex, (match, shortcode) => {
    return processShortcode(shortcode, context);
  });
}

/**
 * Получает список всех доступных шорткодов
 */
export function getAvailableShortcodes(context: ShortcodeContext): string[] {
  const shortcodes: string[] = [];

  // Общие шорткоды
  shortcodes.push('[site_name]', '[year]');

  // Региональные шорткоды
  if (context.region) {
    shortcodes.push(
      '[city]',
      '[city_prepositional]',
      '[phone]',
      '[phone_formatted]',
      '[email]',
      '[address]',
      '[address_description]',
      '[working_hours]',
      '[working_hours_description]',
      '[office_name]'
    );
  }

  // Товарные шорткоды
  if (context.product) {
    shortcodes.push(
      '[product_name]',
      '[product_price]',
      '[product_price_from]',
      '[product_category]'
    );
  }

  // Категорийные шорткоды
  if (context.category) {
    shortcodes.push('[category_name]', '[category_description]');
  }

  return shortcodes;
}

