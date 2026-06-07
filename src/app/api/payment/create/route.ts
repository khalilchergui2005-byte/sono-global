import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

interface CreatePaymentBody {
  packageId:      string;
  paymentMethod:  string;
  passengers?:    number;
  guestName?:     string;
  guestPhone?:    string;
  guestEmail?:    string;
  lockedPrice?:   number;
  priceLockedAt?: string;
}

interface ChargilyCheckoutResponse {
  id:           string;
  checkout_url: string;
}

const LOCK_DURATION_MS = 10 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization') || '');
    let userId: string | null = null;

    if (token) {
      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json({ error: 'طلب غير مصرح به' }, { status: 401 });
      }
      userId = payload.userId;
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const {
      packageId,
      paymentMethod,
      passengers,
      guestName,
      guestPhone,
      guestEmail,
      lockedPrice,
      priceLockedAt,
    } = body as CreatePaymentBody;

    if (!userId) {
      if (!guestName || typeof guestName !== 'string' || guestName.trim().length === 0) {
        return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 });
      }
      if (!guestPhone || typeof guestPhone !== 'string' || guestPhone.trim().length === 0) {
        return NextResponse.json({ error: 'رقم الهاتف مطلوب' }, { status: 400 });
      }
    }

    if (guestEmail !== undefined && guestEmail !== null && guestEmail !== '') {
      if (typeof guestEmail !== 'string' || !EMAIL_RE.test(guestEmail.trim())) {
        return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 });
      }
    }

    if (!packageId || typeof packageId !== 'string' || packageId.trim().length === 0) {
      return NextResponse.json({ error: 'packageId مطلوب' }, { status: 400 });
    }

    const paymentConfig = await db.siteConfig.findUnique({
      where: { key: 'payment_methods' },
      select: { value: true },
    });

    let allowedMethods: string[] = ['cash'];
    if (paymentConfig?.value && paymentConfig.value.trim().length > 0) {
      allowedMethods = paymentConfig.value
        .split(',')
        .map((m: string) => m.trim())
        .filter(Boolean);
    }

    if (!paymentMethod || !allowedMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'طريقة الدفع غير مقبولة' }, { status: 400 });
    }

    if (passengers !== undefined) {
      if (
        typeof passengers !== 'number' ||
        !Number.isInteger(passengers) ||
        passengers < 1 ||
        passengers > 20
      ) {
        return NextResponse.json(
          { error: 'عدد المسافرين يجب أن يكون بين 1 و 20' },
          { status: 400 }
        );
      }
    }

    const pkg = await db.package.findUnique({
      where: { id: packageId.trim() },
      select: { id: true, title: true, price: true, visible: true },
    });

    if (!pkg) {
      return NextResponse.json({ error: 'الباقة غير موجودة' }, { status: 404 });
    }

    if (!pkg.visible) {
      return NextResponse.json({ error: 'الباقة غير متاحة حالياً' }, { status: 400 });
    }

    let finalPrice = pkg.price;

    if (lockedPrice !== undefined && priceLockedAt !== undefined) {
      const lockedAt = new Date(priceLockedAt);
      const now      = new Date();

      if (isNaN(lockedAt.getTime())) {
        return NextResponse.json({ error: 'بيانات السعر المقفل غير صالحة' }, { status: 400 });
      }

      if (now.getTime() - lockedAt.getTime() > LOCK_DURATION_MS) {
        return NextResponse.json(
          { error: 'انتهت صلاحية السعر — يرجى تحديث الصفحة والمحاولة مجدداً', code: 'PRICE_LOCK_EXPIRED' },
          { status: 409 }
        );
      }

      if (typeof lockedPrice !== 'number' || lockedPrice !== pkg.price) {
        return NextResponse.json(
          { error: 'تغير سعر الباقة — يرجى تحديث الصفحة والمحاولة مجدداً', code: 'PRICE_CHANGED' },
          { status: 409 }
        );
      }

      finalPrice = lockedPrice;
    }

    const passengersCount = passengers ?? 1;
    const total           = finalPrice * passengersCount;

    const siteSettings = await db.siteSettings.findUnique({
      where: { id: 'main' },
      select: { currency: true },
    });

    const currency = siteSettings?.currency ?? 'DZD';

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl || baseUrl.trim().length === 0) {
      console.error('NEXT_PUBLIC_BASE_URL is not set');
      return NextResponse.json(
        { error: 'خدمة الدفع غير مهيأة — تواصل مع الدعم' },
        { status: 503 }
      );
    }

    if (paymentMethod === 'chargily') {
      const apiKeyRecord = await db.siteConfig.findUnique({
        where: { key: 'chargily_api_key' },
        select: { value: true },
      });

      if (!apiKeyRecord?.value || apiKeyRecord.value.trim().length === 0) {
        return NextResponse.json({ error: 'خدمة الدفع غير مفعلة حالياً' }, { status: 503 });
      }

      const booking = await db.booking.create({
        data: {
          userId:        userId,
          guestName:     userId ? null : (guestName ?? null),
          guestPhone:    userId ? null : (guestPhone ?? null),
          guestEmail:    userId ? null : (guestEmail?.trim() || null),
          packageId:     pkg.id,
          total,
          paymentMethod: 'chargily',
          paymentStatus: 'pending',
          status:        'PENDING',
          lockedPrice:   finalPrice,
          priceLockedAt: priceLockedAt ? new Date(priceLockedAt) : new Date(),
        },
        select: { id: true },
      });

      let chargilyData: ChargilyCheckoutResponse;

      try {
        const chargilyRes = await fetch('https://pay.chargily.net/api/v2/checkouts', {
          method: 'POST',
          headers: {
            Authorization:  `Bearer ${apiKeyRecord.value.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount:      total,
            currency:    currency.toLowerCase(),
            success_url: `${baseUrl.trim()}/checkout/success?bookingId=${booking.id}`,
            failure_url: `${baseUrl.trim()}/checkout/failure?bookingId=${booking.id}`,
            metadata: {
              booking_id:    booking.id,
              package_id:    pkg.id,
              user_id:       userId ?? 'guest',
              package_title: pkg.title,
            },
          }),
        });

        if (!chargilyRes.ok) {
          await db.booking.delete({ where: { id: booking.id } });
          const errText = await chargilyRes.text();
          console.error('Chargily error:', errText);
          return NextResponse.json(
            { error: 'فشل إنشاء جلسة الدفع. حاول مجدداً.' },
            { status: 502 }
          );
        }

        chargilyData = (await chargilyRes.json()) as ChargilyCheckoutResponse;
      } catch (fetchError) {
        await db.booking.delete({ where: { id: booking.id } });
        console.error('Chargily fetch error:', fetchError);
        return NextResponse.json(
          { error: 'تعذر الاتصال بخدمة الدفع. حاول مجدداً.' },
          { status: 502 }
        );
      }

      await db.booking.update({
        where: { id: booking.id },
        data:  { chargilyCheckoutId: chargilyData.id },
      });

      return NextResponse.json({
        bookingId:   booking.id,
        checkoutUrl: chargilyData.checkout_url,
      });
    }

    const booking = await db.booking.create({
      data: {
        userId:        userId,
        guestName:     userId ? null : (guestName ?? null),
        guestPhone:    userId ? null : (guestPhone ?? null),
        guestEmail:    userId ? null : (guestEmail?.trim() || null),
        packageId:     pkg.id,
        total,
        paymentMethod,
        paymentStatus: 'pending_offline',
        status:        'PENDING',
        lockedPrice:   finalPrice,
        priceLockedAt: priceLockedAt ? new Date(priceLockedAt) : new Date(),
      },
      select: { id: true },
    });

    return NextResponse.json({ bookingId: booking.id }, { status: 201 });

  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}