import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyStaffOrAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = verifyStaffOrAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const consultations = await db.consultation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(consultations);
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}