import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const packages = await db.package.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(packages);
  } catch (error) {
    console.error('[GET /api/admin/packages]', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await req.json();
    if (
      typeof body !== 'object' ||
      body === null ||
      !('title' in body) ||
      !('country' in body) ||
      !('duration' in body) ||
      !('price' in body)
    ) {
      return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 });
    }

    const {
      title,
      country,
      duration,
      price,
      description,
      image,
      tag,
      visible,
    } = body as {
      title: string;
      country: string;
      duration: string;
      price: number;
      description?: string;
      image?: string;
      tag?: string;
      visible?: boolean;
    };

    const pkg = await db.package.create({
      data: { title, country, duration, price, description, image, tag, visible },
    });

    return NextResponse.json({ success: true, id: pkg.id });
  } catch (error) {
    console.error('[POST /api/admin/packages]', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}