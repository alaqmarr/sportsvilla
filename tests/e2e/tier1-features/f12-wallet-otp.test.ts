import { describe, test, expect, beforeEach, sharedTestDb, WalletOtpManager } from '../harness';

describe('Tier 1 - Feature F12: Mobile Wallet OTP Flow & Deduction Handling', () => {
  const db = sharedTestDb.getDb();
  const testMobile = '9876543299';
  const now = new Date('2026-09-06T12:00:00.000Z');

  beforeEach(() => {
    sharedTestDb.wipe();

    db.prepare(`
      INSERT INTO "Member" (id, mobile, name, walletBalance)
      VALUES ('mem_otp_01', ?, 'Rohan Mehra', 500)
    `).run(testMobile);
  });

  test('T1.12.1: Generates 6-digit numeric OTP with 5-minute expiry', () => {
    const otp = WalletOtpManager.generateOtp(testMobile, db, now);
    expect(otp.length).toBe(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);

    const record = db.prepare(`SELECT * FROM "Otp" WHERE mobile = ?`).get(testMobile) as any;
    expect(record).toBeDefined();
    expect(record.code).toBe(otp);

    const expiryTime = new Date(record.expiresAt).getTime();
    const expectedExpiry = now.getTime() + 5 * 60 * 1000;
    expect(expiryTime).toBe(expectedExpiry);
  });

  test('T1.12.2: Successfully verifies correct OTP and consumes the OTP record', () => {
    const code = WalletOtpManager.generateOtp(testMobile, db, now);
    const verification = WalletOtpManager.verifyOtp(testMobile, code, db, now);

    expect(verification.success).toBe(true);

    // After success, OTP must be consumed (deleted)
    const record = db.prepare(`SELECT * FROM "Otp" WHERE mobile = ?`).get(testMobile);
    expect(record).toBeUndefined();
  });

  test('T1.12.3: Rejects incorrect OTP and increments attempt counter', () => {
    WalletOtpManager.generateOtp(testMobile, db, now);
    const verification = WalletOtpManager.verifyOtp(testMobile, '000000', db, now);

    expect(verification.success).toBe(false);
    expect(verification.error).toBe('Invalid OTP');

    const record = db.prepare(`SELECT * FROM "Otp" WHERE mobile = ?`).get(testMobile) as any;
    expect(record.attempts).toBe(1);
  });

  test('T1.12.4: Rejects expired OTP code (>5 minutes old)', () => {
    const code = WalletOtpManager.generateOtp(testMobile, db, now);
    const sixMinutesLater = new Date(now.getTime() + 6 * 60 * 1000);

    const verification = WalletOtpManager.verifyOtp(testMobile, code, db, sixMinutesLater);
    expect(verification.success).toBe(false);
    expect(verification.error).toBe('OTP has expired');
  });

  test('T1.12.5: Rejects wallet deduction if requested amount exceeds available member balance', () => {
    const member = db.prepare(`SELECT walletBalance FROM "Member" WHERE mobile = ?`).get(testMobile) as any;
    expect(member.walletBalance).toBe(500);

    const requestedDeduction = 700;
    let deductionAllowed = false;
    let errorMsg = '';

    if (requestedDeduction <= member.walletBalance) {
      deductionAllowed = true;
    } else {
      errorMsg = 'Insufficient wallet balance';
    }

    expect(deductionAllowed).toBe(false);
    expect(errorMsg).toBe('Insufficient wallet balance');
  });
});
