import { NextRequest, NextResponse } from 'next/server';
import { verifyStaffOrAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'image/avif': 'avif',
};

export async function POST(req: NextRequest) {
  const auth = verifyStaffOrAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'لا يوجد ملف' }, { status: 400 });
    }

    const f = file as File;

    const ext = ALLOWED_TYPES[f.type];
    if (!ext) {
      return NextResponse.json({ error: 'نوع الملف غير مسموح — صور فقط' }, { status: 400 });
    }

    if (f.size > MAX_SIZE) {
      return NextResponse.json({ error: 'حجم الملف يتجاوز 5MB' }, { status: 400 });
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await f.arrayBuffer();

    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/images/${filename}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': f.type,
          'x-upsert': 'true',
        },
        body: bytes,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error('[upload] Supabase error:', err);
      return NextResponse.json({ error: 'فشل رفع الملف' }, { status: 500 });
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/images/${filename}`;
    return NextResponse.json({ url: publicUrl });

  } catch (e) {
    console.error('[upload] error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}