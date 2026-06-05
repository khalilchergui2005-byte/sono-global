import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

// ─── Rate Limiting ────────────────────────────────────────────────────────────
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

// ─── Phone Validation ─────────────────────────────────────────────────────────
// يقبل: أرقام، مسافات، +، -، (, )  — طول 7-20 حرف
// يرفض: حروف، HTML، SQL injection، newlines
const PHONE_RE = /^[\d\s\+\-\(\)]{7,20}$/;

// ─── GET — Admin only ─────────────────────────────────────────────────────────
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
  } catch (error) {
    console.error('[GET /api/contact-messages]', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// ─── POST — Public (rate limited) ────────────────────────────────────────────
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

    const { name, phone, service, serviceSlug, message } =
      body as Record<string, unknown>;

    // ── الحقول المطلوبة
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 });
    }
    if (typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json({ error: 'الهاتف مطلوب' }, { status: 400 });
    }

    // ── حدود الطول
    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'الاسم طويل جداً' }, { status: 400 });
    }
    if (typeof service === 'string' && service.length > 100) {
      return NextResponse.json({ error: 'اسم الخدمة غير صالح' }, { status: 400 });
    }
    if (typeof message === 'string' && message.length > 2000) {
      return NextResponse.json({ error: 'الرسالة طويلة جداً' }, { status: 400 });
    }

    // ── تحقق من صيغة الهاتف (يرفض HTML/scripts/letters)
    if (!PHONE_RE.test(phone.trim())) {
      return NextResponse.json({ error: 'رقم الهاتف غير صالح' }, { status: 400 });
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
    return NextResponse.json({ error: 'حدث خطأ في الحفظ' }, { status: 500 });
  }
}