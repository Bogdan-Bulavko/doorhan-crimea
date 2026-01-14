import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const regionalDataSchema = z.object({
  regionCode: z.string(),
  description: z.string().optional().nullable(),
  h1: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  schemaMarkup: z.string().optional().nullable(),
  contentTop: z.string().optional().nullable(),
  contentBottom: z.string().optional().nullable(),
});

// GET - получить региональные данные для категории
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, message: 'Неверный ID категории' },
        { status: 400 }
      );
    }

    // Проверяем существование категории
    const category = await db.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Категория не найдена' },
        { status: 404 }
      );
    }

    // Получаем все региональные данные для категории
    const regionalData = await db.categoryRegionData.findMany({
      where: { categoryId },
      orderBy: { regionCode: 'asc' },
    });

    return NextResponse.json({ success: true, data: regionalData });
  } catch (error) {
    console.error('Get category regional data error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// POST - создать или обновить региональные данные
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, message: 'Неверный ID категории' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const data = regionalDataSchema.parse(body);

    // Проверяем существование категории
    const category = await db.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Категория не найдена' },
        { status: 404 }
      );
    }

    // Создаем или обновляем региональные данные
    const regionalData = await db.categoryRegionData.upsert({
      where: {
        categoryId_regionCode: {
          categoryId,
          regionCode: data.regionCode,
        },
      },
      create: {
        categoryId,
        regionCode: data.regionCode,
        description: data.description || null,
        h1: data.h1 || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        schemaMarkup: data.schemaMarkup || null,
        contentTop: data.contentTop || null,
        contentBottom: data.contentBottom || null,
      },
      update: {
        description: data.description || null,
        h1: data.h1 || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        schemaMarkup: data.schemaMarkup || null,
        contentTop: data.contentTop || null,
        contentBottom: data.contentBottom || null,
      },
    });

    return NextResponse.json({ success: true, data: regionalData });
  } catch (error) {
    console.error('Create/update category regional data error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// DELETE - удалить региональные данные
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    const { searchParams } = new URL(req.url);
    const regionCode = searchParams.get('regionCode');

    if (isNaN(categoryId) || !regionCode) {
      return NextResponse.json(
        { success: false, message: 'Неверные параметры' },
        { status: 400 }
      );
    }

    await db.categoryRegionData.delete({
      where: {
        categoryId_regionCode: {
          categoryId,
          regionCode,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category regional data error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
