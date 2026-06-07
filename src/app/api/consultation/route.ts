import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyStaffOrAdmin } from '@/lib/auth';
import { sendConsultationNotification } from '@/lib/mailer';

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

export async function GET(req: NextRequest) {
  const auth = verifyStaffOrAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const consultations = await db.consultation.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id:          true,
        name:        true,
        phone:       true,
        service:     true,
        serviceSlug: true,
        message:     true,
        status:      true,
        paid:        true,
        assignedTo:  true,
        createdAt:   true,
      },
    });
    return NextResponse.json(consultations);
  } catch (error) {
    console.error('[GET /api/consultation]', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'تجاوزت الحد المسموح — حاول بعد ساعة' },
      { status: 429 }
    );
  }

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
    if (typeof message === 'string' && message.length > 2000) {
      return NextResponse.json({ error: 'الرسالة طويلة جداً' }, { status: 400 });
    }
    if (typeof service === 'string' && service.length > 100) {
      return NextResponse.json({ error: 'اسم الخدمة غير صالح' }, { status: 400 });
    }

    const consultation = await db.consultation.create({
      data: {
        name:        name.trim(),
        phone:       phone.trim(),
        service:     typeof service     === 'string' ? service.trim()     : '',
        serviceSlug: typeof serviceSlug === 'string' ? serviceSlug.trim() : '',
        message:     typeof message     === 'string' ? message.trim()     : '',
      },
      select: { id: true },
    });

    // إرسال إيميل للأدمن — silent fail
    void sendConsultationNotification({
      customerName:   name.trim(),
      customerPhone:  phone.trim(),
      subject:        typeof service === 'string' ? service.trim() : 'استشارة عامة',
      consultationId: consultation.id,
    });

    return NextResponse.json({ success: true, id: consultation.id });
  } catch (error) {
    console.error('[POST /api/consultation]', error);
    return NextResponse.json({ error: 'حدث خطأ في الحفظ' }, { status: 500 });
  }
}