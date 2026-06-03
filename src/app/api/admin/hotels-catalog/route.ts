import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const hotels = await db.hotel.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(hotels);
  } catch (e) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, city, country, stars, pricePerNight, currency, source, images, amenities, description, visible } = body;
    if (!name || !city || !pricePerNight)
      return NextResponse.json({ error: 'name, city, pricePerNight required' }, { status: 400 });
    const hotel = await db.hotel.create({ data: {
      name, city,
      country: country ?? 'Algeria',
      stars: stars ? Number(stars) : 3,
      pricePerNight: Number(pricePerNight),
      currency: currency ?? 'DZD',
      source: source ?? 'direct',
      images: images ?? [],
      amenities: amenities ?? [],
      description: description ?? '',
      visible: visible !== undefined ? Boolean(visible) : true,
    }});
    return NextResponse.json(hotel, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
