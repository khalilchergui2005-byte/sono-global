import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hotel = await db.hotelRequest.findUnique({ where: { id } });
    if (!hotel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(hotel);
  } catch (e) {
    console.error('[hotels/id GET]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.hotelRequest.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const { status } = await req.json();
    const updated = await db.hotelRequest.update({
      where: { id },
      data: { status, isRead: true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error('[hotels/id PUT]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}