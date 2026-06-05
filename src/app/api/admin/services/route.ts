import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

function makeSlug(title: string): string {
  const map: Record<string, string> = {
    'فيزا دراسية': 'visa-etude',
    'فيزا سياحية': 'visa-tourisme',
    'عقود العمل': 'contrats-travail',
    'عمرة وحج': 'omra-hajj',
    'حجز الطيران': 'reservation-vol',
    'حجز الفنادق': 'reservation-hotel',
    'استشارات الهجرة': 'immigration',
    'رحلات منظمة': 'voyages-organises',
  };
  if (map[title.trim()]) return map[title.trim()];
  return (
    title
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '') || `service-${Date.now()}`
  );
}

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const services = await db.service.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('[GET /api/admin/services]', error);
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
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
      typeof (body as { title: unknown }).title !== 'string' ||
      !(body as { title: string }).title.trim()
    ) {
      return NextResponse.json({ error: 'عنوان الخدمة مطلوب' }, { status: 400 });
    }

    const b = body as {
      title: string;
      icon?: string;
      color?: string;
      image?: string;
      imageLabel?: string;
      description?: string;
      details?: string[];
      destinations?: string[];
      visible?: boolean;
      order?: number;
    };

    const slug = makeSlug(b.title);
    const existing = await db.service.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const details: string[] = Array.isArray(b.details)
      ? (b.details as unknown[]).filter((x): x is string => typeof x === 'string')
      : [];

    const destinations: string[] = Array.isArray(b.destinations)
      ? (b.destinations as unknown[]).filter((x): x is string => typeof x === 'string')
      : [];

    const service = await db.service.create({
      data: {
        title:        b.title.trim(),
        slug:         finalSlug,
        icon:         b.icon        ?? '✈️',
        color:        b.color       ?? '#0A7EB5',
        image:        b.image       ?? '',
        imageLabel:   b.imageLabel  ?? '',
        description:  b.description ?? '',
        details,
        destinations,
        visible:      b.visible ?? true,
        order:        b.order   ?? 0,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('[POST /api/admin/services]', error);
    return NextResponse.json({ error: 'خطأ في الحفظ' }, { status: 500 });
  }
}