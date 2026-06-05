import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyStaffOrAdmin } from '@/lib/auth';

const PHONE_RE    = /^[\d\s\+\-\(\)]{7,20}$/;
const DATE_RE     = /^\d{4}-\d{2}-\d{2}$/;
const TRIP_RE     = /^(one-way|round|multi)$/;
const CABIN_RE    = /^(economy|premium_economy|business|first)$/i;
const PAYMENT_RE  = /^(cash|card|transfer)$/;
const NAME_MAX    = 100;
const NOTES_MAX   = 1000;

export async function GET(req: NextRequest) {
  const auth = verifyStaffOrAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const flights = await db.flightRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(flights);
  } catch (err) {
    console.error('[GET /api/flights]', err);
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
      name, phone, email, from, to,
      departDate, returnDate, tripType,
      cabin, adults, children, infants,
      payment, notes,
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
    if (typeof from !== 'string' || !from.trim()) {
      return NextResponse.json({ error: 'مطار المغادرة مطلوب' }, { status: 400 });
    }
    if (typeof to !== 'string' || !to.trim()) {
      return NextResponse.json({ error: 'مطار الوصول مطلوب' }, { status: 400 });
    }
    if (typeof departDate !== 'string' || !DATE_RE.test(departDate)) {
      return NextResponse.json({ error: 'تاريخ المغادرة غير صالح' }, { status: 400 });
    }
    if (returnDate !== undefined && returnDate !== null && returnDate !== '') {
      if (typeof returnDate !== 'string' || !DATE_RE.test(returnDate)) {
        return NextResponse.json({ error: 'تاريخ العودة غير صالح' }, { status: 400 });
      }
    }
    if (tripType !== undefined && typeof tripType === 'string' && !TRIP_RE.test(tripType)) {
      return NextResponse.json({ error: 'نوع الرحلة غير صالح' }, { status: 400 });
    }
    if (cabin !== undefined && typeof cabin === 'string' && !CABIN_RE.test(cabin)) {
      return NextResponse.json({ error: 'درجة السفر غير صالحة' }, { status: 400 });
    }
    if (payment !== undefined && typeof payment === 'string' && !PAYMENT_RE.test(payment)) {
      return NextResponse.json({ error: 'طريقة الدفع غير صالحة' }, { status: 400 });
    }

    const adultsNum   = adults   !== undefined ? Number(adults)   : 1;
    const childrenNum = children !== undefined ? Number(children) : 0;
    const infantsNum  = infants  !== undefined ? Number(infants)  : 0;

    if (isNaN(adultsNum)   || adultsNum   < 1 || adultsNum   > 9) {
      return NextResponse.json({ error: 'عدد البالغين غير صالح' }, { status: 400 });
    }
    if (isNaN(childrenNum) || childrenNum < 0 || childrenNum > 9) {
      return NextResponse.json({ error: 'عدد الأطفال غير صالح' }, { status: 400 });
    }
    if (isNaN(infantsNum)  || infantsNum  < 0 || infantsNum  > 9) {
      return NextResponse.json({ error: 'عدد الرضع غير صالح' }, { status: 400 });
    }
    if (notes !== undefined && typeof notes === 'string' && notes.length > NOTES_MAX) {
      return NextResponse.json({ error: 'الملاحظات طويلة جداً' }, { status: 400 });
    }

    const flight = await db.flightRequest.create({
      data: {
        name:       name.trim(),
        phone:      phone.trim(),
        email:      typeof email === 'string' && email.trim() ? email.trim() : null,
        from:       (from as string).trim(),
        to:         (to as string).trim(),
        departDate,
        returnDate: typeof returnDate === 'string' && returnDate ? returnDate : null,
        tripType:   typeof tripType === 'string' && tripType ? tripType : 'round',
        cabin:      typeof cabin    === 'string' && cabin    ? cabin.toLowerCase() : 'economy',
        adults:     adultsNum,
        children:   childrenNum,
        infants:    infantsNum,
        payment:    typeof payment === 'string' && payment ? payment : 'cash',
        notes:      typeof notes   === 'string' && notes.trim() ? notes.trim() : null,
      },
    });

    return NextResponse.json(flight, { status: 201 });
  } catch (err) {
    console.error('[POST /api/flights]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}