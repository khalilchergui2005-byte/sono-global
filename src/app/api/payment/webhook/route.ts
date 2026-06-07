import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHmac, timingSafeEqual } from 'crypto';
import { sendPaymentConfirmation } from '@/lib/mailer';

interface ChargilyCheckoutPaidEvent {
  id:   string;
  type: string;
  data: {
    object: {
      id: string;
      metadata?: {
        booking_id?: string;
      };
    };
  };
}

export async function POST(req: NextRequest) {
  let rawBody: string;

  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: 'Failed to read body' }, { status: 400 });
  }

  let webhookSecret: string;

  try {
    const secretRecord = await db.siteConfig.findUnique({
      where:  { key: 'chargily_webhook_secret' },
      select: { value: true },
    });

    if (!secretRecord?.value || secretRecord.value.trim().length === 0) {
      console.error('Webhook secret not configured');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    webhookSecret = secretRecord.value.trim();
  } catch (dbError) {
    console.error('DB error reading webhook secret:', dbError);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const signatureHeader = req.headers.get('signature');

  if (!signatureHeader) {
    console.error('Missing signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  try {
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const receivedBuffer = Buffer.from(signatureHeader,   'utf8');

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch (sigError) {
    console.error('Signature verification error:', sigError);
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
  }

  let event: ChargilyCheckoutPaidEvent;

  try {
    event = JSON.parse(rawBody) as ChargilyCheckoutPaidEvent;
  } catch {
    console.error('Failed to parse webhook body');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (event.type === 'checkout.paid') {
    const bookingId         = event.data?.object?.metadata?.booking_id;
    const chargilyPaymentId = event.data?.object?.id;

    if (!bookingId || !chargilyPaymentId) {
      console.error('Missing booking_id or payment id in webhook metadata');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    try {
      // Atomic update — يمنع Race Condition
      // updateMany مع where paymentStatus != paid يضمن التنفيذ مرة واحدة فقط
      const result = await db.booking.updateMany({
        where: {
          id:            bookingId,
          paymentStatus: { not: 'paid' },
        },
        data: {
          paymentStatus:    'paid',
          chargilyPaymentId,
          status:           'CONFIRMED',
        },
      });

      // count === 0 يعني سبق تحديثه — نتجاهل بصمت
      if (result.count === 0) {
        return NextResponse.json({ received: true }, { status: 200 });
      }

      console.log(`Booking ${bookingId} confirmed via Chargily payment ${chargilyPaymentId}`);

      // جلب بيانات الحجز لإرسال الإيميل
      const booking = await db.booking.findUnique({
        where:  { id: bookingId },
        select: {
          id:         true,
          total:      true,
          guestName:  true,
          guestEmail: true,
          user:       { select: { name: true, email: true } },
          package:    { select: { title: true } },
        },
      });

      if (!booking) {
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const customerName  = booking.user?.name  ?? booking.guestName  ?? 'عميل';
      const customerEmail = booking.user?.email ?? booking.guestEmail ?? '';
      const packageTitle  = booking.package?.title ?? 'باقة سياحية';

      void sendPaymentConfirmation({
        customerName,
        customerEmail,
        packageTitle,
        total:     booking.total,
        bookingId: booking.id,
      });

    } catch (updateError) {
      console.error('Failed to update booking:', updateError);
      return NextResponse.json({ received: true }, { status: 200 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}