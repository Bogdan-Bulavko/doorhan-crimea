import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const orders = await db.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, data: orders });
}

