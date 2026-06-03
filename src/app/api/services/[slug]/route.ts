// ملف: src/app/api/services/[slug]/route.ts
// خدمة واحدة بالـ slug

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const service = await db.service.findUnique({
      where: { slug, visible: true },
    });
    if (!service) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطأ' }, { status: 500 });
  }
}