import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function GET() {
  try {
    const pages = await db.page.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error('Get pages error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении страниц',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = pageSchema.parse(body);

    // Проверяем уникальность slug
    const existingPage = await db.page.findUnique({
      where: { slug: data.slug },
    });

    if (existingPage) {
      return NextResponse.json(
        {
          success: false,
          message: 'Страница с таким slug уже существует',
        },
        { status: 400 }
      );
    }

    const page = await db.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create page error:', error);
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

