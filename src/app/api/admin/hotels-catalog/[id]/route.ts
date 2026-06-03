import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const hotel = await db.hotel.update({
      where: { id },
      data: {
        ...(body.name          !== undefined && { name: body.name }),
        ...(body.city          !== undefined && { city: body.city }),
        ...(body.country       !== undefined && { country: body.country }),
        ...(body.stars         !== undefined && { stars: Number(body.stars) }),
        ...(body.pricePerNight !== undefined && { pricePerNight: Number(body.pricePerNight) }),
        ...(body.currency      !== undefined && { currency: body.currency }),
        ...(body.source        !== undefined && { source: body.source }),
        ...(body.images        !== undefined && { images: body.images }),
        ...(body.amenities     !== undefined && { amenities: body.amenities }),
        ...(body.description   !== undefined && { description: body.description }),
        ...(body.visible       !== undefined && { visible: Boolean(body.visible) }),
      },
    });
    return NextResponse.json(hotel);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.hotel.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}