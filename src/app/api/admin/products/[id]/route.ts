import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true, images: true, specifications: true, colors: true },
  });
  return NextResponse.json({ success: true, data: product });
}

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  mainImageUrl: z.string().url().optional().or(z.literal('')),
  categoryId: z.number().optional(),
  slug: z.string().min(1).optional(),
  sku: z.string().optional(),
  price: z.coerce.number().optional(),
  oldPrice: z.coerce.number().optional(),
  currency: z.string().optional(),
  inStock: z.boolean().optional(),
  stockQuantity: z.number().optional(),
  isNew: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    const body = await req.json();
    const data = productUpdateSchema.parse(body);
    const product = await db.product.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

