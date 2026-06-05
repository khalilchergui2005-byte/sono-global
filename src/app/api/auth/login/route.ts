import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

// ── Rate Limiting ──────────────────────────────────────────────
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

// ── Email Regex ────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ── POST /api/auth/login ───────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getIP(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'طلبات كثيرة — حاول لاحقاً' },
      { status: 429 }
    );
  }

  try {
    const body: unknown = await req.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      !('email' in body) ||
      !('password' in body) ||
      typeof (body as Record<string, unknown>).email !== 'string' ||
      typeof (body as Record<string, unknown>).password !== 'string'
    ) {
      return NextResponse.json(
        { error: 'البريد وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const email    = ((body as Record<string, unknown>).email as string).trim().toLowerCase();
    const password = (body as Record<string, unknown>).password as string;

    if (!EMAIL_RE.test(email) || !password) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة' },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email:  user.email,
      role:   user.role,
      name:   user.name ?? '',
    });

    return NextResponse.json({
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  user.role,
      },
    });
  } catch (err) {
    console.error('[auth/login POST]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}