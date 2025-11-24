import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';

const menuItemSchema = z.object({
  title: z.string().min(1, 'Название пункта обязательно'),
  href: z.string().min(1, 'URL обязателен'),
  parentId: z.number().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  target: z.string().optional(),
  icon: z.string().optional().nullable(),
});

const menuItemsUpdateSchema = z.object({
  items: z.array(menuItemSchema),
});

// Получить все пункты меню
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuId = Number(id);

    if (isNaN(menuId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID меню',
        },
        { status: 400 }
      );
    }

    const items = await db.menuItem.findMany({
      where: { menuId },
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Get menu items error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении пунктов меню',
      },
      { status: 500 }
    );
  }
}

// Создать или обновить пункты меню (массовое обновление)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuId = Number(id);
    const body = await req.json();
    const data = menuItemsUpdateSchema.parse(body);

    if (isNaN(menuId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID меню',
        },
        { status: 400 }
      );
    }

    // Проверяем, существует ли меню
    const menu = await db.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu) {
      return NextResponse.json(
        {
          success: false,
          message: 'Меню не найдено',
        },
        { status: 404 }
      );
    }

    // Удаляем все существующие пункты меню
    await db.menuItem.deleteMany({
      where: { menuId },
    });

    // Создаем новые пункты меню
    const createdItems = await Promise.all(
      data.items.map((item) =>
        db.menuItem.create({
          data: {
            menuId,
            title: item.title,
            href: item.href,
            parentId: item.parentId || null,
            isActive: item.isActive ?? true,
            sortOrder: item.sortOrder ?? 0,
            target: item.target || '_self',
            icon: item.icon || null,
          },
        })
      )
    );

    // Инвалидируем кэш меню
    revalidateTag('menus');

    return NextResponse.json({
      success: true,
      message: 'Пункты меню успешно обновлены',
      data: createdItems,
    });
  } catch (error) {
    console.error('Update menu items error:', error);
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
        message: 'Ошибка при обновлении пунктов меню',
      },
      { status: 500 }
    );
  }
}

// Создать новый пункт меню
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuId = Number(id);
    const body = await req.json();
    const data = menuItemSchema.parse(body);

    if (isNaN(menuId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID меню',
        },
        { status: 400 }
      );
    }

    // Проверяем, существует ли меню
    const menu = await db.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu) {
      return NextResponse.json(
        {
          success: false,
          message: 'Меню не найдено',
        },
        { status: 404 }
      );
    }

    // Проверяем parentId, если указан
    if (data.parentId) {
      const parent = await db.menuItem.findUnique({
        where: { id: data.parentId },
      });

      if (!parent || parent.menuId !== menuId) {
        return NextResponse.json(
          {
            success: false,
            message: 'Родительский пункт меню не найден',
          },
          { status: 400 }
        );
      }
    }

    const item = await db.menuItem.create({
      data: {
        menuId,
        title: data.title,
        href: data.href,
        parentId: data.parentId || null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        target: data.target || '_self',
        icon: data.icon || null,
      },
    });

    // Инвалидируем кэш меню
    revalidateTag('menus');

    return NextResponse.json({
      success: true,
      message: 'Пункт меню успешно создан',
      data: item,
    });
  } catch (error) {
    console.error('Create menu item error:', error);
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
        message: 'Ошибка при создании пункта меню',
      },
      { status: 500 }
    );
  }
}

