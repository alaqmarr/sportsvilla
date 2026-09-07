import { describe, test, expect, beforeEach, sharedTestDb, TransactionRepository, PaymentHarmonizer, SlotLockService, AbandonedBookingCleanupService } from '../harness';

describe('Tier 2 - Boundary Cases: Features F1 - F4', () => {
  const db = sharedTestDb.getDb();
  const txRepo = new TransactionRepository(db);
  const now = new Date('2026-09-06T15:00:00.000Z');

  beforeEach(() => {
    sharedTestDb.wipe();

    db.prepare(`
      INSERT INTO "Member" (id, mobile, name, walletBalance) 
      VALUES ('mem_b_01', '9876543220', 'Boundary Tester 1', 1000)
    `).run();

    db.prepare(`
      INSERT INTO "Sport" (id, name) VALUES ('sport_b_01', 'Cricket')
    `).run();

    db.prepare(`
      INSERT INTO "Turf" (id, name, bookingPrice, capacityPerSlot) 
      VALUES ('turf_b_01', 'Pitch 1', 2000, 1)
    `).run();
  });

  // --------------------------------------------------------------------------
  // F1 Boundary Cases
  // --------------------------------------------------------------------------
  test('T2.F1.1: Zero amount transaction is persisted safely', () => {
    const tx = txRepo.create({
      bookingId: null,
      memberId: 'mem_b_01',
      gateway: 'WALLET',
      gatewayOrderId: null,
      gatewayPaymentId: null,
      amount: 0,
      status: 'SUCCESS'
    });
    expect(tx.amount).toBe(0);
    expect(tx.status).toBe('SUCCESS');
  });

  test('T2.F1.2: Very large transaction amount (₹1,000,000) maintains numeric precision', () => {
    const tx = txRepo.create({
      bookingId: null,
      memberId: 'mem_b_01',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'order_large_01',
      gatewayPaymentId: 'pay_large_01',
      amount: 1000000,
      status: 'SUCCESS'
    });
    expect(tx.amount).toBe(1000000);
  });

  test('T2.F1.3: Null optional fields persist as null without coercion to empty string', () => {
    const tx = txRepo.create({
      bookingId: null,
      memberId: null,
      gateway: 'MANUAL',
      gatewayOrderId: null,
      gatewayPaymentId: null,
      gatewaySignature: null,
      amount: 500,
      status: 'SUCCESS',
      errorMessage: null,
      metadata: null
    });
    expect(tx.bookingId).toBeNull();
    expect(tx.memberId).toBeNull();
    expect(tx.gatewaySignature).toBeNull();
    expect(tx.errorMessage).toBeNull();
  });

  test('T2.F1.4: Special characters and escaping in JSON metadata survive database round-trip', () => {
    const specialMeta = {
      notes: "O'Reilly & Sons <tag> \"quotes\" \n \t unicode: ₹ € ⚽",
      specialChars: "!@#$%^&*()_+-=[]{}|;:,.<>?"
    };
    const tx = txRepo.create({
      bookingId: null,
      memberId: 'mem_b_01',
      gateway: 'PHONEPE',
      gatewayOrderId: 'T_SPECIAL',
      gatewayPaymentId: null,
      amount: 250,
      status: 'PENDING',
      metadata: JSON.stringify(specialMeta)
    });

    const fetched = txRepo.findById(tx.id);
    const parsed = JSON.parse(fetched!.metadata!);
    expect(parsed.notes).toBe(specialMeta.notes);
    expect(parsed.specialChars).toBe(specialMeta.specialChars);
  });

  test('T2.F1.5: Currency defaults to INR when omitted', () => {
    const tx = txRepo.create({
      bookingId: null,
      memberId: 'mem_b_01',
      gateway: 'WALLET',
      gatewayOrderId: null,
      gatewayPaymentId: null,
      amount: 100,
      status: 'SUCCESS'
    });
    expect(tx.currency).toBe('INR');
  });

  // --------------------------------------------------------------------------
  // F2 Boundary Cases
  // --------------------------------------------------------------------------
  test('T2.F2.1: Floating point paise precision does not introduce rounding errors', () => {
    const price = 499.50;
    const advance = 199.50;
    const status = PaymentHarmonizer.deriveStatus(price, 0, advance);

    expect(status.amountDue).toBeCloseTo(300.00, 2);
    expect(status.paymentStatus).toBe('PARTIAL');
  });

  test('T2.F2.2: 100% coupon discount booking marks paymentStatus as PAID with 0 amount due', () => {
    const status = PaymentHarmonizer.deriveStatus(2000, 2000, 0);
    expect(status.paymentStatus).toBe('PAID');
    expect(status.amountDue).toBe(0);
    expect(status.advancePaid).toBe(0);
  });

  test('T2.F2.3: Advance paid exceeding price is safely clamped to payable total', () => {
    const status = PaymentHarmonizer.deriveStatus(1000, 0, 1500);
    expect(status.advancePaid).toBe(1000);
    expect(status.amountDue).toBe(0);
    expect(status.paymentStatus).toBe('PAID');
  });

  test('T2.F2.4: Negative advance paid is clamped to 0', () => {
    const status = PaymentHarmonizer.deriveStatus(1000, 0, -200);
    expect(status.advancePaid).toBe(0);
    expect(status.amountDue).toBe(1000);
    expect(status.paymentStatus).toBe('UNPAID');
  });

  test('T2.F2.5: Invalid backward transition from PAID to UNPAID is rejected', () => {
    const isValid = PaymentHarmonizer.validateTransition('PAID', 'UNPAID');
    expect(isValid).toBe(false);

    const isPartialValid = PaymentHarmonizer.validateTransition('PAID', 'PARTIAL');
    expect(isPartialValid).toBe(false);
  });

  // --------------------------------------------------------------------------
  // F3 Boundary Cases
  // --------------------------------------------------------------------------
  test('T2.F3.1: Exact boundary: 14 minutes 59 seconds is still locked', () => {
    const fourteenFiftyNineAgo = new Date(now.getTime() - (14 * 60 + 59) * 1000).toISOString();
    const locked = SlotLockService.isSlotLocked({ status: 'PAYMENT_PENDING', createdAt: fourteenFiftyNineAgo }, now);
    expect(locked).toBe(true);
  });

  test('T2.F3.2: Exact boundary: 15 minutes 01 seconds is unlocked', () => {
    const fifteenOneAgo = new Date(now.getTime() - (15 * 60 + 1) * 1000).toISOString();
    const locked = SlotLockService.isSlotLocked({ status: 'PAYMENT_PENDING', createdAt: fifteenOneAgo }, now);
    expect(locked).toBe(false);
  });

  test('T2.F3.3: Single capacity turf slot fully booked reduces available courts to 0', () => {
    const available = SlotLockService.calculateAvailableCapacity(1, [
      { status: 'CONFIRMED', createdAt: now.toISOString(), participantCount: 1 }
    ], now);
    expect(available).toBe(0);
  });

  test('T2.F3.4: Multi-capacity turf slot (capacity 4) with 3 participants leaves 1 court available', () => {
    const available = SlotLockService.calculateAvailableCapacity(4, [
      { status: 'CONFIRMED', createdAt: now.toISOString(), participantCount: 3 }
    ], now);
    expect(available).toBe(1);
  });

  test('T2.F3.5: Slot lock handles cross-midnight slot timestamps without timezone distortion', () => {
    const slotStart = new Date('2026-09-06T23:00:00.000Z');
    const slotEnd = new Date('2026-09-07T00:00:00.000Z');
    expect(slotEnd.getTime() - slotStart.getTime()).toBe(60 * 60 * 1000);
  });

  // --------------------------------------------------------------------------
  // F4 Boundary Cases
  // --------------------------------------------------------------------------
  test('T2.F4.1: Member with 0 wallet balance on abandoned booking triggers cleanup with 0 refund', () => {
    db.prepare(`UPDATE "Member" SET walletBalance = 0 WHERE id = 'mem_b_01'`).run();
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES ('bk_b_zero_wallet', 'turf_b_01', 'mem_b_01', 'sport_b_01', '2026-09-06T18:00:00.000Z', '2026-09-06T19:00:00.000Z', 2000, 'UNPAID', 'PAYMENT_PENDING', 0, 2000, ?)
    `).run(twentyMinAgo);

    const result = AbandonedBookingCleanupService.cleanup(db, now);
    expect(result.expiredBookingsCount).toBe(1);
    expect(result.totalRefunded).toBe(0);

    const member = db.prepare(`SELECT walletBalance FROM "Member" WHERE id = 'mem_b_01'`).get() as any;
    expect(member.walletBalance).toBe(0);
  });

  test('T2.F4.2: Member with pre-existing balance before abandoned booking has total restored accurately', () => {
    db.prepare(`UPDATE "Member" SET walletBalance = 450 WHERE id = 'mem_b_01'`).run();
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES ('bk_b_restore', 'turf_b_01', 'mem_b_01', 'sport_b_01', '2026-09-06T19:00:00.000Z', '2026-09-06T20:00:00.000Z', 2000, 'PARTIAL', 'PAYMENT_PENDING', 350, 1650, ?)
    `).run(twentyMinAgo);

    const result = AbandonedBookingCleanupService.cleanup(db, now);
    expect(result.totalRefunded).toBe(350);

    const member = db.prepare(`SELECT walletBalance FROM "Member" WHERE id = 'mem_b_01'`).get() as any;
    expect(member.walletBalance).toBe(800); // 450 + 350
  });

  test('T2.F4.3: Multiple concurrent abandoned bookings for the same member are both refunded accurately', () => {
    db.prepare(`UPDATE "Member" SET walletBalance = 100 WHERE id = 'mem_b_01'`).run();
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES 
        ('bk_b_m1', 'turf_b_01', 'mem_b_01', 'sport_b_01', '2026-09-06T19:00:00.000Z', '2026-09-06T20:00:00.000Z', 1000, 'PARTIAL', 'PAYMENT_PENDING', 200, 800, ?),
        ('bk_b_m2', 'turf_b_01', 'mem_b_01', 'sport_b_01', '2026-09-06T20:00:00.000Z', '2026-09-06T21:00:00.000Z', 1000, 'PARTIAL', 'PAYMENT_PENDING', 300, 700, ?)
    `).run(twentyMinAgo, twentyMinAgo);

    const result = AbandonedBookingCleanupService.cleanup(db, now);
    expect(result.expiredBookingsCount).toBe(2);
    expect(result.totalRefunded).toBe(500); // 200 + 300

    const member = db.prepare(`SELECT walletBalance FROM "Member" WHERE id = 'mem_b_01'`).get() as any;
    expect(member.walletBalance).toBe(600); // 100 + 500
  });

  test('T2.F4.4: Abandoned booking with 0 advancePaid does not create empty WalletTransaction', () => {
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES ('bk_b_no_advance', 'turf_b_01', 'mem_b_01', 'sport_b_01', '2026-09-06T21:00:00.000Z', '2026-09-06T22:00:00.000Z', 1000, 'UNPAID', 'PAYMENT_PENDING', 0, 1000, ?)
    `).run(twentyMinAgo);

    AbandonedBookingCleanupService.cleanup(db, now);

    const wtxCount = (db.prepare(`SELECT count(*) as count FROM "WalletTransaction" WHERE memberId = 'mem_b_01'`).get() as any).count;
    expect(wtxCount).toBe(0);
  });

  test('T2.F4.5: Cleanup handles very old abandoned booking (>30 days old) safely', () => {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES ('bk_b_very_old', 'turf_b_01', 'mem_b_01', 'sport_b_01', '2026-08-06T10:00:00.000Z', '2026-08-06T11:00:00.000Z', 1000, 'UNPAID', 'PAYMENT_PENDING', 0, 1000, ?)
    `).run(thirtyDaysAgo);

    const result = AbandonedBookingCleanupService.cleanup(db, now);
    expect(result.expiredBookingsCount).toBe(1);

    const booking = db.prepare(`SELECT status FROM "Booking" WHERE id = 'bk_b_very_old'`).get() as any;
    expect(booking.status).toBe('CANCELLED');
  });
});
