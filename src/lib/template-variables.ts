/**
 * Утилита для замены переменных города в шаблонах текста
 */

import { getCityDative, getCityPrepositional } from './metadata-generator';

/**
 * Заменяет переменные города в тексте шаблона
 * 
 * Поддерживаемые переменные:
 * - [город] - название города в именительном падеже
 * - [город_в_предложном] - название города в предложном падеже
 * - [город_в_дательном] - название города в дательном падеже
 * 
 * @param template - Текст шаблона с переменными
 * @param region - Код региона (default, simferopol, yalta, etc.)
 * @returns Текст с замененными переменными
 */
export function replaceCityVariables(template: string, region: string): string {
  if (!template) return template;

  // Словарь городов в именительном падеже
  const cityNominative: Record<string, string> = {
    default: 'Крым',
    simferopol: 'Симферополь',
    yalta: 'Ялта',
    alushta: 'Алушта',
    sevastopol: 'Севастополь',
  };

  const cityName = cityNominative[region] || cityNominative.default;
  const cityPrepositional = getCityPrepositional(region);
  const cityDative = getCityDative(region);

  let result = template;

  // Заменяем переменные
  result = result.replace(/\[город\]/g, cityName);
  result = result.replace(/\[город_в_предложном\]/g, cityPrepositional);
  result = result.replace(/\[город_в_дательном\]/g, cityDative);

  return result;
}

/**
 * Получает список доступных переменных для подсказки
 */
export function getAvailableVariables(): Array<{ variable: string; description: string }> {
  return [
    {
      variable: '[город]',
      description: 'Название города в именительном падеже (Симферополь, Ялта, Крым)',
    },
    {
      variable: '[город_в_предложном]',
      description: 'Название города в предложном падеже (в Симферополе, в Ялте, в Крыму)',
    },
    {
      variable: '[город_в_дательном]',
      description: 'Название города в дательном падеже (Симферополю, Ялте, Крыму)',
    },
  ];
}

