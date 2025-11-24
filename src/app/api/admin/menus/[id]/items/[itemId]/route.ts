import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';

const menuItemUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  href: z.string().min(1).optional(),
  parentId: z.number().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  target: z.string().optional(),
  icon: z.string().optional().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const menuId = Number(id);
    const menuItemId = Number(itemId);
    const body = await req.json();
    const data = menuItemUpdateSchema.parse(body);

    if (isNaN(menuId) || isNaN(menuItemId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID меню или пункта',
        },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пункт меню
    const existingItem = await db.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!existingItem || existingItem.menuId !== menuId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Пункт меню не найден',
        },
        { status: 404 }
      );
    }

    // Проверяем parentId, если указан
    if (data.parentId !== undefined && data.parentId !== null) {
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

      // Не позволяем сделать пункт родителем самого себя
      if (data.parentId === menuItemId) {
        return NextResponse.json(
          {
            success: false,
            message: 'Пункт меню не может быть родителем самого себя',
          },
          { status: 400 }
        );
      }
    }

    // Обновляем пункт меню
    const updatedItem = await db.menuItem.update({
      where: { id: menuItemId },
      data: {
        title: data.title,
        href: data.href,
        parentId: data.parentId === null ? null : data.parentId,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        target: data.target,
        icon: data.icon === null ? null : data.icon,
      },
    });

    // Инвалидируем кэш меню
    revalidateTag('menus');

    return NextResponse.json({
      success: true,
      message: 'Пункт меню успешно обновлен',
      data: updatedItem,
    });
  } catch (error) {
    console.error('Update menu item error:', error);
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
        message: 'Ошибка при обновлении пункта меню',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const menuId = Number(id);
    const menuItemId = Number(itemId);

    if (isNaN(menuId) || isNaN(menuItemId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID меню или пункта',
        },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пункт меню
    const item = await db.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        children: true,
      },
    });

    if (!item || item.menuId !== menuId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Пункт меню не найден',
        },
        { status: 404 }
      );
    }

    // Удаляем пункт меню (дочерние элементы удалятся каскадно)
    await db.menuItem.delete({
      where: { id: menuItemId },
    });

    // Инвалидируем кэш меню
    revalidateTag('menus');

    return NextResponse.json({
      success: true,
      message: 'Пункт меню успешно удален',
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при удалении пункта меню',
      },
      { status: 500 }
    );
  }
}

