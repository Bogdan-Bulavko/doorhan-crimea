import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? 'all';
  if (type === 'contact') {
    const forms = await db.contactForm.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: forms });
  }
  if (type === 'callback') {
    const forms = await db.callbackRequest.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: forms });
  }
  const forms = await Promise.all([
    db.contactForm.findMany({ orderBy: { createdAt: 'desc' } }),
    db.callbackRequest.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);
  return NextResponse.json({ success: true, data: { contact: forms[0], callback: forms[1] } });
}

