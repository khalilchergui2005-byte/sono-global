import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusToken } from '@/lib/amadeus';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await getAmadeusToken();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[amadeus/token GET]', err);
    return NextResponse.json({ ok: false, error: 'فشل الاتصال بـ Amadeus' }, { status: 500 });
  }
}