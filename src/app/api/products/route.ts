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


    const whereClause: Record<string, unknown> = {};

    // Фильтр по категории
    if (categoryId) {
      whereClause.categoryId = parseInt(categoryId);
    } else if (categorySlug) {
      const category = await db.category.findFirst({
        where: { slug: categorySlug, isActive: true },
      });
      if (category) {
        whereClause.categoryId = category.id;
      } else {
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
      // Сначала найдем категории, которые содержат поисковый запрос
      const matchingCategories = await db.category.findMany({
        where: {
          name: { contains: search },
          isActive: true,
        },
        select: { id: true, name: true },
      });

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
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        include: {
          category: true,
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


    // Convert Decimal to numbers for client components
    const serializedProducts = products.map(product => ({
      ...product,
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : undefined,
      rating: Number(product.rating),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      // Convert null to undefined for interface compatibility
      title: product.title || undefined,
      description: product.description || undefined,
      shortDescription: product.shortDescription || undefined,
      mainImageUrl: product.mainImageUrl || undefined,
      sku: product.sku || undefined,
      seoTitle: product.seoTitle || undefined,
      seoDescription: product.seoDescription || undefined,
    }));

    return NextResponse.json({
      success: true,
      data: serializedProducts,
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