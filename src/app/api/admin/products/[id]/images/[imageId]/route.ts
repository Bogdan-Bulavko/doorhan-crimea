import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  try {
    const { imageId: imageIdStr } = await params;
    const imageId = Number(imageIdStr);
    await db.productImage.delete({ where: { id: imageId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

