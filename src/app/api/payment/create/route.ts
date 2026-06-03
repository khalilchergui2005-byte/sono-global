import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

interface CreatePaymentBody {
  packageId: string;
  paymentMethod: string;
  passengers?: number;
  guestName?: string;
  guestPhone?: string;
}

interface ChargilyCheckoutResponse {
  id: string;
  checkout_url: string;
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization') || '');
    let userId: string | null = null;

    if (token) {
      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json(
          { error: '\u0637\u0644\u0628 \u063a\u064a\u0631 \u0645\u0635\u0631\u062d \u0628\u0647' },
          { status: 401 }
        );
      }
      userId = payload.userId;
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: '\u0628\u064a\u0627\u0646\u0627\u062a \u063a\u064a\u0631 \u0635\u0627\u0644\u062d\u0629' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: '\u0628\u064a\u0627\u0646\u0627\u062a \u063a\u064a\u0631 \u0635\u0627\u0644\u062d\u0629' },
        { status: 400 }
      );
    }

    const {
      packageId,
      paymentMethod,
      passengers,
      guestName,
      guestPhone,
    } = body as CreatePaymentBody;

    if (!userId) {
      if (!guestName || typeof guestName !== 'string' || guestName.trim().length === 0) {
        return NextResponse.json(
          { error: '\u0627\u0644\u0627\u0633\u0645 \u0645\u0637\u0644\u0648\u0628' },
          { status: 400 }
        );
      }
      if (!guestPhone || typeof guestPhone !== 'string' || guestPhone.trim().length === 0) {
        return NextResponse.json(
          { error: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0645\u0637\u0644\u0648\u0628' },
          { status: 400 }
        );
      }
    }

    if (!packageId || typeof packageId !== 'string' || packageId.trim().length === 0) {
      return NextResponse.json(
        { error: 'packageId \u0645\u0637\u0644\u0648\u0628' },
        { status: 400 }
      );
    }

    const paymentConfig = await db.siteConfig.findUnique({
      where: { key: 'payment_methods' },
      select: { value: true },
    });

    let allowedMethods: string[] = ['cash'];
    if (paymentConfig?.value) {
      try {
        const parsed: unknown = JSON.parse(paymentConfig.value);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
          allowedMethods = parsed as string[];
        }
      } catch {
        allowedMethods = ['cash'];
      }
    }

    if (!paymentMethod || !allowedMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: '\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639 \u063a\u064a\u0631 \u0645\u0642\u0628\u0648\u0644\u0629' },
        { status: 400 }
      );
    }

    if (passengers !== undefined) {
      if (
        typeof passengers !== 'number' ||
        !Number.isInteger(passengers) ||
        passengers < 1 ||
        passengers > 20
      ) {
        return NextResponse.json(
          { error: '\u0639\u062f\u062f \u0627\u0644\u0645\u0633\u0627\u0641\u0631\u064a\u0646 \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0628\u064a\u0646 1 \u0648 20' },
          { status: 400 }
        );
      }
    }

    const pkg = await db.package.findUnique({
      where: { id: packageId.trim() },
      select: {
        id: true,
        title: true,
        price: true,
        visible: true,
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: '\u0627\u0644\u0628\u0627\u0642\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629' },
        { status: 404 }
      );
    }

    if (!pkg.visible) {
      return NextResponse.json(
        { error: '\u0627\u0644\u0628\u0627\u0642\u0629 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d\u0629 \u062d\u0627\u0644\u064a\u0627' },
        { status: 400 }
      );
    }

    const passengersCount = passengers ?? 1;
    const total = pkg.price * passengersCount;

    const siteSettings = await db.siteSettings.findUnique({
      where: { id: 'main' },
      select: { currency: true },
    });

    const currency = siteSettings?.currency ?? 'DZD';

    if (paymentMethod === 'chargily') {
      const apiKeyRecord = await db.siteConfig.findUnique({
        where: { key: 'chargily_api_key' },
        select: { value: true },
      });

      if (!apiKeyRecord?.value || apiKeyRecord.value.trim().length === 0) {
        return NextResponse.json(
          { error: '\u062e\u062f\u0645\u0629 \u0627\u0644\u062f\u0641\u0639 \u063a\u064a\u0631 \u0645\u0641\u0639\u0644\u0629 \u062d\u0627\u0644\u064a\u0627' },
          { status: 503 }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

      const booking = await db.booking.create({
        data: {
          userId: userId,
          guestName: userId ? null : (guestName ?? null),
          guestPhone: userId ? null : (guestPhone ?? null),
          packageId: pkg.id,
          total,
          paymentMethod: 'chargily',
          paymentStatus: 'pending',
          status: 'PENDING',
        },
        select: { id: true },
      });

      let chargilyData: ChargilyCheckoutResponse;

      try {
        const chargilyRes = await fetch('https://pay.chargily.net/api/v2/checkouts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKeyRecord.value.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            currency: currency.toLowerCase(),
            success_url: `${baseUrl}/checkout/success?bookingId=${booking.id}`,
            failure_url: `${baseUrl}/checkout/failure?bookingId=${booking.id}`,
            metadata: {
              booking_id: booking.id,
              package_id: pkg.id,
              user_id: userId ?? 'guest',
              package_title: pkg.title,
            },
          }),
        });

        if (!chargilyRes.ok) {
          await db.booking.delete({ where: { id: booking.id } });
          const errText = await chargilyRes.text();
          console.error('Chargily error:', errText);
          return NextResponse.json(
            { error: '\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u062c\u0644\u0633\u0629 \u0627\u0644\u062f\u0641\u0639. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627.' },
            { status: 502 }
          );
        }

        chargilyData = (await chargilyRes.json()) as ChargilyCheckoutResponse;
      } catch (fetchError) {
        await db.booking.delete({ where: { id: booking.id } });
        console.error('Chargily fetch error:', fetchError);
        return NextResponse.json(
          { error: '\u062a\u0639\u0630\u0631 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u062e\u062f\u0645\u0629 \u0627\u0644\u062f\u0641\u0639. \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627.' },
          { status: 502 }
        );
      }

      await db.booking.update({
        where: { id: booking.id },
        data: { chargilyCheckoutId: chargilyData.id },
      });

      return NextResponse.json({
        bookingId: booking.id,
        checkoutUrl: chargilyData.checkout_url,
      });
    }

    const booking = await db.booking.create({
      data: {
        userId: userId,
        guestName: userId ? null : (guestName ?? null),
        guestPhone: userId ? null : (guestPhone ?? null),
        packageId: pkg.id,
        total,
        paymentMethod,
        paymentStatus: 'pending_offline',
        status: 'PENDING',
      },
      select: { id: true },
    });

    return NextResponse.json({ bookingId: booking.id }, { status: 201 });

  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
