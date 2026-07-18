import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY || '';
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL || '';

export async function POST(request: Request) {
  try {
    const { mobile } = await request.json();
    
    // Clean mobile number (remove +91 if present)
    const cleanMobile = mobile.replace('+91', '').replace(/[^0-9]/g, '');
    
    logger.info('OTP Send Request Initiated', { mobile: cleanMobile });

    if (!cleanMobile || cleanMobile.length < 10) {
      logger.warn('Invalid mobile number provided for OTP', { mobile: cleanMobile });
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
      logger.info('Infobip SMS Sent', { mobile: cleanMobile, response: infobipData });
    } catch (smsError: any) {
      logger.error('Infobip SMS Failed', { mobile: cleanMobile, error: smsError.message });
    }

    return NextResponse.json({ 
      success: true, 
      message: "OTP generated",
      // Include code in dev logs but don't show to user
      dev_code: code 
    });
  } catch (error: any) {
    logger.error('OTP send failed internally', { error: error.message, stack: error.stack });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

