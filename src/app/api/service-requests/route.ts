import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendServiceRequestNotification } from '@/lib/mailer';

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX    = 5;
const WINDOW = 60 * 60 * 1000;

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now    = Date.now();
  const record = attempts.get(ip);
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW });
    return true;
  }
  if (record.count >= MAX) return false;
  record.count += 1;
  return true;
}

const PHONE_RE = /^[\d\s\+\-\(\)]{7,20}$/;
const SLUG_RE  = /^[a-z0-9\-]{1,100}$/;

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'تجاوزت الحد المسموح — حاول بعد ساعة' },
      { status: 429 },
    );
  }

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
    if (typeof serviceTitle === 'string' && serviceTitle.length > 200) {
      return NextResponse.json({ error: 'عنوان الخدمة طويل جداً' }, { status: 400 });
    }
    if (typeof message === 'string' && message.length > 2000) {
      return NextResponse.json({ error: 'الرسالة طويلة جداً' }, { status: 400 });
    }
    if (!PHONE_RE.test(phone.trim())) {
      return NextResponse.json({ error: 'رقم الهاتف غير صالح' }, { status: 400 });
    }
    if (!SLUG_RE.test(serviceSlug.trim())) {
      return NextResponse.json({ error: 'معرف الخدمة غير صالح' }, { status: 400 });
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

    // إرسال إيميل للأدمن — silent fail
    void sendServiceRequestNotification({
      customerName:  name.trim(),
      customerPhone: phone.trim(),
      serviceTitle:  typeof serviceTitle === 'string' ? serviceTitle.trim() : 'خدمة',
      requestId:     request.id,
    });

    return NextResponse.json({ success: true, id: request.id });
  } catch (error) {
    console.error('[POST /api/service-requests]', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}