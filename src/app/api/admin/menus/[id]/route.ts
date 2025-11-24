import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';

const menuUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

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

    const menu = await db.menu.findUnique({
      where: { id: menuId },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
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

    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    console.error('Get menu error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении меню',
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
    const { id } = await params;
    const menuId = Number(id);
    const body = await req.json();
    const data = menuUpdateSchema.parse(body);

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
    const existingMenu = await db.menu.findUnique({
      where: { id: menuId },
    });

    if (!existingMenu) {
      return NextResponse.json(
        {
          success: false,
          message: 'Меню не найдено',
        },
        { status: 404 }
      );
    }

    // Проверяем уникальность name (если изменился)
    if (data.name && data.name !== existingMenu.name) {
      const nameExists = await db.menu.findFirst({
        where: { name: data.name, id: { not: menuId } },
      });

      if (nameExists) {
        return NextResponse.json(
          {
            success: false,
            message: 'Меню с таким названием уже существует',
          },
          { status: 400 }
        );
      }
    }

    // Обновляем меню
    const updatedMenu = await db.menu.update({
      where: { id: menuId },
      data: {
        name: data.name,
        description: data.description === '' ? null : data.description,
      },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    // Инвалидируем кэш меню
    revalidateTag('menus');

    return NextResponse.json({
      success: true,
      message: 'Меню успешно обновлено',
      data: updatedMenu,
    });
  } catch (error) {
    console.error('Update menu error:', error);
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
        message: 'Ошибка при обновлении меню',
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

    // Не позволяем удалять системные меню (header, footer)
    if (menu.name === 'header' || menu.name === 'footer') {
      return NextResponse.json(
        {
          success: false,
          message: 'Нельзя удалить системное меню',
        },
        { status: 400 }
      );
    }

    // Удаляем меню (пункты меню удалятся каскадно)
    await db.menu.delete({
      where: { id: menuId },
    });

    // Инвалидируем кэш меню
    revalidateTag('menus');

    return NextResponse.json({
      success: true,
      message: 'Меню успешно удалено',
    });
  } catch (error) {
    console.error('Delete menu error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при удалении меню',
      },
      { status: 500 }
    );
  }
}

