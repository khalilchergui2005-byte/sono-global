import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

// Rate limiting in-memory
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS    = 15 * 60 * 1000;

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count += 1;
  return { allowed: true };
}

function resetAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: `عدد المحاولات تجاوز الحد. حاول بعد ${retryAfter ?? 0} ثانية.` },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter ?? 900) },
      }
    );
  }

  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { email, password } = body as Record<string, unknown>;

    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'الإيميل وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }
    if (typeof password !== 'string' || !password) {
      return NextResponse.json(
        { error: 'الإيميل وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const staff = await db.staff.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: {
        id: true, name: true, email: true,
        password: true, active: true, permissions: true,
      },
    });

    // نفس الرسالة — لا نكشف هل الإيميل موجود
    if (!staff) {
      return NextResponse.json({ error: 'بيانات خاطئة' }, { status: 401 });
    }

    if (!staff.active) {
      return NextResponse.json({ error: 'الحساب معطل' }, { status: 403 });
    }

    const valid = await comparePassword(password, staff.password);
    if (!valid) {
      return NextResponse.json({ error: 'بيانات خاطئة' }, { status: 401 });
    }

    // نجح — امسح المحاولات
    resetAttempts(ip);

    const token = signToken({
      userId: staff.id,
      email:  staff.email,
      role:   'STAFF',
      name:   staff.name,
    });

    const response = NextResponse.json({
      success: true,
      staff: {
        id:          staff.id,
        name:        staff.name,
        email:       staff.email,
        permissions: staff.permissions,
      },
    });

    response.cookies.set('staff_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    });

    return response;
  } catch (error) {
    console.error('[POST /api/staff/login]', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}