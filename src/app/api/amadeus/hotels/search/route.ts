import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusToken, AMADEUS_BASE } from '@/lib/amadeus';
import { db } from '@/lib/db';

// ── Rate Limiting ──────────────────────────────────────────────
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX    = 20;
const WINDOW = 60 * 60 * 1000;

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now    = Date.now();
  const record = attempts.get(ip);
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW });
    return true;
  }
  if (record.count >= MAX) return false;
  record.count += 1;
  return true;
}

// ── Validation ─────────────────────────────────────────────────
const CITY_RE = /^[A-Z]{3}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ── Interfaces ─────────────────────────────────────────────────
interface HotelListItem {
  hotelId: string;
}

interface HotelOffer {
  id: string;
  room?: { typeEstimated?: { category?: string } };
  price: { total: string; currency?: string };
}

interface HotelOfferItem {
  hotel: {
    hotelId: string;
    name: string;
    address?: { cityName?: string };
  };
  offers?: HotelOffer[];
}

// ── GET /api/amadeus/hotels/search ─────────────────────────────
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getIP(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'طلبات كثيرة – حاول لاحقاً' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    const cityCode = searchParams.get('cityCode')?.toUpperCase() ?? '';
    const checkIn  = searchParams.get('checkIn')  ?? '';
    const checkOut = searchParams.get('checkOut') ?? '';
    const adults   = searchParams.get('adults')   ?? '1';
    const rooms    = searchParams.get('rooms')    ?? '1';

    if (!CITY_RE.test(cityCode)) {
      return NextResponse.json({ error: 'رمز المدينة غير صالح' }, { status: 400 });
    }
    if (!DATE_RE.test(checkIn)) {
      return NextResponse.json({ error: 'تاريخ الوصول غير صالح' }, { status: 400 });
    }
    if (!DATE_RE.test(checkOut)) {
      return NextResponse.json({ error: 'تاريخ المغادرة غير صالح' }, { status: 400 });
    }
    if (checkOut <= checkIn) {
      return NextResponse.json({ error: 'تاريخ المغادرة يجب أن يكون بعد الوصول' }, { status: 400 });
    }

    const adultsNum = parseInt(adults, 10);
    if (isNaN(adultsNum) || adultsNum < 1 || adultsNum > 9) {
      return NextResponse.json({ error: 'عدد المسافرين غير صالح' }, { status: 400 });
    }

    const roomsNum = parseInt(rooms, 10);
    if (isNaN(roomsNum) || roomsNum < 1 || roomsNum > 9) {
      return NextResponse.json({ error: 'عدد الغرف غير صالح' }, { status: 400 });
    }

    const [token, markupRow, rateRow] = await Promise.all([
      getAmadeusToken(),
      db.siteConfig.findUnique({ where: { key: 'amadeus_markup_percent' } }),
      db.siteConfig.findUnique({ where: { key: 'eur_to_dzd_rate' } }),
    ]);

    const markup   = 1 + (parseFloat(markupRow?.value ?? '0') / 100);
    const eurToDzd = parseFloat(rateRow?.value ?? '260');

    const listUrl = new URL(`${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city`);
    listUrl.searchParams.set('cityCode',    cityCode);
    listUrl.searchParams.set('radius',      '20');
    listUrl.searchParams.set('radiusUnit',  'KM');
    listUrl.searchParams.set('hotelSource', 'ALL');

    const listRes = await fetch(listUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!listRes.ok) {
      const err = (await listRes.json()) as Record<string, unknown>;
      console.error('[amadeus/hotels/search GET] list error', err);
      return NextResponse.json({ error: err }, { status: listRes.status });
    }

    const listData = (await listRes.json()) as { data?: HotelListItem[] };
    const hotelIds = (listData.data ?? [])
      .slice(0, 20)
      .map((h) => h.hotelId)
      .join(',');

    if (!hotelIds) {
      return NextResponse.json({ hotels: [], count: 0 });
    }

    const offersUrl = new URL(`${AMADEUS_BASE}/v3/shopping/hotel-offers`);
    offersUrl.searchParams.set('hotelIds',     hotelIds);
    offersUrl.searchParams.set('checkInDate',  checkIn);
    offersUrl.searchParams.set('checkOutDate', checkOut);
    offersUrl.searchParams.set('adults',       String(adultsNum));
    offersUrl.searchParams.set('roomQuantity', String(roomsNum));
    offersUrl.searchParams.set('bestRateOnly', 'true');
    // لا currencyCode — Amadeus يرجع EUR افتراضياً وهذا صحيح

    const offersRes = await fetch(offersUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!offersRes.ok) {
      const err = (await offersRes.json()) as Record<string, unknown>;
      console.error('[amadeus/hotels/search GET] offers error', err);
      return NextResponse.json({ error: err }, { status: offersRes.status });
    }

    const offersData = (await offersRes.json()) as { data?: HotelOfferItem[] };

    const hotels = (offersData.data ?? []).map((item) => {
      const offer      = item.offers?.[0];
      const priceEur   = parseFloat(offer?.price?.total ?? '0');
      const priceDzd   = Math.ceil(priceEur * eurToDzd * markup);
      return {
        hotelId:  item.hotel.hotelId,
        name:     item.hotel.name,
        city:     item.hotel.address?.cityName ?? cityCode,
        offerId:  offer?.id,
        room:     offer?.room?.typeEstimated?.category ?? 'ROOM',
        price:    priceDzd,
        currency: 'DZD',
      };
    });

    return NextResponse.json({ hotels, count: hotels.length });
  } catch (err) {
    console.error('[amadeus/hotels/search GET]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}