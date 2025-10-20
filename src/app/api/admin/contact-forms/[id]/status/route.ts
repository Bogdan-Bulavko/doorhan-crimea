import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({ status: z.string().min(1), adminNotes: z.string().optional() });

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    const body = await req.json();
    const data = schema.parse(body);
    const form = await db.contactForm.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

