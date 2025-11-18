import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Публичный API endpoint для получения региональных данных
 * Используется фронтендом для получения контактов по региону
 */
export async function GET() {
  try {
    const regions = await db.region.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        code: true,
        name: true,
        phone: true,
        phoneFormatted: true,
        email: true,
        address: true,
        addressDescription: true,
        workingHours: true,
        workingHoursDescription: true,
        mapIframe: true,
        officeName: true,
        isActive: true,
      },
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

