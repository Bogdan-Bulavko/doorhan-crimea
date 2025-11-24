import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';

const regionSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  phoneFormatted: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  addressDescription: z.string().optional(),
  workingHours: z.string().min(1),
  workingHoursDescription: z.string().optional(),
  mapIframe: z.string().optional(),
  officeName: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function GET() {
  try {
    const regions = await db.region.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ success: true, data: regions });
  } catch (error) {
    console.error('Get regions error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении регионов',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = regionSchema.parse(body);

    // Проверяем уникальность code
    const existingRegion = await db.region.findUnique({
      where: { code: data.code },
    });

    if (existingRegion) {
      return NextResponse.json(
        {
          success: false,
          message: 'Регион с таким кодом уже существует',
        },
        { status: 400 }
      );
    }

    const region = await db.region.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    // Инвалидируем кэш регионов
    revalidateTag('regions');

    return NextResponse.json({
      success: true,
      message: 'Регион успешно создан',
      data: region,
    });
  } catch (error) {
    console.error('Create region error:', error);
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
        message: 'Ошибка при создании региона',
      },
      { status: 500 }
    );
  }
}

