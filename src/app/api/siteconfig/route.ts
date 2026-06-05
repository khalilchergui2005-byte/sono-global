import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

const DEFAULTS: Record<string, string> = {
  amadeus_client_id:       '',
  amadeus_client_secret:   '',
  amadeus_markup_percent:  '10',
  eur_to_dzd_rate:         '260',
  chargily_api_key:        '',
  chargily_webhook_secret: '',
  payment_methods:         'cash,cib,bank_transfer,ccp',
  smtp_host:               'smtp.gmail.com',
  smtp_port:               '587',
  smtp_user:               '',
  smtp_pass:               '',
  smtp_from_name:          'Sono Global Travel',
  admin_email:             '',
};

const ALLOWED_KEYS = new Set(Object.keys(DEFAULTS));

async function isOnboardingComplete(): Promise<boolean> {
  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: 'main' },
      select: { agencyName: true, phonePrimary: true, email: true },
    });
    return (
      !!settings &&
      !!settings.agencyName?.trim() &&
      !!settings.phonePrimary?.trim() &&
      !!settings.email?.trim()
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const rows = await db.siteConfig.findMany();
    const result: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) {
      if (ALLOWED_KEYS.has(row.key)) {
        result[row.key] = row.value;
      }
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/siteconfig]', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const complete = await isOnboardingComplete();
  if (complete) {
    const auth = verifyAdmin(req);
    if (auth instanceof NextResponse) return auth;
  }

  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const entries = Object.entries(body as Record<string, unknown>).filter(
      ([key]) => ALLOWED_KEYS.has(key)
    );

    if (entries.length === 0) {
      return NextResponse.json({ error: 'لا توجد keys صالحة' }, { status: 400 });
    }

    const updates = await Promise.all(
      entries.map(([key, value]) =>
        db.siteConfig.upsert({
          where:  { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    return NextResponse.json({ saved: updates.length });
  } catch (error) {
    console.error('[POST /api/siteconfig]', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}