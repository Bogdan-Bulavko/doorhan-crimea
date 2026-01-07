'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface ShortcodesInfoProps {
  context?: 'page' | 'category' | 'product' | 'article';
}

export default function ShortcodesInfo({ context = 'page' }: ShortcodesInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getAvailableShortcodes = () => {
    const allShortcodes = {
      regional: [
        { code: '[city]', desc: 'Название города' },
        { code: '[city_prepositional]', desc: 'Город в предложном падеже (в Симферополе)' },
        { code: '[phone]', desc: 'Телефон' },
        { code: '[phone_formatted]', desc: 'Отформатированный телефон (+7 (978) 123-45-67)' },
        { code: '[email]', desc: 'Email адрес' },
        { code: '[address]', desc: 'Адрес офиса' },
        { code: '[address_description]', desc: 'Описание адреса' },
        { code: '[working_hours]', desc: 'Рабочие часы' },
        { code: '[working_hours_description]', desc: 'Описание рабочих часов' },
        { code: '[office_name]', desc: 'Название офиса' },
      ],
      product: [
        { code: '[product_name]', desc: 'Название товара' },
        { code: '[product_price]', desc: 'Цена товара (форматированная)' },
        { code: '[product_price_from]', desc: 'Цена от (использует minPrice если указан)' },
        { code: '[product_category]', desc: 'Категория товара' },
      ],
      category: [
        { code: '[category_name]', desc: 'Название категории' },
        { code: '[category_description]', desc: 'Описание категории' },
      ],
      general: [
        { code: '[site_name]', desc: 'Название сайта (DoorHan Крым)' },
        { code: '[year]', desc: 'Текущий год' },
      ],
    };

    const available: typeof allShortcodes = {
      regional: allShortcodes.regional,
      product: context === 'product' ? allShortcodes.product : [],
      category: context === 'category' ? allShortcodes.category : [],
      general: allShortcodes.general,
    };

    return available;
  };

  const shortcodes = getAvailableShortcodes();
  const hasProductShortcodes = shortcodes.product.length > 0;
  const hasCategoryShortcodes = shortcodes.category.length > 0;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">
            Информация о шорткодах
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-blue-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-blue-600" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4 text-sm">
          <p className="text-gray-700 mb-4">
            Шорткоды автоматически заменяются на актуальные данные при отображении страницы.
            Используйте их в SEO полях, заголовках и контенте.
          </p>

          <div>
            <h4 className="font-semibold text-blue-900 mb-2">🌍 Региональные шорткоды (доступны везде):</h4>
            <div className="bg-white rounded-lg p-3 space-y-1">
              {shortcodes.regional.map((sc) => (
                <div key={sc.code} className="flex items-start gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-blue-700 flex-shrink-0">
                    {sc.code}
                  </code>
                  <span className="text-gray-600 text-xs">{sc.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {hasCategoryShortcodes && (
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">📁 Категорийные шорткоды:</h4>
              <div className="bg-white rounded-lg p-3 space-y-1">
                {shortcodes.category.map((sc) => (
                  <div key={sc.code} className="flex items-start gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-blue-700 flex-shrink-0">
                      {sc.code}
                    </code>
                    <span className="text-gray-600 text-xs">{sc.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasProductShortcodes && (
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">🛍️ Товарные шорткоды:</h4>
              <div className="bg-white rounded-lg p-3 space-y-1">
                {shortcodes.product.map((sc) => (
                  <div key={sc.code} className="flex items-start gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-blue-700 flex-shrink-0">
                      {sc.code}
                    </code>
                    <span className="text-gray-600 text-xs">{sc.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-blue-900 mb-2">🌐 Общие шорткоды (доступны везде):</h4>
            <div className="bg-white rounded-lg p-3 space-y-1">
              {shortcodes.general.map((sc) => (
                <div key={sc.code} className="flex items-start gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-blue-700 flex-shrink-0">
                    {sc.code}
                  </code>
                  <span className="text-gray-600 text-xs">{sc.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800 font-semibold mb-1">💡 Примеры использования:</p>
            <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
              <li>SEO Title: <code className="bg-yellow-100 px-1 rounded">[city] | [site_name]</code></li>
              <li>SEO Description: <code className="bg-yellow-100 px-1 rounded">Звоните: [phone_formatted]</code></li>
              <li>H1: <code className="bg-yellow-100 px-1 rounded">Услуги в [city_prepositional]</code></li>
              <li>Контент: <code className="bg-yellow-100 px-1 rounded">Адрес: [address], тел. [phone_formatted]</code></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

