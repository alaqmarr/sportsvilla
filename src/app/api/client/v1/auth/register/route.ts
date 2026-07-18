import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { mobile, code, name, email, dob } = await request.json();
    
    const cleanMobile = mobile ? mobile.replace('+91', '').replace(/[^0-9]/g, '') : '';
    logger.info('Register Request Initiated', { mobile: cleanMobile });

    if (!cleanMobile || !code || !name) {
      logger.warn('Register failed: missing fields', { mobile: cleanMobile });
      return NextResponse.json({ error: "Mobile, code, and name are required" }, { status: 400 });
    }

    const otpRecord = await prisma.otp.findUnique({
      where: { mobile: cleanMobile }
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "No OTP request found for this number" }, { status: 400 });
    }

    if (otpRecord.code !== code) {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 });
    }

    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // Delete the OTP record so it can't be reused
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    // Check if user already exists
    let member = await prisma.member.findFirst({
      where: { mobile: cleanMobile }
    });

    if (member) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Create the Member record
    member = await prisma.member.create({
      data: {
        mobile: cleanMobile,
        name: name,
        email: email || null,
        dateOfBirth: dob ? new Date(dob) : null,
        loyaltyPoints: 0
      }
    });

    // Mint a custom JWT
    const uid = cleanMobile.startsWith('+') ? cleanMobile : `+91${cleanMobile}`;
    const customToken = jwt.sign(
      { uid, memberId: member.id },
      process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev',
      { expiresIn: '30d' }
    );

    logger.info('Register Successful', { memberId: member.id });

    return NextResponse.json({ 
      success: true, 
      customToken, 
      memberId: member.id,
      member 
    });
  } catch (error: any) {
    logger.error('Register failed internally', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
