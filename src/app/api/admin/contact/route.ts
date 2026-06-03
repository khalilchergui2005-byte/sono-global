import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.siteSettings.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        id: 'main',
        phones: [], emails: [], whatsapp: [],
        facebook: [], instagram: [], tiktok: [], youtube: [],
        address: '', mapsUrl: '', workingHours: '',
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const clean = (arr: any[]) =>
      Array.isArray(arr) ? arr.map(String).map(s => s.trim()).filter(Boolean) : [];

    const phones    = clean(body.phones);
    const emails    = clean(body.emails);
    const whatsapp  = clean(body.whatsapp);
    const facebook  = clean(body.facebook);
    const instagram = clean(body.instagram);
    const tiktok    = clean(body.tiktok);
    const youtube   = clean(body.youtube);
    const address      = typeof body.address      === 'string' ? body.address.trim()      : '';
    const mapsUrl      = typeof body.mapsUrl      === 'string' ? body.mapsUrl.trim()      : '';
    const workingHours = typeof body.workingHours === 'string' ? body.workingHours.trim() : '';

    // ✅ upsert بدلاً من deleteMany+create — يحافظ على consultationPrice وagencyName وبقية حقول الإعدادات
    const updated = await db.siteSettings.upsert({
      where: { id: 'main' },
      update: {
        phones, emails, whatsapp, facebook, instagram, tiktok, youtube,
        address, mapsUrl, workingHours,
      },
      create: {
        id: 'main',
        phones, emails, whatsapp, facebook, instagram, tiktok, youtube,
        address, mapsUrl, workingHours,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'خطأ في الحفظ' }, { status: 500 });
  }
}