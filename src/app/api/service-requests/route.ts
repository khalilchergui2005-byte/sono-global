import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { name, phone, serviceSlug, serviceTitle, message } =
      body as Record<string, unknown>;

    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 });
    }
    if (typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json({ error: 'الهاتف مطلوب' }, { status: 400 });
    }
    if (typeof serviceSlug !== 'string' || !serviceSlug.trim()) {
      return NextResponse.json({ error: 'الخدمة مطلوبة' }, { status: 400 });
    }
    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'الاسم طويل جداً' }, { status: 400 });
    }
    if (phone.trim().length > 20) {
      return NextResponse.json({ error: 'رقم الهاتف غير صالح' }, { status: 400 });
    }
    if (serviceSlug.trim().length > 100) {
      return NextResponse.json({ error: 'معرف الخدمة غير صالح' }, { status: 400 });
    }
    if (typeof serviceTitle === 'string' && serviceTitle.length > 200) {
      return NextResponse.json({ error: 'عنوان الخدمة طويل جداً' }, { status: 400 });
    }
    if (typeof message === 'string' && message.length > 2000) {
      return NextResponse.json({ error: 'الرسالة طويلة جداً' }, { status: 400 });
    }

    const request = await db.serviceRequest.create({
      data: {
        name:         name.trim(),
        phone:        phone.trim(),
        serviceSlug:  serviceSlug.trim(),
        serviceTitle: typeof serviceTitle === 'string' ? serviceTitle.trim() : '',
        message:      typeof message      === 'string' ? message.trim()      : '',
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: request.id });
  } catch (error) {
    console.error('[POST /api/service-requests]', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}