import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { revalidateTag, revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/require-auth';

const settingsSchema = z.object({
  // Основные контакты
  phone: z.string().min(1, 'Телефон обязателен'),
  email: z.string().email('Некорректный email'),
  address: z.string().min(1, 'Адрес обязателен'),
  workingHours: z.string().min(1, 'Режим работы обязателен'),
  phoneDescription: z.string().optional(),
  emailDescription: z.string().optional(),
  addressDescription: z.string().optional(),
  workingHoursDescription: z.string().optional(),
  
  // Глобальные SEO настройки
  siteTitle: z.string().min(1, 'Заголовок сайта обязателен'),
  siteDescription: z.string().min(1, 'Описание сайта обязательно'),
  siteKeywords: z.string().optional(),
  siteOgImage: z.string().optional(),
  
  // SEO для страниц каталога
  catalogTitle: z.string().optional(),
  catalogDescription: z.string().optional(),
  catalogKeywords: z.string().optional(),
  
  // SEO для страницы категорий
  categoriesTitle: z.string().optional(),
  categoriesDescription: z.string().optional(),
  categoriesKeywords: z.string().optional(),
  
  // SEO для домашней страницы
  homeSeoTitle: z.string().optional(),
  homeSeoDescription: z.string().optional(),
  homeH1: z.string().optional(),
  homeCanonicalUrl: z.string().optional(),
  homeRobotsMeta: z.string().optional(),
  homeSchemaMarkup: z.string().optional(),
  
  // Сквозная микроразметка
  globalSchemaMarkup: z.string().optional(),
  
  // Кастомные CSS и JS
  customCss: z.string().optional(),
  customJs: z.string().optional(),
  
  // Карта
  mapIframe: z.string().optional(),
  
  // Товары на главной странице
  featuredProductIds: z.string().optional(), // JSON массив ID товаров
});

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

export async function PUT(req: NextRequest) {
  // Проверка авторизации
  const authResult = await requireAuth(req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const data = settingsSchema.parse(body);

    // Обновляем или создаем настройки
    const settingsToUpdate = [
      // Основные контакты
      { key: 'phone', value: data.phone },
      { key: 'email', value: data.email },
      { key: 'address', value: data.address },
      { key: 'workingHours', value: data.workingHours },
      { key: 'phoneDescription', value: data.phoneDescription || 'Звонки принимаются ежедневно' },
      { key: 'emailDescription', value: data.emailDescription || 'Ответим в течение часа' },
      { key: 'addressDescription', value: data.addressDescription || 'Офис и выставочный зал' },
      { key: 'workingHoursDescription', value: data.workingHoursDescription || 'Воскресенье - выходной' },
      
      // Глобальные SEO настройки
      { key: 'siteTitle', value: data.siteTitle },
      { key: 'siteDescription', value: data.siteDescription },
      { key: 'siteKeywords', value: data.siteKeywords || '' },
      { key: 'siteOgImage', value: data.siteOgImage || '' },
      
      // SEO для страниц каталога
      { key: 'catalogTitle', value: data.catalogTitle || '' },
      { key: 'catalogDescription', value: data.catalogDescription || '' },
      { key: 'catalogKeywords', value: data.catalogKeywords || '' },
      
      // SEO для страницы категорий
      { key: 'categoriesTitle', value: data.categoriesTitle || '' },
      { key: 'categoriesDescription', value: data.categoriesDescription || '' },
      { key: 'categoriesKeywords', value: data.categoriesKeywords || '' },
      
      // SEO для домашней страницы
      { key: 'homeSeoTitle', value: data.homeSeoTitle || '' },
      { key: 'homeSeoDescription', value: data.homeSeoDescription || '' },
      { key: 'homeH1', value: data.homeH1 || '' },
      { key: 'homeCanonicalUrl', value: data.homeCanonicalUrl || '' },
      { key: 'homeRobotsMeta', value: data.homeRobotsMeta || 'index, follow' },
      { key: 'homeSchemaMarkup', value: data.homeSchemaMarkup || '' },
      
      // Сквозная микроразметка
      { key: 'globalSchemaMarkup', value: data.globalSchemaMarkup || '' },
      
      // Кастомные CSS и JS
      { key: 'customCss', value: data.customCss || '' },
      { key: 'customJs', value: data.customJs || '' },
      
      // Карта
      { key: 'mapIframe', value: data.mapIframe || '' },
      
      // Товары на главной странице
      { key: 'featuredProductIds', value: data.featuredProductIds || '[]' },
    ];

    // Используем транзакцию для обновления всех настроек
    await db.$transaction(
      settingsToUpdate.map(({ key, value }) =>
        db.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, type: 'string' },
        })
      )
    );

    // Инвалидируем кэш настроек сайта
    revalidateTag('site-settings');
    // Инвалидируем главную страницу (использует настройки)
    revalidatePath('/', 'page');

    return NextResponse.json({
      success: true,
      message: 'Настройки успешно обновлены',
    });
  } catch (error) {
    console.error('Settings PUT error:', error);
    
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
        message: 'Ошибка при обновлении настроек',
      },
      { status: 500 }
    );
  }
}
