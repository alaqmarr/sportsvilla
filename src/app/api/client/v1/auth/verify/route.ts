import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const decodedToken = await auth.verifyIdToken(token);
    
    // Support Phone Auth or Email Auth fallback
    const phoneNumber = decodedToken.phone_number;
    const email = decodedToken.email;

    if (!phoneNumber && !email) {
      return NextResponse.json({ error: "No phone number or email linked to this account" }, { status: 400 });
    }

    let lookupMobile = "";
    if (phoneNumber) {
      let cleanMobile = phoneNumber.replace(/^\+91/, '');
      if (cleanMobile.startsWith('+')) cleanMobile = cleanMobile.substring(1);
      lookupMobile = cleanMobile;
    } else if (email) {
      // Fallback for email auth: use email prefix as a dummy mobile for DB schema
      lookupMobile = email.split('@')[0];
    }

    // Find or create member
    let member = await prisma.member.findFirst({
      where: { mobile: lookupMobile }
    });

    if (!member) {
      member = await prisma.member.create({
        data: {
          mobile: lookupMobile,
          email: email || null,
          name: email ? email.split('@')[0] : "New Member",
          loyaltyPoints: 0
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      memberId: member.id,
      member 
    });
  } catch (error: any) {
    console.error("Auth verify error:", error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
