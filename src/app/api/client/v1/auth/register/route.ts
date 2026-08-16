import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { sendWhatsAppMemberRegisteredTemplate } from '@/lib/whatsapp';
import { generateMemberId } from '@/lib/memberUtils';
export async function POST(request: Request) {
  apiLog(`[API] POST /api/client/v1/auth/register called`);
  try {
    const { mobile, code, name, email, dob } = await request.json();
    
    const cleanMobile = mobile ? mobile.replace('+91', '').replace(/[^0-9]/g, '') : '';
    logger.info('Register Request Initiated', { mobile: cleanMobile });

    if (!cleanMobile || !code || !name) {
      logger.warn('Register failed: missing fields', { mobile: cleanMobile });
      return jsonResponse({ error: "Mobile, code, and name are required" }, { status: 400 });
    }

    const otpRecord = await prisma.otp.findUnique({
      where: { mobile: cleanMobile }
    });

    if (!otpRecord) {
      return jsonResponse({ error: "No OTP request found for this number" }, { status: 400 });
    }

    if (otpRecord.code !== code) {
      return jsonResponse({ error: "Invalid OTP code" }, { status: 400 });
    }

    if (new Date() > otpRecord.expiresAt) {
      return jsonResponse({ error: "OTP has expired" }, { status: 400 });
    }

    // Delete the OTP record so it can't be reused
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    // Check if user already exists
    let member = await prisma.member.findFirst({
      where: { mobile: cleanMobile }
    });

    if (member) {
      return jsonResponse({ error: "User already exists" }, { status: 400 });
    }

    // Create the Member record
    const newMemberId = await generateMemberId(cleanMobile);
    member = await prisma.member.create({
      data: {
        id: newMemberId,
        mobile: cleanMobile,
        name: name,
        email: email || null,
        dateOfBirth: dob ? new Date(dob) : null,
        loyaltyPoints: 0
      }
    });

    try {
      await sendWhatsAppMemberRegisteredTemplate(member.name, member.mobile);
    } catch (waError) {
      logger.error('WhatsApp welcome message failed', { memberId: member.id, error: waError });
    }

    // Mint a custom JWT
    const uid = cleanMobile.startsWith('+') ? cleanMobile : `+91${cleanMobile}`;
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error("NEXTAUTH_SECRET is not configured");
    }

    const customToken = jwt.sign(
      { uid, memberId: member.id },
      secret,
      { expiresIn: '30d' }
    );

    logger.info('Register Successful', { memberId: member.id });

    return jsonResponse({ 
      success: true, 
      customToken, 
      memberId: member.id,
      member 
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/auth/register ->`, error);
    logger.error('Register failed internally', { error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message, stack: error.stack });
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
