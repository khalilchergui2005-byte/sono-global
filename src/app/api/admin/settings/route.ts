import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const s = await db.siteSettings.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        id:                'main',
        logoUrl:           '',
        agencyName:        '',
        agencyDescription: '',
        phonePrimary:      '',
        phoneWhatsapp:     '',
        email:             '',
        address:           '',
        mapsUrl:           '',
        workingHours:      '',
        phones:            [],
        emails:            [],
        whatsapp:          [],
        facebook:          [],
        instagram:         [],
        tiktok:            [],
        youtube:           [],
        consultationPrice: '2500',
        currency:          'DZD',
      },
    });
    return NextResponse.json(s);
  } catch (error) {
    console.error('[GET /api/admin/settings]', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body: unknown = await req.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const b = body as Record<string, unknown>;

    const clean = (arr: unknown): string[] =>
      Array.isArray(arr)
        ? arr.map(String).map(s => s.trim()).filter(Boolean)
        : [];

    const updateData: Record<string, unknown> = {};

    if (b.logoUrl           !== undefined) updateData.logoUrl           = b.logoUrl;
    if (b.agencyName        !== undefined) updateData.agencyName        = b.agencyName;
    if (b.agencyDescription !== undefined) updateData.agencyDescription = b.agencyDescription;
    if (b.phonePrimary      !== undefined) updateData.phonePrimary      = b.phonePrimary;
    if (b.phoneWhatsapp     !== undefined) updateData.phoneWhatsapp     = b.phoneWhatsapp;
    if (b.email             !== undefined) updateData.email             = b.email;
    if (b.address           !== undefined) updateData.address           = b.address;
    if (b.mapsUrl           !== undefined) updateData.mapsUrl           = b.mapsUrl;
    if (b.workingHours      !== undefined) updateData.workingHours      = b.workingHours;
    if (b.consultationPrice !== undefined) updateData.consultationPrice = b.consultationPrice;
    if (b.currency          !== undefined) updateData.currency          = b.currency;
    if (b.phones            !== undefined) updateData.phones            = clean(b.phones);
    if (b.emails            !== undefined) updateData.emails            = clean(b.emails);
    if (b.whatsapp          !== undefined) updateData.whatsapp          = clean(b.whatsapp);
    if (b.facebook          !== undefined) updateData.facebook          = clean(b.facebook);
    if (b.instagram         !== undefined) updateData.instagram         = clean(b.instagram);
    if (b.tiktok            !== undefined) updateData.tiktok            = clean(b.tiktok);
    if (b.youtube           !== undefined) updateData.youtube           = clean(b.youtube);

    const updated = await db.siteSettings.upsert({
      where: { id: 'main' },
      update: updateData,
      create: {
        id:                'main',
        logoUrl:           typeof b.logoUrl           === 'string' ? b.logoUrl           : '',
        agencyName:        typeof b.agencyName        === 'string' ? b.agencyName        : '',
        agencyDescription: typeof b.agencyDescription === 'string' ? b.agencyDescription : '',
        phonePrimary:      typeof b.phonePrimary      === 'string' ? b.phonePrimary      : '',
        phoneWhatsapp:     typeof b.phoneWhatsapp     === 'string' ? b.phoneWhatsapp     : '',
        email:             typeof b.email             === 'string' ? b.email             : '',
        address:           typeof b.address           === 'string' ? b.address           : '',
        mapsUrl:           typeof b.mapsUrl           === 'string' ? b.mapsUrl           : '',
        workingHours:      typeof b.workingHours      === 'string' ? b.workingHours      : '',
        phones:            clean(b.phones),
        emails:            clean(b.emails),
        whatsapp:          clean(b.whatsapp),
        facebook:          clean(b.facebook),
        instagram:         clean(b.instagram),
        tiktok:            clean(b.tiktok),
        youtube:           clean(b.youtube),
        consultationPrice: typeof b.consultationPrice === 'string' ? b.consultationPrice : '2500',
        currency:          typeof b.currency          === 'string' ? b.currency          : 'DZD',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[POST /api/admin/settings]', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}