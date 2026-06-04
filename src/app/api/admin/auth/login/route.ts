import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

// Rate limiting — in-memory (resets on server restart)
// كافٍ لـ single-tenant SaaS
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 5;       // 5 محاولات
const WINDOW_MS    = 15 * 60 * 1000; // كل 15 دقيقة
const BLOCK_MS     = 30 * 60 * 1000; // حظر 30 دقيقة

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

  // Rate limit check
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: `عدد المحاولات تجاوز الحد. حاول بعد ${retryAfter ?? 0} ثانية.` },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter ?? BLOCK_MS / 1000) },
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
      return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 });
    }
    if (typeof password !== 'string' || !password) {
      return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true, password: true, role: true, name: true },
    });

    // نفس الرسالة للحالتين — لا نكشف هل الإيميل موجود أم لا
    if (!user || !user.password || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 401 });
    }

    // تسجيل الدخول ناجح — امسح محاولات الـ IP
    resetAttempts(ip);

    const settings = await db.siteSettings.findUnique({
      where: { id: 'main' },
      select: { agencyName: true, phonePrimary: true, email: true },
    });

    const onboardingComplete =
      !!settings?.agencyName?.trim() &&
      !!settings?.phonePrimary?.trim() &&
      !!settings?.email?.trim();

    const token = signToken({
      userId: user.id,
      email:  user.email,
      role:   user.role,
      name:   user.name ?? '',
      onboardingComplete,
    });

    const res = NextResponse.json({ ok: true, onboardingComplete });
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 30,
      path:     '/',
    });

    res.cookies.set('onboarding_complete', onboardingComplete ? 'true' : 'false', {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 30,
      path:     '/',
    });
    return res;
  } catch (e) {
    console.error('[admin/auth/login]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}