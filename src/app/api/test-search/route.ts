import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || 'авто';

    console.log('🧪 Тестируем поиск для:', search);

    // 1. Проверим все категории
    const allCategories = await db.category.findMany({
      select: { id: true, name: true, slug: true },
    });
    console.log('📂 Все категории:', allCategories);

    // 2. Проверим все товары
    const allProducts = await db.product.findMany({
      include: { category: { select: { name: true, slug: true } } },
    });
    console.log(
      '📦 Все товары:',
      allProducts.map((p) => ({
        name: p.name,
        category: p.category.name,
        categorySlug: p.category.slug,
      }))
    );

    // 3. Поиск категорий по тексту
    const matchingCategories = await db.category.findMany({
      where: {
        name: { contains: search },
        isActive: true,
      },
      select: { id: true, name: true, slug: true },
    });
    console.log(`🔍 Категории содержащие "${search}":`, matchingCategories);

    // 4. Поиск товаров по названию
    const productsByName = await db.product.findMany({
      where: { name: { contains: search } },
      include: { category: { select: { name: true } } },
    });
    console.log(
      `📦 Товары по названию "${search}":`,
      productsByName.map((p) => ({
        name: p.name,
        category: p.category.name,
      }))
    );

    // 5. Поиск товаров по описанию
    const productsByDescription = await db.product.findMany({
      where: { description: { contains: search } },
      include: { category: { select: { name: true } } },
    });
    console.log(
      `📦 Товары по описанию "${search}":`,
      productsByDescription.map((p) => ({
        name: p.name,
        category: p.category.name,
      }))
    );

    // 6. Поиск товаров в найденных категориях
    let productsByCategory: Array<{
      id: number;
      name: string;
      category: { name: string };
    }> = [];
    if (matchingCategories.length > 0) {
      productsByCategory = await db.product.findMany({
        where: { categoryId: { in: matchingCategories.map((c) => c.id) } },
        include: { category: { select: { name: true } } },
      });
    }
    console.log(
      `📦 Товары в найденных категориях:`,
      productsByCategory.map((p) => ({
        name: p.name,
        category: p.category.name,
      }))
    );

    // 7. Комбинированный поиск (как в основном API)
    const searchConditions: Array<{
      name?: { contains: string };
      description?: { contains: string };
      categoryId?: { in: number[] };
    }> = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];

    if (matchingCategories.length > 0) {
      searchConditions.push({
        categoryId: { in: matchingCategories.map((c) => c.id) },
      });
    }

    const combinedResults = await db.product.findMany({
      where: { OR: searchConditions },
      include: { category: { select: { name: true } } },
    });
    console.log(
      `📦 Комбинированные результаты:`,
      combinedResults.map((p) => ({
        name: p.name,
        category: p.category.name,
      }))
    );

    return NextResponse.json({
      success: true,
      search,
      allCategories,
      allProducts: allProducts.map((p) => ({
        name: p.name,
        category: p.category.name,
        categorySlug: p.category.slug,
      })),
      matchingCategories,
      productsByName: productsByName.map((p) => ({
        name: p.name,
        category: p.category.name,
      })),
      productsByDescription: productsByDescription.map((p) => ({
        name: p.name,
        category: p.category.name,
      })),
      productsByCategory: productsByCategory.map((p) => ({
        name: p.name,
        category: p.category.name,
      })),
      combinedResults: combinedResults.map((p) => ({
        name: p.name,
        category: p.category.name,
      })),
    });
  } catch (error) {
    console.error('Test search error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
