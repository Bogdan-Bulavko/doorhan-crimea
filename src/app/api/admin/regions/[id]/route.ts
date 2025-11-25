import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';

const regionUpdateSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  phoneFormatted: z.string().min(1).optional(),
  email: z.string().email().optional(),
  address: z.string().min(1).optional(),
  addressDescription: z.string().optional(),
  workingHours: z.string().min(1).optional(),
  workingHoursDescription: z.string().optional(),
  mapIframe: z.string().optional(),
  officeName: z.string().optional(),
  schemaMarkup: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID региона',
        },
        { status: 400 }
      );
    }

    const region = await db.region.findUnique({
      where: { id },
    });

    if (!region) {
      return NextResponse.json(
        {
          success: false,
          message: 'Регион не найден',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: region,
    });
  } catch (error) {
    console.error('Get region error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении региона',
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
    const { id: idStr } = await params;
    const id = Number(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID региона',
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const data = regionUpdateSchema.parse(body);

    // Проверяем, существует ли регион
    const existingRegion = await db.region.findUnique({
      where: { id },
    });

    if (!existingRegion) {
      return NextResponse.json(
        {
          success: false,
          message: 'Регион не найден',
        },
        { status: 404 }
      );
    }

    // Проверяем уникальность code (если изменился)
    if (data.code && data.code !== existingRegion.code) {
      const codeExists = await db.region.findFirst({
        where: { code: data.code, id: { not: id } },
      });

      if (codeExists) {
        return NextResponse.json(
          {
            success: false,
            message: 'Регион с таким кодом уже существует',
          },
          { status: 400 }
        );
      }
    }

    // Обновляем регион
    const updatedRegion = await db.region.update({
      where: { id },
      data: {
        ...data,
        addressDescription: data.addressDescription === '' ? null : data.addressDescription,
        workingHoursDescription: data.workingHoursDescription === '' ? null : data.workingHoursDescription,
        mapIframe: data.mapIframe === '' ? null : data.mapIframe,
        officeName: data.officeName === '' ? null : data.officeName,
        schemaMarkup: data.schemaMarkup === '' ? null : data.schemaMarkup,
      },
    });

    // Инвалидируем кэш регионов
    revalidateTag('regions');

    return NextResponse.json({
      success: true,
      message: 'Регион успешно обновлен',
      data: updatedRegion,
    });
  } catch (error) {
    console.error('Update region error:', error);
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
        message: 'Ошибка при обновлении региона',
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
    const { id: idStr } = await params;
    const id = Number(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Неверный ID региона',
        },
        { status: 400 }
      );
    }

    // Проверяем, существует ли регион
    const region = await db.region.findUnique({
      where: { id },
    });

    if (!region) {
      return NextResponse.json(
        {
          success: false,
          message: 'Регион не найден',
        },
        { status: 404 }
      );
    }

    // Не позволяем удалять регион с кодом "default"
    if (region.code === 'default') {
      return NextResponse.json(
        {
          success: false,
          message: 'Нельзя удалить регион по умолчанию',
        },
        { status: 400 }
      );
    }

    // Удаляем регион
    await db.region.delete({
      where: { id },
    });

    // Инвалидируем кэш регионов
    revalidateTag('regions');

    return NextResponse.json({
      success: true,
      message: 'Регион успешно удален',
    });
  } catch (error) {
    console.error('Delete region error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при удалении региона',
      },
      { status: 500 }
    );
  }
}
