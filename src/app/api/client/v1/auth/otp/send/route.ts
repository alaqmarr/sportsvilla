import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { jsonResponse } from '@/lib/api-logger';
import { randomInt } from 'crypto';

const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY || '';
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL || '';

export async function POST(request: Request) {
  console.log(`[API] POST /api/client/v1/auth/otp/send called`);
  try {
    const { mobile } = await request.json();
    
    // Clean mobile number (remove +91 if present)
    const cleanMobile = mobile.replace('+91', '').replace(/[^0-9]/g, '');
    
    logger.info('OTP Send Request Initiated', { mobile: cleanMobile });

    if (!cleanMobile || cleanMobile.length < 10) {
      logger.warn('Invalid mobile number provided for OTP', { mobile: cleanMobile });
      return jsonResponse({ error: "Invalid mobile number" }, { status: 400 });
    }

    // Rate limit: check if there's a recent OTP for this number
    const existingOtp = await prisma.otp.findUnique({ where: { mobile: cleanMobile } });
    if (existingOtp) {
      const timeSinceCreated = Date.now() - existingOtp.createdAt.getTime();
      if (timeSinceCreated < 60000) { // 1 minute cooldown
        return jsonResponse({ error: 'Please wait before requesting another OTP.' }, { status: 429 });
      }
      if (existingOtp.lockedUntil && new Date() < existingOtp.lockedUntil) {
        return jsonResponse({ error: 'Account temporarily locked due to too many attempts.' }, { status: 429 });
      }
    }

    // Generate 6 digit code
    const code = randomInt(100000, 999999).toString();
    
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
    console.error(`[API ERROR] POST /api/client/v1/auth/otp/send ->`, smsError);
      logger.error('Infobip SMS Failed', { mobile: cleanMobile, error: smsError.message });
    }

    return jsonResponse({ 
      success: true, 
      message: "OTP sent successfully"
    });
  } catch (error: any) {
    logger.error('OTP send failed internally', { error: error.message, stack: error.stack });
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}

