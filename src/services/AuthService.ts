import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { randomInt } from 'crypto';
import { sendWhatsAppOtp, sendWhatsAppMemberRegisteredTemplate } from '@/lib/whatsapp';
import { ApiError } from '@/lib/api-handler';
import jwt from 'jsonwebtoken';
import { generateMemberId } from '@/lib/memberUtils';

export class AuthService {
  /**
   * Generates and sends a WhatsApp OTP.
   * Throws ApiError on validation or rate limit failures.
   */
  static async sendOtp(mobile: string): Promise<void> {
    const cleanMobile = mobile.replace('+91', '').replace(/[^0-9]/g, '');
    logger.info('OTP Send Request Initiated', { mobile: cleanMobile });

    if (!cleanMobile || cleanMobile.length < 10) {
      logger.warn('Invalid mobile number provided for OTP', { mobile: cleanMobile });
      throw new ApiError('Invalid mobile number', 400);
    }

    const existingOtp = await prisma.otp.findUnique({ where: { mobile: cleanMobile } });
    if (existingOtp) {
      const timeSinceCreated = Date.now() - existingOtp.createdAt.getTime();
      if (timeSinceCreated < 60000) {
        throw new ApiError('Please wait before requesting another OTP.', 429);
      }
      if (existingOtp.lockedUntil && new Date() < existingOtp.lockedUntil) {
        throw new ApiError('Account temporarily locked due to too many attempts.', 429);
      }
    }

    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await prisma.otp.upsert({
      where: { mobile: cleanMobile },
      update: { code, expiresAt, attempts: 0, lockedUntil: null },
      create: { mobile: cleanMobile, code, expiresAt }
    });

    try {
      const waRes = await sendWhatsAppOtp(cleanMobile, code, "LOGIN");
      logger.info('WhatsApp OTP Sent', { mobile: cleanMobile, response: waRes });
    } catch (smsError: any) {
      logger.error('WhatsApp OTP Failed', { mobile: cleanMobile, error: smsError?.message });
    }
  }

  /**
   * Verifies an OTP and returns a custom JWT and memberId.
   */
  static async verifyOtp(mobile: string, code: string): Promise<{ customToken: string, memberId: string }> {
    const cleanMobile = mobile ? mobile.replace('+91', '').replace(/[^0-9]/g, '') : '';
    logger.info('OTP Verify Request Initiated', { mobile: cleanMobile });

    if (!cleanMobile || !code) {
      throw new ApiError('Mobile and code are required', 400);
    }

    const otpRecord = await prisma.otp.findUnique({
      where: { mobile: cleanMobile }
    });

    if (!otpRecord) {
      throw new ApiError('No OTP request found for this number', 400);
    }

    if (otpRecord.lockedUntil && new Date() < otpRecord.lockedUntil) {
      const waitMinutes = Math.ceil((otpRecord.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ApiError(`Too many attempts. Try again in ${waitMinutes} minute(s).`, 429);
    }

    if (otpRecord.code !== code) {
      const newAttempts = otpRecord.attempts + 1;
      const updateData: any = { attempts: newAttempts };
      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await prisma.otp.update({ where: { id: otpRecord.id }, data: updateData });
      
      logger.warn('OTP Verify failed: invalid code', { mobile: cleanMobile, attempts: newAttempts });
      if (newAttempts >= 5) {
        throw new ApiError('Too many failed attempts. Locked for 15 minutes.', 429);
      } else {
        throw new ApiError('Invalid OTP code', 400);
      }
    }

    if (new Date() > otpRecord.expiresAt) {
      logger.warn('OTP Verify failed: expired', { mobile: cleanMobile });
      throw new ApiError('OTP has expired', 400);
    }

    await prisma.otp.delete({ where: { id: otpRecord.id } });

    const member = await prisma.member.findFirst({
      where: { mobile: cleanMobile }
    });

    if (!member) {
      throw new ApiError('User does not exist', 400);
    }

    if (!process.env.NEXTAUTH_SECRET) {
      throw new ApiError('Server configuration error', 500);
    }

    const uid = cleanMobile.startsWith('+') ? cleanMobile : `+91${cleanMobile}`;
    const customToken = jwt.sign(
      { uid, memberId: member.id },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '30d' }
    );

    logger.info('OTP Verify Successful', { memberId: member.id });

    return { customToken, memberId: member.id };
  }

  /**
   * Registers a new member and returns a custom JWT and memberId.
   */
  static async register(data: { mobile: string, code: string, name: string, email?: string, dob?: string }): Promise<{ customToken: string, memberId: string, member: any }> {
    const { mobile, code, name, email, dob } = data;
    const cleanMobile = mobile ? mobile.replace('+91', '').replace(/[^0-9]/g, '') : '';
    logger.info('Register Request Initiated', { mobile: cleanMobile });

    if (!cleanMobile || !code || !name) {
      throw new ApiError('Mobile, code, and name are required', 400);
    }

    const otpRecord = await prisma.otp.findUnique({
      where: { mobile: cleanMobile }
    });

    if (!otpRecord) {
      throw new ApiError('No OTP request found for this number', 400);
    }

    if (otpRecord.code !== code) {
      throw new ApiError('Invalid OTP code', 400);
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new ApiError('OTP has expired', 400);
    }

    await prisma.otp.delete({ where: { id: otpRecord.id } });

    let member = await prisma.member.findFirst({
      where: { mobile: cleanMobile }
    });

    if (member) {
      throw new ApiError('User already exists', 400);
    }

    const newMemberId = await generateMemberId(cleanMobile);
    member = await prisma.member.create({
      data: {
        id: newMemberId,
        mobile: cleanMobile,
        name: name,
        email: email || null,
        dateOfBirth: dob ? new Date(dob) : null,
        loyaltyPoints: 0
      }
    });

    try {
      await sendWhatsAppMemberRegisteredTemplate(member.name, member.mobile);
    } catch (waError) {
      logger.error('WhatsApp welcome message failed', { memberId: member.id, error: waError });
    }

    const uid = cleanMobile.startsWith('+') ? cleanMobile : `+91${cleanMobile}`;
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new ApiError("Server configuration error", 500);
    }

    const customToken = jwt.sign(
      { uid, memberId: member.id },
      secret,
      { expiresIn: '30d' }
    );

    logger.info('Register Successful', { memberId: member.id });

    return { customToken, memberId: member.id, member };
  }

  /**
   * Checks if a user exists by mobile number.
   */
  static async checkUserExists(mobile: string): Promise<{ exists: boolean, memberId?: string }> {
    const cleanMobile = mobile ? mobile.replace('+91', '').replace(/[^0-9]/g, '') : '';
    
    if (!cleanMobile || cleanMobile.length < 10) {
      throw new ApiError('Invalid mobile number', 400);
    }

    const member = await prisma.member.findFirst({
      where: { mobile: cleanMobile }
    });

    return { exists: !!member, memberId: member?.id };
  }
}
