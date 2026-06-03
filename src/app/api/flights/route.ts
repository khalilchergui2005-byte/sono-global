import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyStaffOrAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = verifyStaffOrAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const flights = await db.flightRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(flights);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, phone, email, from, to,
      departDate, returnDate, tripType,
      cabin, adults, children, infants,
      payment, notes,
    } = body;

    if (!name || !phone || !from || !to || !departDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const flight = await db.flightRequest.create({
      data: {
        name,
        phone,
        email: email || null,
        from,
        to,
        departDate,
        returnDate: returnDate || null,
        tripType: tripType || 'round',
        cabin: cabin || 'economy',
        adults: Number(adults) || 1,
        children: Number(children) || 0,
        infants: Number(infants) || 0,
        payment: payment || 'cash',
        notes: notes || null,
      },
    });

    return NextResponse.json(flight, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}