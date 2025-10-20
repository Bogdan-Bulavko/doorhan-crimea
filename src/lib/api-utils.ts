import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success, data, message, errors });
}

export function createSuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return createApiResponse(true, data, message);
}

export function createErrorResponse(
  message: string,
  status: number = 400,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, message, errors },
    { status }
  );
}

export function createValidationErrorResponse(
  errors: Record<string, string[]>
): NextResponse<ApiResponse> {
  return createErrorResponse('Validation failed', 400, errors);
}

export async function handleApiRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
  handler: (data: T, request: NextRequest) => Promise<unknown>
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    const result = await handler(validatedData, request);
    return createSuccessResponse(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return createValidationErrorResponse(errors);
    }
    
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return createErrorResponse(message, 500);
  }
}

export function withAuth(handler: (request: NextRequest, userId: number) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // This would be implemented with your auth system
      // For now, we'll assume the user ID is passed in headers
      const userId = request.headers.get('x-user-id');
      if (!userId) {
        return createErrorResponse('Unauthorized', 401);
      }
      
      return await handler(request, parseInt(userId));
    } catch (error) {
      console.error('Auth Error:', error);
      return createErrorResponse('Authentication failed', 401);
    }
  };
}

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Clean old entries
      for (const [id, data] of requests.entries()) {
        if (data.resetTime < windowStart) {
          requests.delete(id);
        }
      }
      
      const clientData = requests.get(clientId);
      
      if (!clientData) {
        requests.set(clientId, { count: 1, resetTime: now });
      } else if (clientData.resetTime < windowStart) {
        requests.set(clientId, { count: 1, resetTime: now });
      } else if (clientData.count >= maxRequests) {
        return createErrorResponse('Too many requests', 429);
      } else {
        requests.set(clientId, { count: clientData.count + 1, resetTime: clientData.resetTime });
      }
      
      return await handler(request);
    };
  };
}
