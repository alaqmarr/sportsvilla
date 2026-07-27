import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappDb } from '@/lib/whatsappDb';
import jwt from 'jsonwebtoken';
import { jsonResponse } from '@/lib/api-logger';

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(request: Request) {
  try {
    const { mobile, name, email, dob } = await request.json();
    
    let cleanMobile = mobile.replace(/^\+91/, "").replace(/[^0-9]/g, '');
    if (cleanMobile.length === 10) {
      cleanMobile = "91" + cleanMobile;
    }

    if (!cleanMobile || !name) {
      return jsonResponse({ error: "Mobile and name are required" }, { status: 400 });
    }

    // Verify they have a recently verified magic link token
    const recentToken = await whatsappDb.whatsAppOtp.findFirst({
      where: {
        phoneNumber: cleanMobile,
        purpose: "MAGIC_LOGIN",
        verified: true,
      },
      orderBy: { createdAt: "desc" }
    });

    if (!recentToken) {
      return jsonResponse({ error: "No verified session found. Please request a new magic link." }, { status: 400 });
    }

    // Check if it's within the last 30 minutes
    const timeSinceCreated = Date.now() - new Date(recentToken.createdAt).getTime();
    if (timeSinceCreated > 30 * 60 * 1000) {
      return jsonResponse({ error: "Session expired. Please request a new magic link." }, { status: 400 });
    }

    // Prisma stores 10 digit numbers usually
    const prismaMobile = cleanMobile.slice(-10);

    let member = await prisma.member.findFirst({
      where: { mobile: prismaMobile }
    });

    if (member) {
      return jsonResponse({ error: "User already exists" }, { status: 400 });
    }

    member = await prisma.member.create({
      data: {
        mobile: prismaMobile,
        name: name,
        email: email || null,
        dateOfBirth: dob ? new Date(dob) : null,
        loyaltyPoints: 0
      }
    });

    if (!JWT_SECRET) {
      throw new Error("NEXTAUTH_SECRET is not configured");
    }

    const sessionToken = jwt.sign(
      { uid: "+91" + prismaMobile, memberId: member.id },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return jsonResponse({ 
      success: true, 
      token: sessionToken, 
      memberId: member.id,
      member 
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/auth/magic/register ->`, error);
    return jsonResponse({ error: "Internal server error" }, { status: 500 });
  }
}
