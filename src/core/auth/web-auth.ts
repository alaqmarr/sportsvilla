import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = 'sv_session';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Sets the sv_session HttpOnly cookie on a NextResponse.
 * The cookie contains the JWT token and is immune to XSS.
 */
export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
}

/**
 * Clears the sv_session cookie by setting it to empty with immediate expiry.
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}

/**
 * Reads the sv_session cookie from a request, verifies the JWT,
 * and returns the member and decoded token. Returns null if invalid.
 */
export async function getSessionFromCookie(request: Request): Promise<{
  member: any;
  decodedToken: any;
} | null> {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...val] = c.trim().split('=');
        return [key, val.join('=')];
      })
    );

    const token = cookies[COOKIE_NAME];
    if (!token) return null;

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) return null;

    const decoded = jwt.verify(token, secret) as any;
    if (!decoded) return null;

    let member = null;
    if (decoded.memberId) {
      member = await prisma.member.findUnique({
        where: { id: decoded.memberId },
      });
    }

    if (!member && decoded.uid) {
      const cleanMobile = decoded.uid.replace(/^\+91/, '');
      member = await prisma.member.findFirst({
        where: { mobile: cleanMobile },
      });
    }

    if (!member) return null;

    return { member, decodedToken: decoded };
  } catch {
    return null;
  }
}

/**
 * Mints a 30-day JWT for a member, suitable for both cookie and bearer token usage.
 */
export function mintWebToken(mobile: string, memberId: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET is not configured');

  const uid = mobile.startsWith('+') ? mobile : `+91${mobile}`;
  return jwt.sign({ uid, memberId }, secret, { expiresIn: '30d' });
}
