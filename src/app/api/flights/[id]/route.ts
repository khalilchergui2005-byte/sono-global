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

    const flight = await db.flightRequest.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        from: true,
        to: true,
        departDate: true,
        returnDate: true,
        tripType: true,
        cabin: true,
        adults: true,
        children: true,
        infants: true,
        payment: true,
        notes: true,
        status: true,
        assignedTo: true,
        isRead: true,
        internalNote: true,
        createdAt: true,
      },
    });

    if (!flight) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(flight);
  } catch (err) {
    console.error('[GET /api/flights/[id]]', err);
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

    const existing = await db.flightRequest.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await db.flightRequest.update({
      where: { id },
      data: {
        ...(status       !== undefined && { status }),
        ...(assignedTo   !== undefined && { assignedTo }),
        ...(internalNote !== undefined && { internalNote }),
        ...(isRead       !== undefined && { isRead }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        from: true,
        to: true,
        departDate: true,
        returnDate: true,
        tripType: true,
        cabin: true,
        adults: true,
        children: true,
        infants: true,
        payment: true,
        notes: true,
        status: true,
        assignedTo: true,
        isRead: true,
        internalNote: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PUT /api/flights/[id]]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}