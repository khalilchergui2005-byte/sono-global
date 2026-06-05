import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ── Rate Limiting ──────────────────────────────────────────────
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX    = 5;
const WINDOW = 60 * 60 * 1000;

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now    = Date.now();
  const record = attempts.get(ip);
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW });
    return true;
  }
  if (record.count >= MAX) return false;
  record.count += 1;
  return true;
}

// ── Email Regex ────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ── POST /api/newsletter ───────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getIP(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'طلبات كثيرة — حاول لاحقاً' },
      { status: 429 }
    );
  }

  try {
    const body: unknown = await req.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      !('email' in body) ||
      typeof (body as Record<string, unknown>).email !== 'string'
    ) {
      return NextResponse.json({ error: 'بريد غير صالح' }, { status: 400 });
    }

    const email = ((body as Record<string, unknown>).email as string)
      .trim()
      .toLowerCase();

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'بريد غير صالح' }, { status: 400 });
    }

    await db.newsletter.upsert({
      where:  { email },
      update: {},
      create: { email },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[newsletter POST]', err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}