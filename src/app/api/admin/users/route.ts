import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { cache, cacheKeys, withCache } from '@/lib/cache';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(['customer', 'admin', 'manager']).optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const users = await withCache(
    cacheKeys.users(),
    () => db.user.findMany({ orderBy: { createdAt: 'desc' } }),
    2 * 60 * 1000 // 2 minutes cache
  );
  return NextResponse.json({ success: true, data: users });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createUserSchema.parse(body);
    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await db.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        phone: parsed.phone,
        role: parsed.role ?? 'customer',
        isActive: parsed.isActive ?? true,
      },
    });
    
    // Clear users cache after creating new user
    cache.clearPattern('users:');
    
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

