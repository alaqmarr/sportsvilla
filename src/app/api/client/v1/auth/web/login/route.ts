import { prisma } from '@/lib/prisma';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { logger } from '@/lib/logger';
import { setSessionCookie, mintWebToken } from '@/lib/web-auth';

export async function POST(request: Request) {
  apiLog(`[API] POST /api/client/v1/auth/web/login called`);
  try {
    const { mobile, code } = await request.json();
    const cleanMobile = mobile ? mobile.replace('+91', '').replace(/[^0-9]/g, '') : '';

    if (!cleanMobile || !code) {
      return jsonResponse({ error: 'Mobile and code are required' }, { status: 400 });
    }

    const otpRecord = await prisma.otp.findUnique({
      where: { mobile: cleanMobile },
    });

    if (!otpRecord) {
      return jsonResponse({ error: 'No OTP request found for this number' }, { status: 400 });
    }

    if (otpRecord.lockedUntil && new Date() < otpRecord.lockedUntil) {
      const waitMinutes = Math.ceil((otpRecord.lockedUntil.getTime() - Date.now()) / 60000);
      return jsonResponse({ error: `Too many attempts. Try again in ${waitMinutes} minute(s).` }, { status: 429 });
    }

    if (otpRecord.code !== code) {
      const newAttempts = otpRecord.attempts + 1;
      const updateData: any = { attempts: newAttempts };
      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await prisma.otp.update({ where: { id: otpRecord.id }, data: updateData });
      logger.warn('Web login OTP verify failed: invalid code', { mobile: cleanMobile, attempts: newAttempts });
      return jsonResponse(
        { error: newAttempts >= 5 ? 'Too many failed attempts. Locked for 15 minutes.' : 'Invalid OTP code' },
        { status: newAttempts >= 5 ? 429 : 400 }
      );
    }

    if (new Date() > otpRecord.expiresAt) {
      return jsonResponse({ error: 'OTP has expired' }, { status: 400 });
    }

    await prisma.otp.delete({ where: { id: otpRecord.id } });

    const member = await prisma.member.findFirst({
      where: { mobile: cleanMobile },
    });

    if (!member) {
      // New user — return flag so frontend shows registration form
      // We need to keep track that this mobile was verified, so create a temporary OTP marker
      await prisma.otp.create({
        data: {
          mobile: cleanMobile,
          code: '__VERIFIED__',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min to complete registration
        },
      });
      return jsonResponse({ success: true, isNewUser: true, mobile: cleanMobile });
    }

    // Existing user — mint JWT and set cookie
    const token = mintWebToken(cleanMobile, member.id);

    // Fetch family members for multi-profile support
    const familyMembers = await prisma.member.findMany({
      where: { mobile: cleanMobile },
      select: { id: true, name: true, mobile: true, email: true, dateOfBirth: true, loyaltyPoints: true, walletBalance: true },
    });

    logger.info('Web login successful', { memberId: member.id });

    const response = jsonResponse({
      success: true,
      isNewUser: false,
      member,
      familyMembers,
    });

    return setSessionCookie(response, token);
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/auth/web/login ->`, error);
    logger.error('Web login failed internally', { error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
