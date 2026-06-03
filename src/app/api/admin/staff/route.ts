import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const staff = await db.staff.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, phone: true,
        active: true, permissions: true, createdAt: true,
      },
    });
    return NextResponse.json(staff);
  } catch (error) {
    console.error('[GET /api/admin/staff]', error);
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { name, email, password, phone, permissions } =
      body as Record<string, unknown>;

    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 });
    }
    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور 6 أحرف على الأقل' }, { status: 400 });
    }

    const existing = await db.staff.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم مسبقاً' },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const member = await db.staff.create({
      data: {
        name:        name.trim(),
        email:       email.trim().toLowerCase(),
        password:    hashed,
        phone:       typeof phone === 'string' ? phone.trim() : '',
        permissions: Array.isArray(permissions)
          ? permissions.map(String)
          : [],
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/staff]', error);
    return NextResponse.json({ error: 'خطأ في الحفظ' }, { status: 500 });
  }
}