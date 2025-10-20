import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({ imageUrl: z.string().url(), altText: z.string().optional(), isMain: z.boolean().optional() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const productId = Number(idStr);
    const body = await req.json();
    const data = schema.parse(body);
    const maxOrder = await db.productImage.aggregate({ _max: { sortOrder: true }, where: { productId } });
    const image = await db.productImage.create({
      data: { ...data, productId, sortOrder: (maxOrder._max.sortOrder ?? 0) + 1 },
    });
    return NextResponse.json({ success: true, data: image });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

