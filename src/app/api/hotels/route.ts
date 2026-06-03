import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyStaffOrAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = verifyStaffOrAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const hotels = await db.hotelRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(hotels);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, phone, email, city, hotelName,
      checkIn, checkOut, rooms, adults,
      children, stars, payment, notes,
    } = body;

    if (!name || !phone || !city || !checkIn || !checkOut) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hotel = await db.hotelRequest.create({
      data: {
        name,
        phone,
        email: email || null,
        city,
        hotelName: hotelName || null,
        checkIn,
        checkOut,
        rooms: Number(rooms) || 1,
        adults: Number(adults) || 2,
        children: Number(children) || 0,
        stars: stars || null,
        payment: payment || 'cash',
        notes: notes || null,
      },
    });

    return NextResponse.json(hotel, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}