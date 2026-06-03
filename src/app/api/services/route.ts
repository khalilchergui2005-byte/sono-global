// ملف: src/app/api/services/route.ts
// قائمة الخدمات العامة (المرئية فقط)

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { visible: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true, title: true, slug: true, icon: true,
        color: true, imageLabel: true,
        description: true, details: true, destinations: true,
      },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطأ' }, { status: 500 });
  }
}
