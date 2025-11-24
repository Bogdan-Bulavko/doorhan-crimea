import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unstable_cache } from 'next/cache';

/**
 * Функция для загрузки регионов из БД
 * Вынесена отдельно для кэширования
 */
async function fetchRegionsFromDB() {
  return await db.region.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      code: true,
      name: true,
      phone: true,
      phoneFormatted: true,
      email: true,
      address: true,
      addressDescription: true,
      workingHours: true,
      workingHoursDescription: true,
      mapIframe: true,
      officeName: true,
      isActive: true,
    },
  });
}

/**
 * Кэшированная функция для получения регионов
 * Кэш обновляется каждые 5 минут (300 секунд)
 * Теги для инвалидации кэша при изменении регионов в админке
 */
const getCachedRegions = unstable_cache(
  async () => {
    return await fetchRegionsFromDB();
  },
  ['regions-list'], // Ключ кэша
  {
    revalidate: 300, // 5 минут
    tags: ['regions'], // Теги для инвалидации
  }
);

/**
 * Публичный API endpoint для получения региональных данных
 * Используется фронтендом для получения контактов по региону
 * Теперь с кэшированием для улучшения производительности
 */
export async function GET() {
  try {
    const regions = await getCachedRegions();

    return NextResponse.json({ success: true, data: regions });
  } catch (error) {
    console.error('Get regions error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении регионов',
      },
      { status: 500 }
    );
  }
}

