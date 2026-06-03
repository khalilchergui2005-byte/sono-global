import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
  onboardingComplete?: boolean;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as JWTPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function verifyAdmin(req: NextRequest): JWTPayload | NextResponse {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }
  return payload;
}

export function verifyStaffOrAdmin(
  req: NextRequest,
): JWTPayload | NextResponse {
  const adminToken = req.cookies.get('admin_token')?.value;
  if (adminToken) {
    const payload = verifyToken(adminToken);
    if (payload?.role === 'ADMIN') return payload;
  }
  const staffToken = req.cookies.get('staff_token')?.value;
  if (staffToken) {
    const payload = verifyToken(staffToken);
    if (payload?.role === 'STAFF') return payload;
  }
  return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
}
export function getTokenFromHeader(authHeader: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}