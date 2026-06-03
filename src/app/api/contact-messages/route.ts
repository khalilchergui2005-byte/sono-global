import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id:          true,
        name:        true,
        phone:       true,
        service:     true,
        serviceSlug: true,
        message:     true,
        isRead:      true,
        assignedTo:  true,
        createdAt:   true,
      },
    });
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { name, phone, service, serviceSlug, message } =
      body as Record<string, unknown>;

    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 });
    }
    if (typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json({ error: 'الهاتف مطلوب' }, { status: 400 });
    }
    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'الاسم طويل جداً' }, { status: 400 });
    }
    if (phone.trim().length > 20) {
      return NextResponse.json({ error: 'رقم الهاتف غير صالح' }, { status: 400 });
    }
    if (typeof service === 'string' && service.length > 100) {
      return NextResponse.json({ error: 'اسم الخدمة غير صالح' }, { status: 400 });
    }
    if (typeof message === 'string' && message.length > 2000) {
      return NextResponse.json({ error: 'الرسالة طويلة جداً' }, { status: 400 });
    }

    const contact = await db.contactMessage.create({
      data: {
        name:        name.trim(),
        phone:       phone.trim(),
        service:     typeof service     === 'string' ? service.trim()     : null,
        serviceSlug: typeof serviceSlug === 'string' ? serviceSlug.trim() : null,
        message:     typeof message     === 'string' ? message.trim()     : null,
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: contact.id });
  } catch (error) {
    console.error('[POST /api/contact-messages]', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}