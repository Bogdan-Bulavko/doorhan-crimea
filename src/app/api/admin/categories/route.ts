import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  iconName: z.string().optional(),
  color: z.string().optional(),
  hoverColor: z.string().optional(),
  slug: z.string().min(1),
  parentId: z.number().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  contentTop: z.string().optional().nullable(),
  contentBottom: z.string().optional().nullable(),
});

export async function GET() {
  const categories = await db.category.findMany({
    include: { children: true },
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  });
  return NextResponse.json({ success: true, data: categories });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = categorySchema.parse(body);
    const category = await db.category.create({ data });
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

