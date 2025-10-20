import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(['customer', 'admin', 'manager']).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    const body = await req.json();
    const data = updateUserSchema.parse(body);
    const user = await db.user.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

