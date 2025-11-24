import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const articleSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  featuredImageUrl: z.string().optional(),
  author: z.string().optional(),
  tags: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  h1: z.string().optional(),
  robotsMeta: z.string().optional(),
  schemaMarkup: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  publishedAt: z.string().optional(),
});

export async function GET() {
  try {
    const articles = await db.article.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении статей',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = articleSchema.parse(body);

    // Проверяем уникальность slug
    const existingArticle = await db.article.findUnique({
      where: { slug: data.slug },
    });

    if (existingArticle) {
      return NextResponse.json(
        {
          success: false,
          message: 'Статья с таким slug уже существует',
        },
        { status: 400 }
      );
    }

    const article = await db.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        featuredImageUrl: data.featuredImageUrl || null,
        author: data.author || null,
        tags: data.tags || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        canonicalUrl: data.canonicalUrl || null,
        h1: data.h1 || null,
        robotsMeta: data.robotsMeta || 'index, follow',
        schemaMarkup: data.schemaMarkup || null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
      },
    });

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create article error:', error);
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

