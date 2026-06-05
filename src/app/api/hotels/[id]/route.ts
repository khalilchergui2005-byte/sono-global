import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyStaffOrAdmin } from '@/lib/auth';

const STATUS_RE = /^(PENDING|CONFIRMED|CANCELLED)$/;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyStaffOrAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    const hotel = await db.hotelRequest.findUnique({ where: { id } });
    if (!hotel) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(hotel);
  } catch (err) {
    console.error('[GET /api/hotels/[id]]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyStaffOrAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    const existing = await db.hotelRequest.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { status, assignedTo, internalNote, isRead } =
      body as Record<string, unknown>;

    if (status !== undefined) {
      if (typeof status !== 'string' || !STATUS_RE.test(status)) {
        return NextResponse.json({ error: 'status غير صالح' }, { status: 400 });
      }
    }
    if (assignedTo !== undefined && assignedTo !== null) {
      if (typeof assignedTo !== 'string' || assignedTo.trim().length > 100) {
        return NextResponse.json({ error: 'assignedTo غير صالح' }, { status: 400 });
      }
    }
    if (internalNote !== undefined && internalNote !== null) {
      if (typeof internalNote !== 'string' || internalNote.length > 2000) {
        return NextResponse.json({ error: 'internalNote طويلة جداً' }, { status: 400 });
      }
    }
    if (isRead !== undefined) {
      if (typeof isRead !== 'boolean') {
        return NextResponse.json({ error: 'isRead يجب أن يكون boolean' }, { status: 400 });
      }
    }

    const updated = await db.hotelRequest.update({
      where: { id },
      data: {
        ...(status       !== undefined && { status }),
        ...(assignedTo   !== undefined && { assignedTo }),
        ...(internalNote !== undefined && { internalNote }),
        ...(isRead       !== undefined && { isRead }),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PUT /api/hotels/[id]]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}