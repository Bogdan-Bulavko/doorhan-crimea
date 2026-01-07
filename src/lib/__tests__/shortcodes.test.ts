/**
 * Тесты для системы шорткодов
 */

import { processShortcodes, getAvailableShortcodes, type ShortcodeContext } from '../shortcodes';

describe('Shortcodes', () => {
  const mockRegion = {
    code: 'simferopol',
    name: 'Симферополь',
    phone: '+79781234567',
    phoneFormatted: '+7 (978) 123-45-67',
    email: 'info@doorhan-crimea.ru',
    address: 'ул. Ленина, 1',
    addressDescription: 'Центральный офис',
    workingHours: 'Пн-Пт: 9:00-18:00',
    workingHoursDescription: 'Выходные: Сб, Вс',
    officeName: 'Офис DoorHan Симферополь',
  };

  const mockProduct = {
    name: 'Автоматика для ворот',
    price: 50000,
    minPrice: 45000,
    category: {
      name: 'Автоматика',
    },
  };

  const mockCategory = {
    name: 'Автоматика для ворот',
    description: 'Современные системы автоматизации',
  };

  describe('Региональные шорткоды', () => {
    const context: ShortcodeContext = {
      region: mockRegion,
    };

    test('заменяет [city] на название города', () => {
      const result = processShortcodes('Мы находимся в [city]', context);
      expect(result).toBe('Мы находимся в Симферополь');
    });

    test('заменяет [city_prepositional] на город в предложном падеже', () => {
      const result = processShortcodes('В [city_prepositional] работает наш офис', context);
      expect(result).toBe('В Симферополе работает наш офис');
    });

    test('заменяет [phone] на телефон', () => {
      const result = processShortcodes('Звоните: [phone]', context);
      expect(result).toBe('Звоните: +79781234567');
    });

    test('заменяет [phone_formatted] на отформатированный телефон', () => {
      const result = processShortcodes('Телефон: [phone_formatted]', context);
      expect(result).toBe('Телефон: +7 (978) 123-45-67');
    });

    test('заменяет [email] на email', () => {
      const result = processShortcodes('Email: [email]', context);
      expect(result).toBe('Email: info@doorhan-crimea.ru');
    });

    test('заменяет [address] на адрес', () => {
      const result = processShortcodes('Адрес: [address]', context);
      expect(result).toBe('Адрес: ул. Ленина, 1');
    });

    test('заменяет [address_description] на описание адреса', () => {
      const result = processShortcodes('[address_description]', context);
      expect(result).toBe('Центральный офис');
    });

    test('заменяет [working_hours] на рабочие часы', () => {
      const result = processShortcodes('Режим работы: [working_hours]', context);
      expect(result).toBe('Режим работы: Пн-Пт: 9:00-18:00');
    });

    test('заменяет [working_hours_description] на описание рабочих часов', () => {
      const result = processShortcodes('[working_hours_description]', context);
      expect(result).toBe('Выходные: Сб, Вс');
    });

    test('заменяет [office_name] на название офиса', () => {
      const result = processShortcodes('[office_name]', context);
      expect(result).toBe('Офис DoorHan Симферополь');
    });
  });

  describe('Товарные шорткоды', () => {
    const context: ShortcodeContext = {
      product: mockProduct,
    };

    test('заменяет [product_name] на название товара', () => {
      const result = processShortcodes('Товар: [product_name]', context);
      expect(result).toBe('Товар: Автоматика для ворот');
    });

    test('заменяет [product_price] на цену товара', () => {
      const result = processShortcodes('Цена: [product_price]', context);
      expect(result).toContain('50');
    });

    test('заменяет [product_price_from] на цену от', () => {
      const result = processShortcodes('[product_price_from]', context);
      expect(result).toContain('от');
      expect(result).toContain('45');
    });

    test('заменяет [product_category] на категорию товара', () => {
      const result = processShortcodes('Категория: [product_category]', context);
      expect(result).toBe('Категория: Автоматика');
    });
  });

  describe('Категорийные шорткоды', () => {
    const context: ShortcodeContext = {
      category: mockCategory,
    };

    test('заменяет [category_name] на название категории', () => {
      const result = processShortcodes('Категория: [category_name]', context);
      expect(result).toBe('Категория: Автоматика для ворот');
    });

    test('заменяет [category_description] на описание категории', () => {
      const result = processShortcodes('[category_description]', context);
      expect(result).toBe('Современные системы автоматизации');
    });
  });

  describe('Общие шорткоды', () => {
    const context: ShortcodeContext = {};

    test('заменяет [site_name] на название сайта', () => {
      const result = processShortcodes('[site_name]', context);
      expect(result).toBe('DoorHan Крым');
    });

    test('заменяет [year] на текущий год', () => {
      const result = processShortcodes('© [year]', context);
      expect(result).toBe(`© ${new Date().getFullYear()}`);
    });
  });

  describe('Комбинированные шорткоды', () => {
    const context: ShortcodeContext = {
      region: mockRegion,
      product: mockProduct,
      category: mockCategory,
    };

    test('обрабатывает несколько шорткодов в одном тексте', () => {
      const text = 'В [city] можно купить [product_name] категории [category_name] по цене [product_price_from]. Звоните: [phone_formatted]';
      const result = processShortcodes(text, context);
      expect(result).toContain('Симферополь');
      expect(result).toContain('Автоматика для ворот');
      expect(result).toContain('от');
      expect(result).toContain('+7 (978) 123-45-67');
    });
  });

  describe('Неизвестные шорткоды', () => {
    const context: ShortcodeContext = {};

    test('оставляет неизвестные шорткоды как есть', () => {
      const result = processShortcodes('[unknown_shortcode]', context);
      expect(result).toBe('[unknown_shortcode]');
    });
  });

  describe('getAvailableShortcodes', () => {
    test('возвращает общие шорткоды', () => {
      const context: ShortcodeContext = {};
      const shortcodes = getAvailableShortcodes(context);
      expect(shortcodes).toContain('[site_name]');
      expect(shortcodes).toContain('[year]');
    });

    test('возвращает региональные шорткоды при наличии региона', () => {
      const context: ShortcodeContext = {
        region: mockRegion,
      };
      const shortcodes = getAvailableShortcodes(context);
      expect(shortcodes).toContain('[city]');
      expect(shortcodes).toContain('[phone]');
      expect(shortcodes).toContain('[email]');
    });

    test('возвращает товарные шорткоды при наличии товара', () => {
      const context: ShortcodeContext = {
        product: mockProduct,
      };
      const shortcodes = getAvailableShortcodes(context);
      expect(shortcodes).toContain('[product_name]');
      expect(shortcodes).toContain('[product_price]');
    });

    test('возвращает категорийные шорткоды при наличии категории', () => {
      const context: ShortcodeContext = {
        category: mockCategory,
      };
      const shortcodes = getAvailableShortcodes(context);
      expect(shortcodes).toContain('[category_name]');
      expect(shortcodes).toContain('[category_description]');
    });
  });

  describe('Обработка пустых значений', () => {
    test('возвращает пустую строку для null', () => {
      const result = processShortcodes(null, {});
      expect(result).toBe('');
    });

    test('возвращает пустую строку для undefined', () => {
      const result = processShortcodes(undefined, {});
      expect(result).toBe('');
    });

    test('возвращает пустую строку для пустой строки', () => {
      const result = processShortcodes('', {});
      expect(result).toBe('');
    });
  });
});

