import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeProducts = searchParams.get('includeProducts') === 'true';
    const parentId = searchParams.get('parentId');
    const slug = searchParams.get('slug');

    const whereClause: Record<string, unknown> = { isActive: true };

    // Фильтр по родительской категории
    if (parentId) {
      whereClause.parentId = parseInt(parentId);
    } else if (parentId === 'null') {
      whereClause.parentId = null;
    }

    // Фильтр по slug
    if (slug) {
      whereClause.slug = slug;
    }

    const includeClause: Record<string, unknown> = {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    };

    // Включаем товары если запрошено
    if (includeProducts) {
      includeClause.products = {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 20, // Ограничиваем количество товаров
      };
    }

    const categories = await db.category.findMany({
      where: whereClause,
      orderBy: { sortOrder: 'asc' },
      include: includeClause,
    });

    // Получаем счетчики товаров для каждой категории параллельно
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await db.product.count({
          where: { categoryId: category.id },
        });
        return {
          ...category,
          productCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: categoriesWithCounts,
      count: categoriesWithCounts.length,
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении категорий',
      },
      { status: 500 }
    );
  }
}
