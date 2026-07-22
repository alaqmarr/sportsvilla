import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';
import { jsonResponse } from '@/lib/api-logger';

export async function POST(request: Request) {
  console.log(`[API] POST /api/client/v1/auth/otp/verify called`);
  try {
    const { mobile, code } = await request.json();
    
    const cleanMobile = mobile ? mobile.replace('+91', '').replace(/[^0-9]/g, '') : '';
    logger.info('OTP Verify Request Initiated', { mobile: cleanMobile });

    if (!cleanMobile || !code) {
      logger.warn('OTP Verify failed: missing fields', { mobile: cleanMobile });
      return jsonResponse({ error: "Mobile and code are required" }, { status: 400 });
    }

    const otpRecord = await prisma.otp.findUnique({
      where: { mobile: cleanMobile }
    });

    if (!otpRecord) {
      logger.warn('OTP Verify failed: no record found', { mobile: cleanMobile });
      return jsonResponse({ error: "No OTP request found for this number" }, { status: 400 });
    }

    // Check if locked
    if (otpRecord.lockedUntil && new Date() < otpRecord.lockedUntil) {
      const waitMinutes = Math.ceil((otpRecord.lockedUntil.getTime() - Date.now()) / 60000);
      return jsonResponse({ error: `Too many attempts. Try again in ${waitMinutes} minute(s).` }, { status: 429 });
    }

    if (otpRecord.code !== code) {
      // Increment attempts
      const newAttempts = otpRecord.attempts + 1;
      const updateData: any = { attempts: newAttempts };
      if (newAttempts >= 5) {
        // Lock for 15 minutes
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await prisma.otp.update({ where: { id: otpRecord.id }, data: updateData });
      
      logger.warn('OTP Verify failed: invalid code', { mobile: cleanMobile, attempts: newAttempts });
      return jsonResponse({ error: newAttempts >= 5 ? 'Too many failed attempts. Locked for 15 minutes.' : 'Invalid OTP code' }, { status: newAttempts >= 5 ? 429 : 400 });
    }

    if (new Date() > otpRecord.expiresAt) {
      logger.warn('OTP Verify failed: expired', { mobile: cleanMobile });
      return jsonResponse({ error: "OTP has expired" }, { status: 400 });
    }

    // Delete the OTP record so it can't be reused
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    // Find the Member record
    const member = await prisma.member.findFirst({
      where: { mobile: cleanMobile }
    });

    if (!member) {
      return jsonResponse({ error: "User does not exist" }, { status: 400 });
    }

    // Mint a custom JWT
    const uid = cleanMobile.startsWith('+') ? cleanMobile : `+91${cleanMobile}`;
    if (!process.env.NEXTAUTH_SECRET) {
      return jsonResponse({ error: 'Server configuration error' }, { status: 500 });
    }
    const customToken = jwt.sign(
      { uid, memberId: member.id },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '30d' }
    );

    logger.info('OTP Verify Successful', { memberId: member.id });

    return jsonResponse({ 
      success: true, 
      customToken,
      memberId: member.id
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/auth/otp/verify ->`, error);
    logger.error('OTP Verify failed internally', { error: error.message, stack: error.stack });
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
