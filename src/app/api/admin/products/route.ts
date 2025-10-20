import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  mainImageUrl: z.string().url().optional().or(z.literal('')),
  categoryId: z.number(),
  slug: z.string().min(1),
  sku: z.string().optional(),
  price: z.coerce.number(),
  oldPrice: z.coerce.number().optional(),
  currency: z.string().default('RUB').optional(),
  inStock: z.boolean().optional(),
  stockQuantity: z.number().optional(),
  isNew: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function GET() {
  const products = await db.product.findMany({
    include: { category: true, images: true, specifications: true, colors: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = productSchema.parse(body);
    const product = await db.product.create({ data });
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

