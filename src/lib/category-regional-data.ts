/**
 * Утилиты для работы с региональными данными категорий
 */

import { db } from './db';

export interface CategoryRegionalData {
  id: number;
  categoryId: number;
  regionCode: string;
  description: string | null;
  h1: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  schemaMarkup: string | null;
  contentTop: string | null;
  contentBottom: string | null;
}

/**
 * Получает региональные данные для категории
 * @param categoryId - ID категории
 * @param regionCode - код региона ('default', 'simferopol', и т.д.)
 * @returns региональные данные или null если не найдены
 */
export async function getCategoryRegionalData(
  categoryId: number,
  regionCode: string
): Promise<CategoryRegionalData | null> {
  const regionalData = await db.categoryRegionData.findUnique({
    where: {
      categoryId_regionCode: {
        categoryId,
        regionCode,
      },
    },
  });

  return regionalData;
}

/**
 * Получает региональные данные для категории с fallback на default
 * @param categoryId - ID категории
 * @param regionCode - код региона
 * @returns региональные данные (сначала для региона, если нет - для default)
 */
export async function getCategoryRegionalDataWithFallback(
  categoryId: number,
  regionCode: string
): Promise<CategoryRegionalData | null> {
  // Сначала пытаемся получить данные для конкретного региона
  let regionalData = await getCategoryRegionalData(categoryId, regionCode);
  
  // Если не найдено и регион не default, пытаемся получить для default
  if (!regionalData && regionCode !== 'default') {
    regionalData = await getCategoryRegionalData(categoryId, 'default');
  }
  
  return regionalData;
}
