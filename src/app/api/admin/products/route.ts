import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const productCreateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  title: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  categoryId: z.number().int().positive('Выберите категорию'),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
  oldPrice: z.number().optional(),
  currency: z.string().default('RUB'),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(0),
  isNew: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  rating: z.number().min(0).max(5).default(0),
  reviewsCount: z.number().int().min(0).default(0),
  sku: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  specifications: z.array(z.object({
    name: z.string().min(1, 'Название характеристики обязательно'),
    value: z.string().min(1, 'Значение характеристики обязательно'),
    unit: z.string().optional(),
  })).optional().default([]),
  colors: z.array(z.object({
    name: z.string().min(1, 'Название цвета обязательно'),
    value: z.string().min(1, 'Значение цвета обязательно'),
    hexColor: z.string().min(1, 'HEX цвет обязателен'),
    imageUrl: z.string().optional(),
  })).optional().default([]),
  images: z.array(z.object({
    url: z.string().min(1, 'URL изображения обязателен'),
    altText: z.string().optional(),
    isMain: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
  })).optional().default([]),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const whereClause: Record<string, unknown> = {};

    // Фильтр по категории
    if (categoryId && categoryId !== 'all') {
      whereClause.categoryId = parseInt(categoryId);
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
        { shortDescription: { contains: search } },
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

    // Convert Decimal to string for client components
    const serializedProducts = products.map(product => ({
      ...product,
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
      rating: Number(product.rating),
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
    console.error('Admin Products API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении товаров',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = productCreateSchema.parse(body);
    
    // Извлекаем характеристики, цвета и изображения из данных
    const { specifications, colors, images, ...productData } = data;
    
    // Создаем товар
    const product = await db.product.create({
      data: {
        ...productData,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        specifications: {
          create: specifications.map(spec => ({
            name: spec.name,
            value: spec.value,
            unit: spec.unit || null,
            sortOrder: 0,
          })),
        },
        colors: {
          create: colors.map(color => ({
            name: color.name,
            value: color.value,
            hexColor: color.hexColor,
            imageUrl: color.imageUrl || null,
            sortOrder: 0,
          })),
        },
        images: {
          create: images.map(img => ({
            imageUrl: img.url,
            altText: img.altText || null,
            isMain: img.isMain,
            sortOrder: img.sortOrder,
          })),
        },
      },
      include: {
        category: true,
        images: true,
        specifications: true,
        colors: true,
      },
    });

    // Сериализуем данные для клиента
    const serializedProduct = {
      ...product,
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
      rating: Number(product.rating),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: serializedProduct,
      message: 'Товар успешно создан',
    });
  } catch (error) {
    console.error('Admin Products POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ошибка валидации данных',
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при создании товара',
      },
      { status: 500 }
    );
  }
}