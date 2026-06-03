import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.siteSettings.upsert({
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
      select: {
        agencyName:        true,
        agencyDescription: true,
        logoUrl:           true,
        phonePrimary:      true,
        phoneWhatsapp:     true,
        email:             true,
        address:           true,
        mapsUrl:           true,
        workingHours:      true,
        phones:            true,
        emails:            true,
        whatsapp:          true,
        facebook:          true,
        instagram:         true,
        tiktok:            true,
        youtube:           true,
        consultationPrice: true,
        currency:          true,
      },
    });
    return NextResponse.json(settings);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
