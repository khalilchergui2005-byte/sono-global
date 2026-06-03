import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { verifyAdmin } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    const existing = await db.staff.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 });
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { name, phone, permissions, active, password } =
      body as Record<string, unknown>;

    const data: Record<string, unknown> = {};
    if (typeof name === 'string' && name.trim()) data.name = name.trim();
    if (typeof phone === 'string') data.phone = phone.trim();
    if (Array.isArray(permissions)) data.permissions = permissions;
    if (typeof active === 'boolean') data.active = active;
    if (typeof password === 'string' && password.length >= 6) {
      data.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'لا توجد بيانات للتحديث' }, { status: 400 });
    }

    const member = await db.staff.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        permissions: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error('[PUT /api/admin/staff/[id]]', error);
    return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    const existing = await db.staff.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 });
    }

    await db.staff.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/staff/[id]]', error);
    return NextResponse.json({ error: 'خطأ في الحذف' }, { status: 500 });
  }
}