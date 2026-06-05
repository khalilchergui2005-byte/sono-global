import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 دقائق

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization') || '');
    let userId: string | null = null;

    if (token) {
      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'طلب غير مصرح به' }, { status: 401 });
      }
      userId = payload.userId;
    }

    const body: unknown = await req.json();
    if (typeof body !== 'object' || body === null || !('packageId' in body)) {
      return NextResponse.json({ error: 'packageId مطلوب' }, { status: 400 });
    }

    const { packageId } = body as { packageId: string };

    if (typeof packageId !== 'string' || packageId.trim().length === 0) {
      return NextResponse.json({ error: 'packageId غير صالح' }, { status: 400 });
    }

    const pkg = await db.package.findUnique({
      where: { id: packageId.trim() },
      select: { id: true, price: true, visible: true },
    });

    if (!pkg) {
      return NextResponse.json({ error: 'الباقة غير موجودة' }, { status: 404 });
    }

    if (!pkg.visible) {
      return NextResponse.json({ error: 'الباقة غير متاحة حالياً' }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_DURATION_MS);

    return NextResponse.json({
      packageId:    pkg.id,
      lockedPrice:  pkg.price,
      priceLockedAt: now.toISOString(),
      expiresAt:    expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('[POST /api/payment/lock-price]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}