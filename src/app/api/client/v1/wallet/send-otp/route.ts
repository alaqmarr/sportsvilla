import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappDb } from '@/lib/whatsappDb';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { randomInt } from 'crypto';
import { sendWhatsAppOtp } from '@/lib/whatsapp';

export async function POST(request: Request) {
  apiLog(`[API] POST /api/client/v1/wallet/send-otp called`);
  
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  const { member } = authRes;

  try {
    const cleanMobile = member.mobile.replace('+91', '').replace(/[^0-9]/g, '');
    
    if (!cleanMobile || cleanMobile.length < 10) {
      return jsonResponse({ error: "Invalid mobile number associated with account" }, { status: 400 });
    }

    // Rate limit: check if there's a recent OTP for this number for wallet purpose
    const existingOtp = await whatsappDb.whatsAppOtp.findFirst({ 
      where: { 
        phoneNumber: { contains: cleanMobile },
        purpose: 'WALLET_TXN'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingOtp) {
      const timeSinceCreated = Date.now() - existingOtp.createdAt.getTime();
      if (timeSinceCreated < 60000) { // 1 minute cooldown
        return jsonResponse({ error: 'Please wait before requesting another OTP.' }, { status: 429 });
      }
    }

    // Generate 6 digit code
    const code = randomInt(100000, 999999).toString();

    // Send OTP via Meta WhatsApp Business API using the library
    // The library handles saving it to whatsappDb under the provided purpose
    try {
      const waRes = await sendWhatsAppOtp(cleanMobile, code, "WALLET_TXN");
      if (!waRes.success) {
        throw new Error(waRes.error || "Failed to send WhatsApp message");
      }
    } catch (err: any) {
      console.error(`[API ERROR] POST /api/client/v1/wallet/send-otp ->`, err);
      return jsonResponse({ error: "Failed to send OTP via WhatsApp" }, { status: 500 });
    }

    return jsonResponse({ 
      success: true, 
      message: "OTP sent successfully"
    });
  } catch (error: any) {
    console.error('Wallet OTP send failed internally', error);
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
