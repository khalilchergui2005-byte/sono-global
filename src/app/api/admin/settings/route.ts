import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const s = await db.siteSettings.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        id: 'main',
        logoUrl: '',
        agencyName: '',
        agencyDescription: '',
        phonePrimary: '',
        phoneWhatsapp: '',
        email: '',
        address: '',
        mapsUrl: '',
        workingHours: '',
        phones: [],
        emails: [],
        whatsapp: [],
        facebook: [],
        instagram: [],
        tiktok: [],
        youtube: [],
        consultationPrice: '2500',
        currency: 'DZD',
      },
    });
    return NextResponse.json(s);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const clean = (arr: unknown) =>
      Array.isArray(arr) ? arr.map(String).map((s) => s.trim()).filter(Boolean) : [];

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
        id: 'main',
        logoUrl:           b.logoUrl           ?? '',
        agencyName:        b.agencyName        ?? '',
        agencyDescription: b.agencyDescription ?? '',
        phonePrimary:      b.phonePrimary      ?? '',
        phoneWhatsapp:     b.phoneWhatsapp     ?? '',
        email:             b.email             ?? '',
        address:           b.address           ?? '',
        mapsUrl:           b.mapsUrl           ?? '',
        workingHours:      b.workingHours      ?? '',
        phones:            clean(b.phones),
        emails:            clean(b.emails),
        whatsapp:          clean(b.whatsapp),
        facebook:          clean(b.facebook),
        instagram:         clean(b.instagram),
        tiktok:            clean(b.tiktok),
        youtube:           clean(b.youtube),
        consultationPrice: b.consultationPrice ?? '2500',
        currency:          b.currency          ?? 'DZD',
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}