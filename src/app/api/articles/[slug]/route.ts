import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const article = await db.article.findFirst({
      where: {
        slug,
        isActive: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          message: 'Статья не найдена',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error('Get public article error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении статьи',
      },
      { status: 500 }
    );
  }
}

