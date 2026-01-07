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
          id: category.id,
          name: category.name,
          description: category.description,
          imageUrl: category.imageUrl,
          iconName: category.iconName,
          color: category.color,
          hoverColor: category.hoverColor,
          slug: category.slug,
          parentId: category.parentId,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
          seoTitle: category.seoTitle,
          seoDescription: category.seoDescription,
          canonicalUrl: category.canonicalUrl,
          h1: category.h1,
          robotsMeta: category.robotsMeta,
          schemaMarkup: category.schemaMarkup,
          contentTop: category.contentTop,
          contentBottom: category.contentBottom,
          productCount,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString(),
          children: category.children?.map(child => ({
            ...child,
            createdAt: child.createdAt.toISOString(),
            updatedAt: 'updatedAt' in child && child.updatedAt ? child.updatedAt.toISOString() : new Date().toISOString(),
          })) || [],
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
