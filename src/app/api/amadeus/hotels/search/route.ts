import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusToken, AMADEUS_BASE } from '@/lib/amadeus';
import { db } from '@/lib/db';

interface HotelListItem {
  hotelId: string;
}

interface HotelOffer {
  id: string;
  room?: { typeEstimated?: { category?: string } };
  price: { total: string };
}

interface HotelOfferItem {
  hotel: {
    hotelId: string;
    name: string;
    address?: { cityName?: string };
  };
  offers?: HotelOffer[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityCode = searchParams.get('cityCode')?.toUpperCase();
    const checkIn  = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults   = searchParams.get('adults') || '1';
    const rooms    = searchParams.get('rooms')  || '1';

    if (!cityCode || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'cityCode, checkIn, checkOut requis' },
        { status: 400 }
      );
    }

    const [token, markupRow] = await Promise.all([
      getAmadeusToken(),
      db.siteConfig.findUnique({ where: { key: 'amadeus_markup_percent' } }),
    ]);

    const markup = 1 + (parseFloat(markupRow?.value || '0') / 100);

    const listUrl = new URL(`${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city`);
    listUrl.searchParams.set('cityCode', cityCode);
    listUrl.searchParams.set('radius', '20');
    listUrl.searchParams.set('radiusUnit', 'KM');
    listUrl.searchParams.set('hotelSource', 'ALL');

    const listRes = await fetch(listUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!listRes.ok) {
      const err = (await listRes.json()) as Record<string, unknown>;
      return NextResponse.json({ error: err }, { status: listRes.status });
    }

    const listData = (await listRes.json()) as { data?: HotelListItem[] };
    const hotelIds = (listData.data || [])
      .slice(0, 20)
      .map((h) => h.hotelId)
      .join(',');

    if (!hotelIds) {
      return NextResponse.json({ hotels: [], count: 0 });
    }

    const offersUrl = new URL(`${AMADEUS_BASE}/v3/shopping/hotel-offers`);
    offersUrl.searchParams.set('hotelIds', hotelIds);
    offersUrl.searchParams.set('checkInDate', checkIn);
    offersUrl.searchParams.set('checkOutDate', checkOut);
    offersUrl.searchParams.set('adults', adults);
    offersUrl.searchParams.set('roomQuantity', rooms);
    offersUrl.searchParams.set('currencyCode', 'DZD');
    offersUrl.searchParams.set('bestRateOnly', 'true');

    const offersRes = await fetch(offersUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!offersRes.ok) {
      const err = (await offersRes.json()) as Record<string, unknown>;
      return NextResponse.json({ error: err }, { status: offersRes.status });
    }

    const offersData = (await offersRes.json()) as { data?: HotelOfferItem[] };

    const hotels = (offersData.data || []).map((item) => {
      const offer    = item.offers?.[0];
      const price    = parseFloat(offer?.price?.total || '0');
      return {
        hotelId:  item.hotel.hotelId,
        name:     item.hotel.name,
        city:     item.hotel.address?.cityName ?? cityCode,
        offerId:  offer?.id,
        room:     offer?.room?.typeEstimated?.category ?? 'ROOM',
        price:    Math.ceil(price * markup),
        currency: 'DZD',
      };
    });

    return NextResponse.json({ hotels, count: hotels.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}