import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });

    // Преобразуем массив настроек в объект
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string | null>);

    return NextResponse.json({
      success: true,
      data: settingsObject,
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении настроек',
      },
      { status: 500 }
    );
  }
}
