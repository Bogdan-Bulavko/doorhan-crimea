import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const articleId = parseInt(resolvedParams.id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID статьи',
        },
        { status: 400 }
      );
    }

    const article = await db.article.findUnique({
      where: { id: articleId },
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

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Get article error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении статьи',
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
    const articleId = parseInt(resolvedParams.id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID статьи',
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImageUrl,
      author,
      tags,
      seoTitle,
      seoDescription,
      canonicalUrl,
      h1,
      robotsMeta,
      schemaMarkup,
      isActive,
      sortOrder,
      publishedAt,
    } = body;

    // Проверяем, существует ли статья
    const existingArticle = await db.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      return NextResponse.json(
        {
          success: false,
          message: 'Статья не найдена',
        },
        { status: 404 }
      );
    }

    // Проверяем уникальность slug (если изменился)
    if (slug !== existingArticle.slug) {
      const slugExists = await db.article.findFirst({
        where: { slug, id: { not: articleId } },
      });

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            message: 'Slug уже используется другой статьей',
          },
          { status: 400 }
        );
      }
    }

    // Обновляем статью
    const updatedArticle = await db.article.update({
      where: { id: articleId },
      data: {
        title,
        slug,
        content: content || null,
        excerpt: excerpt || null,
        featuredImageUrl: featuredImageUrl || null,
        author: author || null,
        tags: tags || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        canonicalUrl: canonicalUrl || null,
        h1: h1 || null,
        robotsMeta: robotsMeta || 'index, follow',
        schemaMarkup: schemaMarkup || null,
        isActive: Boolean(isActive),
        sortOrder: sortOrder ?? 0,
        publishedAt: publishedAt ? new Date(publishedAt) : existingArticle.publishedAt || new Date(),
      },
    });

    // Инвалидируем кэш для страницы статьи
    const { revalidatePath } = await import('next/cache');
    revalidatePath(`/articles/${slug}`, 'page');
    // Если slug изменился, инвалидируем и старый путь
    if (slug !== existingArticle.slug) {
      revalidatePath(`/articles/${existingArticle.slug}`, 'page');
    }
    // Инвалидируем список статей
    revalidatePath('/articles', 'page');

    return NextResponse.json({
      success: true,
      message: 'Статья успешно обновлена',
      data: updatedArticle,
    });
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при обновлении статьи',
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
    const articleId = parseInt(resolvedParams.id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID статьи',
        },
        { status: 400 }
      );
    }

    // Проверяем, существует ли статья
    const article = await db.article.findUnique({
      where: { id: articleId },
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

    // Удаляем статью
    await db.article.delete({
      where: { id: articleId },
    });

    // Инвалидируем кэш
    const { revalidatePath } = await import('next/cache');
    revalidatePath(`/articles/${article.slug}`, 'page');
    revalidatePath('/articles', 'page');

    return NextResponse.json({
      success: true,
      message: 'Статья успешно удалена',
    });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при удалении статьи',
      },
      { status: 500 }
    );
  }
}

