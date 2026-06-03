import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusToken, AMADEUS_BASE } from '@/lib/amadeus';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin      = searchParams.get('origin')?.toUpperCase();
    const destination = searchParams.get('destination')?.toUpperCase();
    const date        = searchParams.get('date');
    const adults      = searchParams.get('adults') || '1';
    const cabin       = searchParams.get('cabin') || 'ECONOMY';

    if (!origin || !destination || !date) {
      return NextResponse.json(
        { error: 'origin, destination, date requis' },
        { status: 400 }
      );
    }

    const [token, markupRow] = await Promise.all([
      getAmadeusToken(),
      db.siteConfig.findUnique({ where: { key: 'amadeus_markup_percent' } }),
    ]);

    const markup = 1 + (parseFloat(markupRow?.value || '0') / 100);

    const url = new URL(`${AMADEUS_BASE}/v2/shopping/flight-offers`);
    url.searchParams.set('originLocationCode', origin);
    url.searchParams.set('destinationLocationCode', destination);
    url.searchParams.set('departureDate', date);
    url.searchParams.set('adults', adults);
    url.searchParams.set('travelClass', cabin);
    url.searchParams.set('max', '10');
    url.searchParams.set('currencyCode', 'DZD');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = (await res.json()) as Record<string, unknown>;
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
            arrival: { iataCode: string; at: string };
          }>;
        }>;
        price: { total: string };
        travelerPricings?: Array<{
          fareDetailsBySegment?: Array<{ cabin?: string }>;
        }>;
      }>;
    };

    const offers = (raw.data || []).map((offer) => {
      const seg      = offer.itineraries[0].segments[0];
      const priceRaw = parseFloat(offer.price.total);
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
        price:        Math.ceil(priceRaw * markup),
        currency:     'DZD',
      };
    });

    return NextResponse.json({ flights: offers, count: offers.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}