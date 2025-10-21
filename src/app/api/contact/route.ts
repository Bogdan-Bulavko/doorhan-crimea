import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Схема для контактной формы
const contactFormSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  email: z.string().email('Некорректный email'),
  phone: z.string().min(1, 'Телефон обязателен'),
  message: z.string().min(1, 'Сообщение обязательно'),
  type: z.literal('contact'),
});

// Схема для заявки на звонок
const callbackRequestSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  phone: z.string().min(1, 'Телефон обязателен'),
  preferredTime: z.string().optional(),
  message: z.string().optional(),
  type: z.literal('callback'),
});

// Объединенная схема
const requestSchema = z.discriminatedUnion('type', [
  contactFormSchema,
  callbackRequestSchema,
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = requestSchema.parse(body);

    if (validatedData.type === 'contact') {
      // Обработка контактной формы
      const contactForm = await db.contactForm.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          subject: 'Обратная связь с сайта',
          message: validatedData.message,
          status: 'new',
        },
      });

      return NextResponse.json({
        success: true,
        message:
          'Форма успешно отправлена! Мы свяжемся с вами в ближайшее время.',
        data: { id: contactForm.id, type: 'contact' },
      });
    } else if (validatedData.type === 'callback') {
      // Обработка заявки на звонок
      const callbackRequest = await db.callbackRequest.create({
        data: {
          name: validatedData.name,
          phone: validatedData.phone,
          preferredTime: validatedData.preferredTime || null,
          message: validatedData.message || null,
          status: 'new',
        },
      });

      return NextResponse.json({
        success: true,
        message:
          'Заявка на звонок успешно отправлена! Мы свяжемся с вами в ближайшее время.',
        data: { id: callbackRequest.id, type: 'callback' },
      });
    }
  } catch (error) {
    console.error('Contact/Callback form error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ошибка валидации данных',
          errors: error.issues.map((issue) => issue.message),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Произошла ошибка при отправке формы. Попробуйте еще раз.',
      },
      { status: 500 }
    );
  }
}
