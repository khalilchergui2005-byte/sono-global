import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { title, country, duration, price, description, image, tag, visible } = await req.json();

    if (!title || !country || !duration || !price) {
      return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 });
    }

    const pkg = await db.package.create({
      data: { title, country, duration, price, description, image, tag, visible },
    });

    return NextResponse.json({ success: true, id: pkg.id });
  } catch (_error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const packages = await db.package.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(packages);
  } catch (_error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
