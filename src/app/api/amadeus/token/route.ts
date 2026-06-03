import { NextResponse } from 'next/server';
import { getAmadeusToken } from '@/lib/amadeus';

export async function GET() {
  try {
    const token = await getAmadeusToken();
    return NextResponse.json({ ok: true, token: token.slice(0, 20) + '...' });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}