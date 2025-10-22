import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const orders = await db.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Convert Decimal to numbers for client components
  const serializedOrders = orders.map(order => ({
    ...order,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    tax: Number(order.tax),
    discount: Number(order.discount),
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map(item => ({
      ...item,
      price: Number(item.price),
      totalPrice: Number(item.totalPrice),
    })),
  }));

  return NextResponse.json({ success: true, data: serializedOrders });
}

