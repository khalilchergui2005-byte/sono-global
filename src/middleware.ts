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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = process.env.JWT_SECRET!;

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

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (PUBLIC_ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

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

  const onboardingDone = req.cookies.get('onboarding_complete')?.value;
  if (onboardingDone !== 'true') {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/onboarding';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*'],
};