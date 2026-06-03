import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pkg = await db.package.findUnique({ where: { id } });
  if (!pkg) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });
  return NextResponse.json(pkg);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { title, country, duration, price, description, image, tag, visible, startDate, endDate } = body;

    const pkg = await db.package.update({
      where: { id },
      data: {
        title,
        country,
        duration,
        price: typeof price === 'string' ? parseFloat(price) : price,
        description,
        image,
        tag,
        visible,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(pkg);
  } catch (error) {
    console.error('PUT /api/admin/packages/[id]', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { title, country, duration, price, description, image, tag, visible, startDate, endDate } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (country !== undefined) data.country = country;
    if (duration !== undefined) data.duration = duration;
    if (price !== undefined) data.price = typeof price === 'string' ? parseFloat(price) : price;
    if (description !== undefined) data.description = description;
    if (image !== undefined) data.image = image;
    if (tag !== undefined) data.tag = tag;
    if (visible !== undefined) data.visible = visible;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;

    const pkg = await db.package.update({ where: { id }, data });
    return NextResponse.json(pkg);
  } catch (error) {
    console.error('PATCH /api/admin/packages/[id]', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.package.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/packages/[id]', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
