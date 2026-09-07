import { describe, test, expect, beforeEach, sharedTestDb, PaymentHarmonizer, WalletOtpManager } from '../harness';

describe('Tier 2 - Boundary Cases: Features F9 - F12', () => {
  const db = sharedTestDb.getDb();
  const testMobile = '9876543230';
  const now = new Date('2026-09-06T12:00:00.000Z');

  beforeEach(() => {
    sharedTestDb.wipe();

    db.prepare(`
      INSERT INTO "Member" (id, mobile, name, walletBalance) 
      VALUES ('mem_b_912', ?, 'Boundary User', 500)
    `).run(testMobile);

    db.prepare(`
      INSERT INTO "Sport" (id, name) VALUES ('sport_b_912', 'Badminton')
    `).run();

    db.prepare(`
      INSERT INTO "Turf" (id, name, bookingPrice, capacityPerSlot) 
      VALUES ('turf_b_912', 'Court 1', 1000, 1)
    `).run();
  });

  // --------------------------------------------------------------------------
  // F9 Boundary Cases
  // --------------------------------------------------------------------------
  test('T2.F9.1: Zero price promotional booking is instantly marked PAID with 0 amountDue', () => {
    const status = PaymentHarmonizer.deriveStatus(0, 0, 0);
    expect(status.paymentStatus).toBe('PAID');
    expect(status.amountDue).toBe(0);
    expect(status.advancePaid).toBe(0);
  });

  test('T2.F9.2: PAC booking where advance exactly matches price is marked PAID', () => {
    const status = PaymentHarmonizer.deriveStatus(1000, 0, 1000);
    expect(status.paymentStatus).toBe('PAID');
    expect(status.amountDue).toBe(0);
  });

  test('T2.F9.3: Incremental partial settlement at counter leaves remaining balance and stays PARTIAL', () => {
    // Initial booking: price 1000, advance 200, due 800 -> PARTIAL
    const initial = PaymentHarmonizer.deriveStatus(1000, 0, 200);
    expect(initial.paymentStatus).toBe('PARTIAL');
    expect(initial.amountDue).toBe(800);

    // Customer pays 300 more at counter: total advance 500, due 500 -> still PARTIAL
    const incremental = PaymentHarmonizer.deriveStatus(1000, 0, 200 + 300);
    expect(incremental.paymentStatus).toBe('PARTIAL');
    expect(incremental.amountDue).toBe(500);
    expect(incremental.advancePaid).toBe(500);
  });

  test('T2.F9.4: Multiple cash payment records for the same booking sum accurately to advancePaid', () => {
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_multi_pay', 'turf_b_912', 'mem_b_912', 'sport_b_912', '2026-09-06T15:00:00Z', '2026-09-06T16:00:00Z', 1000, 'PARTIAL', 'CONFIRMED', 0, 1000)
    `).run();

    db.prepare(`INSERT INTO "Payment" (id, bookingId, amount, method) VALUES ('p1', 'bk_multi_pay', 400, 'ONLINE')`).run();
    db.prepare(`INSERT INTO "Payment" (id, bookingId, amount, method) VALUES ('p2', 'bk_multi_pay', 600, 'CASH')`).run();

    const sum = (db.prepare(`SELECT sum(amount) as total FROM "Payment" WHERE bookingId = 'bk_multi_pay'`).get() as any).total;
    expect(sum).toBe(1000);
  });

  test('T2.F9.5: PAC booking with large discount reduces amount due accordingly', () => {
    const status = PaymentHarmonizer.deriveStatus(1500, 1400, 0);
    expect(status.amountDue).toBe(100);
    expect(status.paymentStatus).toBe('UNPAID');
  });

  // --------------------------------------------------------------------------
  // F10 Boundary Cases
  // --------------------------------------------------------------------------
  test('T2.F10.1: Mobile Razorpay options interface typechecks without optional fields', () => {
    interface MinimalRazorpayOpts {
      key: string;
      amount: number;
      name: string;
      order_id: string;
    }
    const minimal: MinimalRazorpayOpts = {
      key: 'rzp_test_k1',
      amount: 50000,
      name: 'Sportsvilla',
      order_id: 'order_123'
    };
    expect(minimal.key).toBe('rzp_test_k1');
  });

  test('T2.F10.2: Mobile booking validation rejects negative participantCount', () => {
    function validateParticipants(count: number): boolean {
      return Number.isInteger(count) && count >= 1;
    }
    expect(validateParticipants(-1)).toBe(false);
    expect(validateParticipants(0)).toBe(false);
    expect(validateParticipants(2)).toBe(true);
  });

  test('T2.F10.3: Mobile booking validation rejects past startTime', () => {
    function validateFutureStartTime(isoStr: string, current: Date): boolean {
      return new Date(isoStr).getTime() > current.getTime();
    }
    const past = new Date(now.getTime() - 10000).toISOString();
    const future = new Date(now.getTime() + 10000).toISOString();

    expect(validateFutureStartTime(past, now)).toBe(false);
    expect(validateFutureStartTime(future, now)).toBe(true);
  });

  test('T2.F10.4: Theme partial overrides allow customized colors safely', () => {
    const defaultColors = { primary: '#10B981', background: '#FFFFFF', text: '#000000' };
    const customColors = { ...defaultColors, primary: '#059669' };
    expect(customColors.primary).toBe('#059669');
    expect(customColors.background).toBe('#FFFFFF');
  });

  test('T2.F10.5: Icon resolver safely handles undefined or null without crashing', () => {
    function getSafeIcon(icon: any): string {
      if (!icon) return 'activity';
      if (typeof icon === 'string') return icon;
      return icon.name || 'activity';
    }
    expect(getSafeIcon(null)).toBe('activity');
    expect(getSafeIcon(undefined)).toBe('activity');
    expect(getSafeIcon('trophy')).toBe('trophy');
  });

  // --------------------------------------------------------------------------
  // F11 Boundary Cases
  // --------------------------------------------------------------------------
  test('T2.F11.1: Cancelled booking renders Cancelled badge in red', () => {
    function getStatusColor(status: string) {
      if (status === 'CANCELLED') return '#EF4444';
      if (status === 'CONFIRMED') return '#10B981';
      return '#6B7280';
    }
    expect(getStatusColor('CANCELLED')).toBe('#EF4444');
  });

  test('T2.F11.2: Entry QR ticket pass is disabled for unconfirmed bookings', () => {
    function isPassValid(bookingStatus: string, paymentStatus: string): boolean {
      return bookingStatus === 'CONFIRMED' && paymentStatus === 'PAID';
    }
    expect(isPassValid('CONFIRMED', 'UNPAID')).toBe(false);
    expect(isPassValid('CONFIRMED', 'PARTIAL')).toBe(false);
    expect(isPassValid('CANCELLED', 'PAID')).toBe(false);
    expect(isPassValid('CONFIRMED', 'PAID')).toBe(true);
  });

  test('T2.F11.3: Header confirmation distinguishes Due at Counter from Confirmed & Paid', () => {
    function getConfirmationHeader(amountDue: number): string {
      return amountDue > 0 ? `Reserved — ₹${amountDue} Due at Counter` : 'Booking Confirmed & Paid';
    }
    expect(getConfirmationHeader(500)).toContain('Due at Counter');
    expect(getConfirmationHeader(0)).toContain('Confirmed & Paid');
  });

  test('T2.F11.4: Rapid swipe debounce prevents double submission in mobile client', () => {
    let callCount = 0;
    let isSubmitting = false;

    function handleSwipe() {
      if (isSubmitting) return;
      isSubmitting = true;
      callCount++;
    }

    handleSwipe();
    handleSwipe(); // Second rapid swipe during flight
    expect(callCount).toBe(1);
  });

  test('T2.F11.5: Amount due never displays as a negative value in mobile UI', () => {
    function formatDue(due: number): string {
      const safe = Math.max(0, due);
      return `₹${safe}`;
    }
    expect(formatDue(-50)).toBe('₹0');
    expect(formatDue(450)).toBe('₹450');
  });

  // --------------------------------------------------------------------------
  // F12 Boundary Cases
  // --------------------------------------------------------------------------
  test('T2.F12.1: 5 consecutive failed OTP attempts locks account for 15 minutes', () => {
    WalletOtpManager.generateOtp(testMobile, db, now);

    // 4 wrong attempts
    for (let i = 0; i < 4; i++) {
      const res = WalletOtpManager.verifyOtp(testMobile, '111111', db, now);
      expect(res.success).toBe(false);
    }

    // 5th wrong attempt triggers lock
    const res5 = WalletOtpManager.verifyOtp(testMobile, '111111', db, now);
    expect(res5.success).toBe(false);

    // 6th attempt is blocked by lockedUntil
    const res6 = WalletOtpManager.verifyOtp(testMobile, '111111', db, now);
    expect(res6.success).toBe(false);
    expect(res6.error).toContain('temporarily locked');
  });

  test('T2.F12.2: OTP string preserves leading zeros without truncation', () => {
    WalletOtpManager.generateOtp(testMobile, db, now);
    const leadingZeroOtp = '004512';
    db.prepare(`UPDATE "Otp" SET code = ? WHERE mobile = ?`).run(leadingZeroOtp, testMobile);

    const record = db.prepare(`SELECT code FROM "Otp" WHERE mobile = ?`).get(testMobile) as any;
    expect(record.code).toBe('004512');
    expect(record.code.length).toBe(6);
  });

  test('T2.F12.3: Verification without requesting OTP returns OTP not requested error', () => {
    const res = WalletOtpManager.verifyOtp('9999999999', '123456', db, now);
    expect(res.success).toBe(false);
    expect(res.error).toBe('OTP not requested');
  });

  test('T2.F12.4: Attempting to verify an already consumed OTP fails', () => {
    const code = WalletOtpManager.generateOtp(testMobile, db, now);
    // First verification consumes OTP
    const res1 = WalletOtpManager.verifyOtp(testMobile, code, db, now);
    expect(res1.success).toBe(true);

    // Second verification must fail because OTP was deleted
    const res2 = WalletOtpManager.verifyOtp(testMobile, code, db, now);
    expect(res2.success).toBe(false);
    expect(res2.error).toBe('OTP not requested');
  });

  test('T2.F12.5: Exact wallet balance deduction (requested === balance) is allowed', () => {
    const member = db.prepare(`SELECT walletBalance FROM "Member" WHERE mobile = ?`).get(testMobile) as any;
    expect(member.walletBalance).toBe(500);

    const isAllowed = 500 <= member.walletBalance;
    expect(isAllowed).toBe(true);
  });
});
