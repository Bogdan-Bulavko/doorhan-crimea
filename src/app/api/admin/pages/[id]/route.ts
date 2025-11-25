import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const pageId = parseInt(resolvedParams.id);

    if (isNaN(pageId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID страницы',
        },
        { status: 400 }
      );
    }

    const page = await db.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          message: 'Страница не найдена',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error('Get page error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении страницы',
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
    const pageId = parseInt(resolvedParams.id);

    if (isNaN(pageId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID страницы',
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, slug, content, seoTitle, seoDescription, isActive, sortOrder } =
      body;

    // Проверяем, существует ли страница
    const existingPage = await db.page.findUnique({
      where: { id: pageId },
    });

    if (!existingPage) {
      return NextResponse.json(
        {
          success: false,
          message: 'Страница не найдена',
        },
        { status: 404 }
      );
    }

    // Проверяем уникальность slug (если изменился)
    if (slug !== existingPage.slug) {
      const slugExists = await db.page.findFirst({
        where: { slug, id: { not: pageId } },
      });

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            message: 'Slug уже используется другой страницей',
          },
          { status: 400 }
        );
      }
    }

    // Обновляем страницу
    const updatedPage = await db.page.update({
      where: { id: pageId },
      data: {
        title,
        slug,
        content: content || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        isActive: Boolean(isActive),
        sortOrder: sortOrder ?? 0,
      },
    });

    // Инвалидируем кэш для страницы
    revalidatePath(`/pages/${slug}`, 'page');
    // Если slug изменился, инвалидируем и старый путь
    if (slug !== existingPage.slug) {
      revalidatePath(`/pages/${existingPage.slug}`, 'page');
    }
    // Инвалидируем список страниц
    revalidatePath('/pages', 'page');

    return NextResponse.json({
      success: true,
      message: 'Страница успешно обновлена',
      data: updatedPage,
    });
  } catch (error) {
    console.error('Update page error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при обновлении страницы',
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
    const pageId = parseInt(resolvedParams.id);

    if (isNaN(pageId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID страницы',
        },
        { status: 400 }
      );
    }

    // Проверяем, существует ли страница
    const page = await db.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return NextResponse.json(
        {
          success: false,
          message: 'Страница не найдена',
        },
        { status: 404 }
      );
    }

    // Удаляем страницу
    await db.page.delete({
      where: { id: pageId },
    });

    // Инвалидируем кэш
    revalidatePath(`/pages/${page.slug}`, 'page');
    revalidatePath('/pages', 'page');

    return NextResponse.json({
      success: true,
      message: 'Страница успешно удалена',
    });
  } catch (error) {
    console.error('Delete page error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при удалении страницы',
      },
      { status: 500 }
    );
  }
}

