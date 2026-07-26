import { NextResponse } from 'next/server';
import { whatsappDb } from '@/lib/whatsappDb';
import { sendWhatsAppMagicLogin } from '@/lib/whatsapp';
import { jsonResponse } from '@/lib/api-logger';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  console.log(`[API] POST /api/client/v1/auth/magic/send called`);
  try {
    const { mobile } = await request.json();
    
    // Clean mobile number
    let cleanMobile = mobile.replace(/^\+91/, "").replace(/[^0-9]/g, '');
    if (cleanMobile.length === 10) {
      cleanMobile = "91" + cleanMobile;
    }

    if (!cleanMobile || cleanMobile.length < 10) {
      return jsonResponse({ error: "Invalid mobile number" }, { status: 400 });
    }

    // Rate limit check in WhatsApp DB
    const existingToken = await whatsappDb.whatsAppOtp.findFirst({
      where: {
        phoneNumber: cleanMobile,
        purpose: "MAGIC_LOGIN",
        verified: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingToken) {
      const timeSinceCreated = Date.now() - new Date(existingToken.createdAt).getTime();
      if (timeSinceCreated < 60000) { // 1 minute cooldown
        return jsonResponse({ error: 'Please wait 1 minute before requesting another login link.' }, { status: 429 });
      }
    }

    // Generate secure random 32-char hex token
    const magicToken = randomBytes(16).toString("hex");

    // Send WhatsApp Magic Login Template
    const result = await sendWhatsAppMagicLogin(cleanMobile, magicToken, "MAGIC_LOGIN");

    if (!result.success) {
      console.error("[MAGIC LOGIN ERROR]", result.error);
      return jsonResponse({ error: "Failed to send WhatsApp login link: " + result.error }, { status: 500 });
    }

    return jsonResponse({
      success: true,
      message: "Magic login link sent via WhatsApp",
      expiresIn: 600,
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/auth/magic/send ->`, error);
    return jsonResponse({ error: "Internal server error" }, { status: 500 });
  }
}
