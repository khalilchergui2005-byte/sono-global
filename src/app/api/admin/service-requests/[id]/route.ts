import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, assignedTo, internalNote, isRead } = body;

  const existing = await db.serviceRequest.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await db.serviceRequest.update({
    where: { id },
    data: {
      ...(status !== undefined && { status }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(internalNote !== undefined && { internalNote }),
      ...(isRead !== undefined && { isRead }),
    },
    select: {
      id: true,
      name: true,
      phone: true,
      serviceSlug: true,
      serviceTitle: true,
      message: true,
      status: true,
      isRead: true,
      assignedTo: true,
      internalNote: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(_req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const existing = await db.serviceRequest.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.serviceRequest.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
