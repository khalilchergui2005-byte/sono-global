import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: 'main' },
      select: { agencyName: true, phonePrimary: true, email: true },
    });

    const complete =
      !!settings &&
      !!settings.agencyName?.trim() &&
      !!settings.phonePrimary?.trim() &&
      !!settings.email?.trim();

    return NextResponse.json({ complete });
  } catch {
    return NextResponse.json({ complete: false });
  }
}