import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

const NAME_MAX  = 100;
const PHONE_RE  = /^[\d\s\+\-\(\)]{7,20}$/;

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization') ?? '');
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'token منتهي أو غير صالح' }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });

    return NextResponse.json(user);
  } catch (err) {
    console.error('[GET /api/auth/me]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization') ?? '');
    if (!token) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { name, phone } = body as Record<string, unknown>;

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim() || name.trim().length > NAME_MAX) {
        return NextResponse.json({ error: 'الاسم غير صالح' }, { status: 400 });
      }
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || !PHONE_RE.test(phone.trim())) {
        return NextResponse.json({ error: 'رقم الهاتف غير صالح' }, { status: 400 });
      }
    }

    const user = await db.user.update({
      where: { id: payload.userId },
      data: {
        name:  typeof name  === 'string' ? name.trim()  : undefined,
        phone: typeof phone === 'string' ? phone.trim() : undefined,
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error('[PUT /api/auth/me]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}