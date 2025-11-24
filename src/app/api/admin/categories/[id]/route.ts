import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID категории',
        },
        { status: 400 }
      );
    }

    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: {
        parent: true,
        children: true,
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            oldPrice: true,
            currency: true,
            inStock: true,
            createdAt: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Категория не найдена',
        },
        { status: 404 }
      );
    }

    // Сериализуем данные
    const serializedCategory = {
      ...category,
      products: category.products.map((product) => ({
        ...product,
        price: product.price.toString(),
        oldPrice: product.oldPrice?.toString() || null,
      })),
    };

    return NextResponse.json({
      success: true,
      data: serializedCategory,
    });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении категории',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID категории',
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, slug, description, seoTitle, seoDescription, canonicalUrl, h1, robotsMeta, schemaMarkup, isActive } =
      body;

    // Проверяем, существует ли категория
    const existingCategory = await db.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: 'Категория не найдена',
        },
        { status: 404 }
      );
    }

    // Проверяем уникальность slug (если изменился)
    if (slug !== existingCategory.slug) {
      const slugExists = await db.category.findFirst({
        where: { slug, id: { not: categoryId } },
      });

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            message: 'Slug уже используется другой категорией',
          },
          { status: 400 }
        );
      }
    }

    // Обновляем категорию
    const updatedCategory = await db.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
        description: description || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        canonicalUrl: canonicalUrl || null,
        h1: h1 || null,
        robotsMeta: robotsMeta || null,
        schemaMarkup: schemaMarkup || null,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Категория успешно обновлена',
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при обновлении категории',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const categoryId = parseInt(resolvedParams.id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID категории',
        },
        { status: 400 }
      );
    }

    // Проверяем, существует ли категория
    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: {
        children: true,
        products: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Категория не найдена',
        },
        { status: 404 }
      );
    }

    // Проверяем, есть ли дочерние категории
    if (category.children.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Нельзя удалить категорию с дочерними категориями. Сначала удалите или переместите дочерние категории.',
        },
        { status: 400 }
      );
    }

    // Проверяем, есть ли товары в категории
    if (category.products.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Нельзя удалить категорию с товарами. Сначала переместите или удалите товары из этой категории.',
        },
        { status: 400 }
      );
    }

    // Удаляем категорию
    await db.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      success: true,
      message: 'Категория успешно удалена',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при удалении категории',
      },
      { status: 500 }
    );
  }
}
