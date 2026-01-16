/**
 * Утилита для проверки авторизации в API роутах
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function requireAuth(
  _request: NextRequest
): Promise<{ success: true; userId: number; role: string } | { success: false; response: NextResponse }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any);
    
    if (!session) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: 'Не авторизован' },
          { status: 401 }
        ),
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session as any).role;
    if (role !== 'admin' && role !== 'manager') {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: 'Недостаточно прав' },
          { status: 403 }
        ),
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = parseInt((session as any).user?.id || '0');
    if (!userId) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, message: 'Неверная сессия' },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      userId,
      role,
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: 'Ошибка проверки авторизации' },
        { status: 500 }
      ),
    };
  }
}
