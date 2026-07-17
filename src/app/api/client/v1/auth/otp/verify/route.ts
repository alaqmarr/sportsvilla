import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { mobile, code } = await request.json();
    
    const cleanMobile = mobile ? mobile.replace('+91', '').replace(/[^0-9]/g, '') : '';

    if (!cleanMobile || !code) {
      return NextResponse.json({ error: "Mobile and code are required" }, { status: 400 });
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

    // Mint a Firebase Custom Token
    // We prefix the mobile number with +91 if needed to match standard phone auth
    const uid = cleanMobile.startsWith('+') ? cleanMobile : `+91${cleanMobile}`;
    const customToken = await auth.createCustomToken(uid);

    return NextResponse.json({ 
      success: true, 
      customToken,
      memberId: member.id,
      member 
    });
  } catch (error: any) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
