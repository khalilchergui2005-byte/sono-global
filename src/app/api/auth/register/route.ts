import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = registerAttempts.get(ip);
  if (!record || now > record.resetAt) {
    registerAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_ATTEMPTS) return false;
  record.count += 1;
  return true;
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
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

    const { name, email, phone, password } = body as Record<string, unknown>;

    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 });
    }
    if (email.trim().length > 254) {
      return NextResponse.json({ error: 'البريد الإلكتروني طويل جداً' }, { status: 400 });
    }
    if (typeof password !== 'string' || !password) {
      return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور 6 أحرف على الأقل' }, { status: 400 });
    }
    if (password.length > 128) {
      return NextResponse.json({ error: 'كلمة المرور طويلة جداً' }, { status: 400 });
    }
    if (typeof name === 'string' && name.trim().length > 100) {
      return NextResponse.json({ error: 'الاسم طويل جداً' }, { status: 400 });
    }
    if (typeof phone === 'string' && phone.trim().length > 20) {
      return NextResponse.json({ error: 'رقم الهاتف غير صالح' }, { status: 400 });
    }

    const exists = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم مسبقاً' }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name:     typeof name  === 'string' && name.trim()  ? name.trim()  : null,
        email:    email.trim().toLowerCase(),
        phone:    typeof phone === 'string' && phone.trim() ? phone.trim() : null,
        password: hashed,
        role:     'CUSTOMER',
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    const token = signToken({
      userId: user.id,
      email:  user.email,
      role:   user.role,
      name:   user.name ?? '',
    });

    return NextResponse.json({ token, user }, { status: 201 });

  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}