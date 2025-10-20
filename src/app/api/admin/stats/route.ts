import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const [totalProducts, totalCategories, totalOrders, totalCustomers] = await Promise.all([
    db.product.count(),
    db.category.count(),
    db.order.count(),
    db.user.count(),
  ]);

  return NextResponse.json({
    success: true,
    data: { totalProducts, totalCategories, totalOrders, totalCustomers },
  });
}

