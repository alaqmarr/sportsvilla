import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { whatsappDb } from '@/lib/whatsappDb';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { randomInt } from 'crypto';
import { sendWhatsAppOtp } from '@/lib/whatsapp';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  apiLog(`[API] POST /api/admin/members/${params.id}/wallet/send-otp called`);
  
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const memberId = params.id;
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member || !member.mobile) {
      return jsonResponse({ error: "Member not found or has no mobile number" }, { status: 404 });
    }

    const cleanMobile = member.mobile.replace('+91', '').replace(/[^0-9]/g, '');
    
    if (!cleanMobile || cleanMobile.length < 10) {
      return jsonResponse({ error: "Invalid mobile number associated with member account" }, { status: 400 });
    }

    // Rate limit
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

    // Send OTP via Meta WhatsApp Business API
    try {
      const waRes = await sendWhatsAppOtp(cleanMobile, code, "WALLET_TXN");
      if (!waRes.success) {
        throw new Error(waRes.error || "Failed to send WhatsApp message");
      }
    } catch (err: any) {
      console.error(`[API ERROR] POST /api/admin/members/${params.id}/wallet/send-otp ->`, err);
      return jsonResponse({ error: "Failed to send OTP via WhatsApp" }, { status: 500 });
    }

    return jsonResponse({ 
      success: true, 
      message: "OTP sent successfully to the user's registered WhatsApp number"
    });
  } catch (error: any) {
    console.error('Wallet OTP send failed internally', error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
