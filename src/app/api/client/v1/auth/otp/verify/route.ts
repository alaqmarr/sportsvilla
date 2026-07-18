import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { mobile, code } = await request.json();
    
    const cleanMobile = mobile ? mobile.replace('+91', '').replace(/[^0-9]/g, '') : '';
    logger.info('OTP Verify Request Initiated', { mobile: cleanMobile });

    if (!cleanMobile || !code) {
      logger.warn('OTP Verify failed: missing fields', { mobile: cleanMobile });
      return NextResponse.json({ error: "Mobile and code are required" }, { status: 400 });
    }

    const otpRecord = await prisma.otp.findUnique({
      where: { mobile: cleanMobile }
    });

    if (!otpRecord) {
      logger.warn('OTP Verify failed: no record found', { mobile: cleanMobile });
      return NextResponse.json({ error: "No OTP request found for this number" }, { status: 400 });
    }

    if (otpRecord.code !== code) {
      logger.warn('OTP Verify failed: invalid code', { mobile: cleanMobile, provided: code });
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
    }

    if (new Date() > otpRecord.expiresAt) {
      logger.warn('OTP Verify failed: expired', { mobile: cleanMobile });
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Delete the OTP record so it can't be reused
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    // Find or create the Member record
    let member = await prisma.member.findFirst({
      where: { mobile: cleanMobile }
    });

    if (!member) {
      member = await prisma.member.create({
        data: {
          mobile: cleanMobile,
          name: "New Member",
          loyaltyPoints: 0
        }
      });
    }

    // Mint a custom JWT
    const uid = cleanMobile.startsWith('+') ? cleanMobile : `+91${cleanMobile}`;
    const customToken = jwt.sign(
      { uid, memberId: member.id },
      process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev',
      { expiresIn: '30d' }
    );

    logger.info('OTP Verify Successful', { memberId: member.id });

    return NextResponse.json({ 
      success: true, 
      customToken, // We keep the property name 'customToken' so the frontend API contract doesn't break
      memberId: member.id,
      member 
    });
  } catch (error: any) {
    logger.error('OTP Verify failed internally', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
