import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, getTokenFromHeader, verifyStaffOrAdmin } from '@/lib/auth';

const REQUEST_TYPES = ['flight', 'hotel', 'consultation', 'service'] as const;
type RequestType = typeof REQUEST_TYPES[number];

const MSG_MAX = 2000;
const NAME_MAX = 100;

export async function GET(req: NextRequest) {
  const auth = verifyStaffOrAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const requestType = searchParams.get('requestType') as RequestType | null;
    const requestId   = searchParams.get('requestId');

    if (!requestType || !REQUEST_TYPES.includes(requestType)) {
      return NextResponse.json({ error: 'requestType غير صالح' }, { status: 400 });
    }
    if (!requestId || typeof requestId !== 'string') {
      return NextResponse.json({ error: 'requestId مطلوب' }, { status: 400 });
    }

    const where: Record<string, string> = {};
    if (requestType === 'flight')       where.flightRequestId  = requestId;
    else if (requestType === 'hotel')   where.hotelRequestId   = requestId;
    else if (requestType === 'consultation') where.consultationId = requestId;
    else if (requestType === 'service') where.serviceRequestId = requestId;

    const messages = await db.requestMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(messages);
  } catch (err) {
    console.error('[GET /api/request-messages]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Staff/Admin يرسلون عبر cookie — Customers عبر Authorization header
  const staffAuth = verifyStaffOrAdmin(req);
  const isStaff   = !(staffAuth instanceof NextResponse);

  if (!isStaff) {
    // تحقق من token الزبون
    const token = getTokenFromHeader(req.headers.get('authorization') ?? '');
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
  }

  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { requestType, requestId, senderType, senderId, senderName, body: msgBody } =
      body as Record<string, unknown>;

    if (typeof requestType !== 'string' || !REQUEST_TYPES.includes(requestType as RequestType)) {
      return NextResponse.json({ error: 'requestType غير صالح' }, { status: 400 });
    }
    if (typeof requestId !== 'string' || !requestId.trim()) {
      return NextResponse.json({ error: 'requestId مطلوب' }, { status: 400 });
    }
    if (typeof senderType !== 'string' || !['customer', 'staff', 'admin'].includes(senderType)) {
      return NextResponse.json({ error: 'senderType غير صالح' }, { status: 400 });
    }
    if (typeof senderId !== 'string' || !senderId.trim()) {
      return NextResponse.json({ error: 'senderId مطلوب' }, { status: 400 });
    }
    if (typeof senderName !== 'string' || !senderName.trim() || senderName.trim().length > NAME_MAX) {
      return NextResponse.json({ error: 'senderName غير صالح' }, { status: 400 });
    }
    if (typeof msgBody !== 'string' || !msgBody.trim() || msgBody.trim().length > MSG_MAX) {
      return NextResponse.json({ error: 'الرسالة غير صالحة أو تجاوزت الحد' }, { status: 400 });
    }

    const message = await db.requestMessage.create({
      data: {
        requestType:  requestType as string,
        senderType:   senderType,
        senderId:     senderId.trim(),
        senderName:   senderName.trim(),
        body:         msgBody.trim(),
        ...(requestType === 'flight'       && { flightRequestId:  requestId.trim() }),
        ...(requestType === 'hotel'        && { hotelRequestId:   requestId.trim() }),
        ...(requestType === 'consultation' && { consultationId:   requestId.trim() }),
        ...(requestType === 'service'      && { serviceRequestId: requestId.trim() }),
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error('[POST /api/request-messages]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}