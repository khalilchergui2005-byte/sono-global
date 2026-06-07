import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json({ error: 'معرف الحجز مطلوب' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: id.trim() },
      select: {
        id:            true,
        total:         true,
        paymentMethod: true,
        paymentStatus: true,
        status:        true,
        createdAt:     true,
        guestName:     true,
        guestPhone:    true,
        guestEmail:    true,
        user: {
          select: { name: true, email: true, phone: true },
        },
        package: {
          select: { id: true, title: true, country: true, duration: true, image: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'الحجز غير موجود' }, { status: 404 });
    }

    return NextResponse.json(booking);

  } catch (error) {
    console.error('GET /api/bookings/[id]', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
