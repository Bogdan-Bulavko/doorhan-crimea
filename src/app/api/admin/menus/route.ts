import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const menuSchema = z.object({
  name: z.string().min(1, 'Название меню обязательно'),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const menus = await db.menu.findMany({
      include: {
        items: {
          where: { parentId: null }, // Только корневые элементы
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error('Get menus error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении меню',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = menuSchema.parse(body);

    // Проверяем уникальность name
    const existingMenu = await db.menu.findUnique({
      where: { name: data.name },
    });

    if (existingMenu) {
      return NextResponse.json(
        {
          success: false,
          message: 'Меню с таким названием уже существует',
        },
        { status: 400 }
      );
    }

    const menu = await db.menu.create({
      data: {
        name: data.name,
        description: data.description || null,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Меню успешно создано',
      data: menu,
    });
  } catch (error) {
    console.error('Create menu error:', error);
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
        message: 'Ошибка при создании меню',
      },
      { status: 500 }
    );
  }
}

