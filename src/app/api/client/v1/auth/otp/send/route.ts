import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY || '';
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL || '';

export async function POST(request: Request) {
  try {
    const { mobile } = await request.json();
    
    // Clean mobile number (remove +91 if present)
    const cleanMobile = mobile.replace('+91', '').replace(/[^0-9]/g, '');
    
    if (!cleanMobile || cleanMobile.length < 10) {
      return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration 5 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await prisma.otp.upsert({
      where: { mobile: cleanMobile },
      update: { code, expiresAt },
      create: { mobile: cleanMobile, code, expiresAt }
    });

    // Send real SMS via Infobip
    try {
      const infobipRes = await fetch(`https://${INFOBIP_BASE_URL}/sms/2/text/advanced`, {
        method: 'POST',
        headers: {
          'Authorization': `App ${INFOBIP_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              destinations: [{ to: `91${cleanMobile}` }],
              from: 'SportsVilla',
              text: `Your SportsVilla login code is ${code}. Do not share this with anyone.`
            }
          ]
        })
      });
      const infobipData = await infobipRes.json();
      console.log(`[Infobip] Sent to ${cleanMobile}:`, infobipData);
    } catch (smsError) {
      console.error("[Infobip Error]", smsError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "OTP generated",
      // Include code in dev logs but don't show to user
      dev_code: code 
    });
  } catch (error: any) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

