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
const IATA_RE  = /^[A-Z]{3}$/;
const DATE_RE  = /^\d{4}-\d{2}-\d{2}$/;
const CABIN_RE = /^(ECONOMY|PREMIUM_ECONOMY|BUSINESS|FIRST)$/;

// ── GET /api/amadeus/flights/search ────────────────────────────
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getIP(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'طلبات كثيرة — حاول لاحقاً' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    const origin      = searchParams.get('origin')?.toUpperCase() ?? '';
    const destination = searchParams.get('destination')?.toUpperCase() ?? '';
    const date        = searchParams.get('date') ?? '';
    const adults      = searchParams.get('adults') ?? '1';
    const cabin       = searchParams.get('cabin')?.toUpperCase() ?? 'ECONOMY';

    if (!IATA_RE.test(origin)) {
      return NextResponse.json({ error: 'رمز المطار غير صالح (origin)' }, { status: 400 });
    }
    if (!IATA_RE.test(destination)) {
      return NextResponse.json({ error: 'رمز المطار غير صالح (destination)' }, { status: 400 });
    }
    if (!DATE_RE.test(date)) {
      return NextResponse.json({ error: 'تاريخ غير صالح' }, { status: 400 });
    }
    if (!CABIN_RE.test(cabin)) {
      return NextResponse.json({ error: 'درجة السفر غير صالحة' }, { status: 400 });
    }

    const adultsNum = parseInt(adults, 10);
    if (isNaN(adultsNum) || adultsNum < 1 || adultsNum > 9) {
      return NextResponse.json({ error: 'عدد المسافرين غير صالح' }, { status: 400 });
    }

    const [token, markupRow, rateRow] = await Promise.all([
      getAmadeusToken(),
      db.siteConfig.findUnique({ where: { key: 'amadeus_markup_percent' } }),
      db.siteConfig.findUnique({ where: { key: 'eur_to_dzd_rate' } }),
    ]);

    const markup     = 1 + (parseFloat(markupRow?.value ?? '0') / 100);
    const eurToDzd   = parseFloat(rateRow?.value ?? '260');

    const url = new URL(`${AMADEUS_BASE}/v2/shopping/flight-offers`);
    url.searchParams.set('originLocationCode',      origin);
    url.searchParams.set('destinationLocationCode', destination);
    url.searchParams.set('departureDate',           date);
    url.searchParams.set('adults',                  String(adultsNum));
    url.searchParams.set('travelClass',             cabin);
    url.searchParams.set('max',                     '10');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = (await res.json()) as Record<string, unknown>;
      console.error('[amadeus/flights/search GET] Amadeus error', err);
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const raw = (await res.json()) as {
      data?: Array<{
        id: string;
        itineraries: Array<{
          duration: string;
          segments: Array<{
            carrierCode: string;
            number: string;
            departure: { iataCode: string; at: string };
            arrival:   { iataCode: string; at: string };
          }>;
        }>;
        price: { total: string; currency: string };
        travelerPricings?: Array<{
          fareDetailsBySegment?: Array<{ cabin?: string }>;
        }>;
      }>;
    };

    const offers = (raw.data ?? []).map((offer) => {
      const seg        = offer.itineraries[0].segments[0];
      const priceEur   = parseFloat(offer.price.total);
      const priceDzd   = Math.ceil(priceEur * eurToDzd * markup);
      return {
        id:           offer.id,
        airline:      seg.carrierCode,
        flightNumber: seg.carrierCode + seg.number,
        from:         seg.departure.iataCode,
        to:           seg.arrival.iataCode,
        departure:    seg.departure.at,
        arrival:      seg.arrival.at,
        duration:     offer.itineraries[0].duration,
        cabin:        offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ?? cabin,
        priceEur:     priceEur,
        price:        priceDzd,
        currency:     'DZD',
      };
    });

    return NextResponse.json({ flights: offers, count: offers.length });
  } catch (err) {
    console.error('[amadeus/flights/search GET]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}