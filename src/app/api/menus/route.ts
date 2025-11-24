import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { unstable_cache } from 'next/cache';

/**
 * Функция для загрузки меню из БД
 */
async function fetchMenusFromDB() {
  return await db.menu.findMany({
    where: {
      items: {
        some: {
          isActive: true,
        },
      },
    },
    include: {
      items: {
        where: {
          isActive: true,
          parentId: null, // Только корневые элементы
        },
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Кэшированная функция для получения меню
 * Кэш обновляется каждые 5 минут (300 секунд)
 */
const getCachedMenus = unstable_cache(
  async () => {
    return await fetchMenusFromDB();
  },
  ['menus-list'], // Ключ кэша
  {
    revalidate: 300, // 5 минут
    tags: ['menus'], // Теги для инвалидации
  }
);

/**
 * Публичный API endpoint для получения меню
 * Используется фронтендом для отображения меню в Header и Footer
 */
export async function GET() {
  try {
    const menus = await getCachedMenus();

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error('Get menus error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении меню',
      },
      { status: 500 }
    );
  }
}

