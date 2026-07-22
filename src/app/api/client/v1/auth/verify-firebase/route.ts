import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { jsonResponse } from '@/lib/api-logger';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev';

export async function POST(request: Request) {
  console.log(`[API] POST /api/client/v1/auth/verify-firebase called`);
  try {
    const { token } = await request.json();

    if (!token) {
      return jsonResponse({ error: 'Missing token' }, { status: 400 });
    }

    // 1. Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      return jsonResponse({ error: 'No phone number linked to token' }, { status: 400 });
    }

    // 2. Format phone number (remove +91)
    let cleanMobile = phoneNumber.replace(/^\+91/, "");
    if (cleanMobile.startsWith("+")) cleanMobile = cleanMobile.substring(1);

    // 3. Find User
    const member = await prisma.member.findFirst({ where: { mobile: cleanMobile } });
    
    if (!member) {
      return jsonResponse({ error: 'User not registered' }, { status: 404 });
    }

    // 4. Generate Internal JWT
    const sessionToken = jwt.sign(
      { uid: phoneNumber, memberId: member.id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return jsonResponse({ success: true, token: sessionToken, member });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/auth/verify-firebase ->`, error);
    console.error('Firebase Verify Error:', error);
    return jsonResponse({ error: 'Invalid Firebase token' }, { status: 401 });
  }
}
