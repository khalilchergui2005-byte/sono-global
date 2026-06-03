import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestType = searchParams.get('requestType');
    const requestId = searchParams.get('requestId');
    if (!requestType || !requestId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const where: Record<string, string> = {};
    if (requestType === 'flight') where.flightRequestId = requestId;
    else if (requestType === 'hotel') where.hotelRequestId = requestId;
    else if (requestType === 'consultation') where.consultationId = requestId;
    else if (requestType === 'service') where.serviceRequestId = requestId;

    const messages = await db.requestMessage.findMany({ where, orderBy: { createdAt: 'asc' } });
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestType, requestId, senderType, senderId, senderName, body: msgBody } = body;
    if (!requestType || !requestId || !senderType || !senderId || !senderName || !msgBody)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const message = await db.requestMessage.create({
      data: {
        requestType,
        senderType,
        senderId,
        senderName,
        body: msgBody,
        ...(requestType === 'flight'        && { flightRequestId: requestId }),
        ...(requestType === 'hotel'         && { hotelRequestId: requestId }),
        ...(requestType === 'consultation'  && { consultationId: requestId }),
        ...(requestType === 'service'       && { serviceRequestId: requestId }),
      },
    });
    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}