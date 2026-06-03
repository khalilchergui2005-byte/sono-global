import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/onboarding'];
const PUBLIC_STAFF_PATHS = ['/staff/login'];

async function verify(token: string, secret: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload as { role?: string };
  } catch {
    return null;
  }
}

async function checkOnboardingComplete(req: NextRequest): Promise<boolean> {
  try {
    const url = new URL('/api/admin/onboarding-status', req.nextUrl.origin);
    const res = await fetch(url.toString());
    if (!res.ok) return false;
    const data = (await res.json()) as { complete?: boolean };
    return data.complete === true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = process.env.JWT_SECRET!;

  // ══════════════════════════════════
  // Staff routes
  // ══════════════════════════════════
  if (pathname.startsWith('/staff')) {
    if (PUBLIC_STAFF_PATHS.some(p => pathname.startsWith(p))) {
      return NextResponse.next();
    }
    const staffCookie = req.cookies.get('staff_token')?.value;
    if (!staffCookie) {
      const url = req.nextUrl.clone();
      url.pathname = '/staff/login';
      return NextResponse.redirect(url);
    }
    const staffPayload = await verify(staffCookie, secret);
    if (!staffPayload || staffPayload.role !== 'STAFF') {
      const url = req.nextUrl.clone();
      url.pathname = '/staff/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ══════════════════════════════════
  // Non-admin routes — pass through
  // ══════════════════════════════════
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // ══════════════════════════════════
  // Public admin paths — no auth needed
  // ══════════════════════════════════
  if (PUBLIC_ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ══════════════════════════════════
  // Admin auth check
  // ══════════════════════════════════
  const token = req.cookies.get('admin_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  const payload = await verify(token, secret);
  if (!payload || payload.role !== 'ADMIN') {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // ══════════════════════════════════
  // O2 — Onboarding check
  // إذا الإدمين مسجّل لكن لم يكمل الإعداد
  // نوجّهه لـ onboarding إلا إذا كان فيه
  // ══════════════════════════════════
  const isOnboardingPath = pathname.startsWith('/admin/onboarding');
  if (!isOnboardingPath) {
    const complete = await checkOnboardingComplete(req);
    if (!complete) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/onboarding';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*'],
};