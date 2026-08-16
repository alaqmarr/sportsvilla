import { prisma } from '@/lib/prisma';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { logger } from '@/lib/logger';
import { setSessionCookie, mintWebToken } from '@/lib/web-auth';
import { sendWhatsAppMemberRegisteredTemplate } from '@/lib/whatsapp';
import { generateMemberId } from '@/lib/memberUtils';

export async function POST(request: Request) {
  apiLog(`[API] POST /api/client/v1/auth/web/register called`);
  try {
    const { mobile, name, email, dob } = await request.json();
    const cleanMobile = mobile ? mobile.replace('+91', '').replace(/[^0-9]/g, '') : '';

    if (!cleanMobile || !name) {
      return jsonResponse({ error: 'Mobile and name are required' }, { status: 400 });
    }

    // Verify the mobile was OTP-verified (temporary marker from web/login)
    const verifiedMarker = await prisma.otp.findUnique({
      where: { mobile: cleanMobile },
    });

    if (!verifiedMarker || verifiedMarker.code !== '__VERIFIED__') {
      return jsonResponse({ error: 'Mobile number not verified. Please request a new OTP.' }, { status: 400 });
    }

    if (new Date() > verifiedMarker.expiresAt) {
      await prisma.otp.delete({ where: { id: verifiedMarker.id } });
      return jsonResponse({ error: 'Verification expired. Please request a new OTP.' }, { status: 400 });
    }

    // Check if member already exists
    const existing = await prisma.member.findFirst({
      where: { mobile: cleanMobile },
    });

    if (existing) {
      // Shouldn't happen, but handle gracefully — just log them in
      await prisma.otp.delete({ where: { id: verifiedMarker.id } });
      const token = mintWebToken(cleanMobile, existing.id);
      const response = jsonResponse({ success: true, member: existing });
      return setSessionCookie(response, token);
    }

    // Delete the verification marker
    await prisma.otp.delete({ where: { id: verifiedMarker.id } });

    // Create the member
    const newMemberId = await generateMemberId(cleanMobile);
    const member = await prisma.member.create({
      data: {
        id: newMemberId,
        mobile: cleanMobile,
        name,
        email: email || null,
        dateOfBirth: dob ? new Date(dob) : null,
        loyaltyPoints: 0,
      },
    });

    // Send WhatsApp welcome (fire and forget)
    try {
      await sendWhatsAppMemberRegisteredTemplate(member.name, member.mobile);
    } catch (waErr) {
      logger.error('WhatsApp welcome failed for web registration', { memberId: member.id, error: waErr });
    }

    const token = mintWebToken(cleanMobile, member.id);
    logger.info('Web registration successful', { memberId: member.id });

    const response = jsonResponse({
      success: true,
      member,
      memberId: member.id,
    });

    return setSessionCookie(response, token);
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/auth/web/register ->`, error);
    logger.error('Web register failed internally', { error: error.message });
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
