import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
  return title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '')
    || `service-${Date.now()}`;
}

export async function GET() {
  try {
    const services = await db.service.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('GET services error:', error);
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'عنوان الخدمة مطلوب' }, { status: 400 });
    }

    const slug = makeSlug(body.title);

    // تحقق من عدم تكرار الـ slug
    const existing = await db.service.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const service = await db.service.create({
      data: {
        title:        body.title.trim(),
        slug:         finalSlug,
        icon:         body.icon         || '✈️',
        color:        body.color        || '#0A7EB5',
        image:        body.image        || '',
        imageLabel:   body.imageLabel   || '',
        description:  body.description  || '',
        details:      Array.isArray(body.details)      ? body.details.filter(Boolean)      : [],
        destinations: Array.isArray(body.destinations) ? body.destinations.filter(Boolean) : [],
        visible:      body.visible ?? true,
        order:        body.order  ?? 0,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('POST service error:', error);
    return NextResponse.json({ error: 'خطأ في الحفظ' }, { status: 500 });
  }
}