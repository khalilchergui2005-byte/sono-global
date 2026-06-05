import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyStaffOrAdmin } from '@/lib/auth';

const PHONE_RE   = /^[\d\s\+\-\(\)]{7,20}$/;
const DATE_RE    = /^\d{4}-\d{2}-\d{2}$/;
const PAYMENT_RE = /^(cash|card|transfer)$/;
const STARS_RE   = /^(1|2|3|4|5)$/;
const NAME_MAX   = 100;
const CITY_MAX   = 100;
const NOTES_MAX  = 1000;

export async function GET(req: NextRequest) {
  const auth = verifyStaffOrAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const hotels = await db.hotelRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(hotels);
  } catch (err) {
    console.error('[GET /api/hotels]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const {
      name, phone, email, city, hotelName,
      checkIn, checkOut, rooms, adults,
      children, stars, payment, notes,
    } = body as Record<string, unknown>;

    if (typeof name !== 'string' || !name.trim() || name.trim().length > NAME_MAX) {
      return NextResponse.json({ error: 'الاسم غير صالح' }, { status: 400 });
    }
    if (typeof phone !== 'string' || !PHONE_RE.test(phone.trim())) {
      return NextResponse.json({ error: 'رقم الهاتف غير صالح' }, { status: 400 });
    }
    if (email !== undefined && email !== null && email !== '') {
      if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
        return NextResponse.json({ error: 'الإيميل غير صالح' }, { status: 400 });
      }
    }
    if (typeof city !== 'string' || !city.trim() || city.trim().length > CITY_MAX) {
      return NextResponse.json({ error: 'المدينة غير صالحة' }, { status: 400 });
    }
    if (hotelName !== undefined && hotelName !== null && hotelName !== '') {
      if (typeof hotelName !== 'string' || hotelName.trim().length > NAME_MAX) {
        return NextResponse.json({ error: 'اسم الفندق غير صالح' }, { status: 400 });
      }
    }
    if (typeof checkIn !== 'string' || !DATE_RE.test(checkIn)) {
      return NextResponse.json({ error: 'تاريخ الوصول غير صالح' }, { status: 400 });
    }
    if (typeof checkOut !== 'string' || !DATE_RE.test(checkOut)) {
      return NextResponse.json({ error: 'تاريخ المغادرة غير صالح' }, { status: 400 });
    }
    if (checkOut <= checkIn) {
      return NextResponse.json({ error: 'تاريخ المغادرة يجب أن يكون بعد الوصول' }, { status: 400 });
    }
    if (stars !== undefined && stars !== null && stars !== '') {
      if (typeof stars !== 'string' || !STARS_RE.test(stars)) {
        return NextResponse.json({ error: 'عدد النجوم غير صالح' }, { status: 400 });
      }
    }
    if (payment !== undefined && typeof payment === 'string' && !PAYMENT_RE.test(payment)) {
      return NextResponse.json({ error: 'طريقة الدفع غير صالحة' }, { status: 400 });
    }
    if (notes !== undefined && typeof notes === 'string' && notes.length > NOTES_MAX) {
      return NextResponse.json({ error: 'الملاحظات طويلة جداً' }, { status: 400 });
    }

    const roomsNum    = rooms    !== undefined ? Number(rooms)    : 1;
    const adultsNum   = adults   !== undefined ? Number(adults)   : 2;
    const childrenNum = children !== undefined ? Number(children) : 0;

    if (isNaN(roomsNum)    || roomsNum    < 1 || roomsNum    > 9) {
      return NextResponse.json({ error: 'عدد الغرف غير صالح' }, { status: 400 });
    }
    if (isNaN(adultsNum)   || adultsNum   < 1 || adultsNum   > 9) {
      return NextResponse.json({ error: 'عدد البالغين غير صالح' }, { status: 400 });
    }
    if (isNaN(childrenNum) || childrenNum < 0 || childrenNum > 9) {
      return NextResponse.json({ error: 'عدد الأطفال غير صالح' }, { status: 400 });
    }

    const hotel = await db.hotelRequest.create({
      data: {
        name:      name.trim(),
        phone:     phone.trim(),
        email:     typeof email     === 'string' && email.trim()     ? email.trim()     : null,
        city:      city.trim(),
        hotelName: typeof hotelName === 'string' && hotelName.trim() ? hotelName.trim() : null,
        checkIn,
        checkOut,
        rooms:     roomsNum,
        adults:    adultsNum,
        children:  childrenNum,
        stars:     typeof stars === 'string' && stars ? stars : null,
        payment:   typeof payment === 'string' && payment ? payment : 'cash',
        notes:     typeof notes   === 'string' && notes.trim() ? notes.trim() : null,
      },
    });

    return NextResponse.json(hotel, { status: 201 });
  } catch (err) {
    console.error('[POST /api/hotels]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}