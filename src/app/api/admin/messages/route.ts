import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyStaffOrAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = verifyStaffOrAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const messages = await db.contactMessage.findMany({
      where: status === 'unread' ? { isRead: false }
           : status === 'read'   ? { isRead: true  }
           : {},
      orderBy: { createdAt: 'desc' },
    });

    const total  = await db.contactMessage.count();
    const unread = await db.contactMessage.count({ where: { isRead: false } });
    const today  = await db.contactMessage.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });

    return NextResponse.json({ messages, stats: { total, unread, today } });
  } catch (e) {
    console.error('[messages GET]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = verifyStaffOrAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await db.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[messages DELETE]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}