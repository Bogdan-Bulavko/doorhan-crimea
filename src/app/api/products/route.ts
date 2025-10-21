import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const categorySlug = searchParams.get('categorySlug');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    console.log('🔍 API products запрос:', {
      categoryId,
      categorySlug,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });

    const whereClause: Record<string, unknown> = {};

    // Фильтр по категории
    if (categoryId) {
      console.log('🔍 Фильтр по categoryId:', categoryId);
      whereClause.categoryId = parseInt(categoryId);
    } else if (categorySlug) {
      console.log('🔍 Фильтр по categorySlug:', categorySlug);
      const category = await db.category.findFirst({
        where: { slug: categorySlug, isActive: true },
      });
      console.log('🔍 Найденная категория:', category);
      if (category) {
        whereClause.categoryId = category.id;
        console.log('🔍 Установлен categoryId в whereClause:', category.id);
      } else {
        console.log('🔍 Категория не найдена для slug:', categorySlug);
        return NextResponse.json(
          {
            success: false,
            message: 'Категория не найдена',
          },
          { status: 404 }
        );
      }
    }

    // Поиск по названию, описанию и категории
    if (search) {
      console.log('🔍 Поиск по запросу:', search);

      // Сначала найдем категории, которые содержат поисковый запрос
      const matchingCategories = await db.category.findMany({
        where: {
          name: { contains: search },
          isActive: true,
        },
        select: { id: true, name: true },
      });

      console.log('🔍 Найденные категории:', matchingCategories);

      // Создаем условия поиска
      const searchConditions: Record<string, unknown>[] = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];

      // Если найдены подходящие категории, добавляем их в условия
      if (matchingCategories.length > 0) {
        searchConditions.push({
          categoryId: { in: matchingCategories.map((c) => c.id) },
        });
      }

      whereClause.OR = searchConditions;
      console.log('🔍 Условие поиска:', JSON.stringify(whereClause, null, 2));

      // Дополнительная отладка - проверим каждое условие отдельно
      console.log('🔍 Тестируем каждое условие:');

      // Тест 1: Поиск по названию
      const testByName = await db.product.findMany({
        where: { name: { contains: search } },
        include: { category: { select: { name: true } } },
      });
      console.log(
        '🔍 По названию:',
        testByName.map((p) => ({ name: p.name, category: p.category.name }))
      );

      // Тест 2: Поиск по описанию
      const testByDescription = await db.product.findMany({
        where: { description: { contains: search } },
        include: { category: { select: { name: true } } },
      });
      console.log(
        '🔍 По описанию:',
        testByDescription.map((p) => ({
          name: p.name,
          category: p.category.name,
        }))
      );

      // Тест 3: Поиск по категории
      if (matchingCategories.length > 0) {
        const testByCategory = await db.product.findMany({
          where: { categoryId: { in: matchingCategories.map((c) => c.id) } },
          include: { category: { select: { name: true } } },
        });
        console.log(
          '🔍 По категории:',
          testByCategory.map((p) => ({
            name: p.name,
            category: p.category.name,
          }))
        );
      }
    }

    console.log(
      '🔍 Финальный whereClause:',
      JSON.stringify(whereClause, null, 2)
    );

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          specifications: true,
          colors: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.product.count({ where: whereClause }),
    ]);

    if (search) {
      console.log('🔍 Найдено товаров:', products.length);
      console.log(
        '🔍 Результаты:',
        products.map((p) => ({
          name: p.name,
          category: p.category.name,
          categoryId: p.categoryId,
        }))
      );

      // Дополнительная отладка - покажем все товары в базе
      const allProducts = await db.product.findMany({
        include: { category: { select: { name: true } } },
      });
      console.log(
        '🔍 Все товары в базе:',
        allProducts.map((p) => ({
          name: p.name,
          category: p.category.name,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении товаров',
      },
      { status: 500 }
    );
  }
}
