import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('staff_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload || payload.role !== 'STAFF') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const staff = await db.staff.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        permissions: true,
        active: true,
      },
    });

    if (!staff || !staff.active) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    return NextResponse.json({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: payload.role,
      permissions: staff.permissions,
    });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}