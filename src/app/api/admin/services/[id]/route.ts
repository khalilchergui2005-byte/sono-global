import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const service = await db.service.update({
      where: { id },
      data: {
        title:        body.title?.trim()      || undefined,
        icon:         body.icon               || undefined,
        color:        body.color              || undefined,
        image:        body.image              ?? undefined,
        imageLabel:   body.imageLabel         ?? undefined,
        description:  body.description        ?? undefined,
        details:      Array.isArray(body.details)      ? body.details.filter(Boolean)      : undefined,
        destinations: Array.isArray(body.destinations) ? body.destinations.filter(Boolean) : undefined,
        visible:      body.visible            ?? undefined,
        order:        body.order              ?? undefined,
      },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'خطأ في الحذف' }, { status: 500 });
  }
}
