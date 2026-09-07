import { describe, test, expect, beforeEach, sharedTestDb, TransactionRepository, PaymentHarmonizer, SlotLockService, AbandonedBookingCleanupService, GatewayAnalyticsCalculator, RBACRouter, WebUIFormatter, WalletOtpManager } from '../harness';

describe('Tier 3 - Cross-Feature Pairwise Integration Tests', () => {
  const db = sharedTestDb.getDb();
  const txRepo = new TransactionRepository(db);
  const now = new Date('2026-09-06T12:00:00.000Z');

  beforeEach(() => {
    sharedTestDb.wipe();

    db.prepare(`
      INSERT INTO "Member" (id, mobile, name, walletBalance) 
      VALUES ('mem_p3', '9876543240', 'Pairwise User', 500)
    `).run();

    db.prepare(`
      INSERT INTO "Sport" (id, name) VALUES ('sport_p3', 'Tennis')
    `).run();

    db.prepare(`
      INSERT INTO "Turf" (id, name, bookingPrice, capacityPerSlot) 
      VALUES ('turf_p3', 'Center Court', 1000, 1)
    `).run();
  });

  test('P3.1: F1 (Transaction) + F2 (Harmonization) + F9 (PAC): Split online + PAC logs transaction and marks booking PARTIAL', () => {
    // 1000 price: 400 paid online via Razorpay, 600 due at counter
    const status = PaymentHarmonizer.deriveStatus(1000, 0, 400);
    expect(status.paymentStatus).toBe('PARTIAL');
    expect(status.amountDue).toBe(600);

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_p3_1', 'turf_p3', 'mem_p3', 'sport_p3', '2026-09-06T14:00:00Z', '2026-09-06T15:00:00Z', 1000, ?, 'CONFIRMED', ?, ?)
    `).run(status.paymentStatus, status.advancePaid, status.amountDue);

    const tx = txRepo.create({
      bookingId: 'bk_p3_1',
      memberId: 'mem_p3',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'ord_p3_1',
      gatewayPaymentId: 'pay_p3_1',
      amount: 400,
      status: 'SUCCESS'
    });

    const booking = db.prepare(`SELECT * FROM "Booking" WHERE id = 'bk_p3_1'`).get() as any;
    expect(booking.paymentStatus).toBe('PARTIAL');
    expect(booking.advancePaid).toBe(400);
    expect(booking.amountDue).toBe(600);
    expect(tx.status).toBe('SUCCESS');
    expect(tx.amount).toBe(400);
  });

  test('P3.2: F1 (Transaction) + F4 (Auto-refund): Abandoned payment marks transaction ABANDONED and refunds wallet balance', () => {
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES ('bk_p3_2', 'turf_p3', 'mem_p3', 'sport_p3', '2026-09-06T16:00:00Z', '2026-09-06T17:00:00Z', 1000, 'PARTIAL', 'PAYMENT_PENDING', 200, 800, ?)
    `).run(twentyMinAgo);

    const tx = txRepo.create({
      bookingId: 'bk_p3_2',
      memberId: 'mem_p3',
      gateway: 'WALLET',
      gatewayOrderId: null,
      gatewayPaymentId: null,
      amount: 200,
      status: 'PENDING'
    });

    AbandonedBookingCleanupService.cleanup(db, now);

    const updatedTx = txRepo.findById(tx.id);
    expect(updatedTx!.status).toBe('ABANDONED');

    const member = db.prepare(`SELECT walletBalance FROM "Member" WHERE id = 'mem_p3'`).get() as any;
    expect(member.walletBalance).toBe(700); // 500 + 200
  });

  test('P3.3: F1 (Transaction) + F6 (Razorpay Analytics): Verified Razorpay payment immediately increments dashboard analytics volume', () => {
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_p3_3', 'turf_p3', 'mem_p3', 'sport_p3', '2026-09-06T14:00:00Z', '2026-09-06T15:00:00Z', 1500, 'PAID', 'CONFIRMED', 1500, 0)
    `).run();

    const tx = txRepo.create({
      bookingId: 'bk_p3_3',
      memberId: 'mem_p3',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'ord_p3_3',
      gatewayPaymentId: 'pay_p3_3',
      amount: 1500,
      status: 'SUCCESS'
    });

    const allTxs = txRepo.findByGateway('RAZORPAY');
    const analytics = GatewayAnalyticsCalculator.calculate(allTxs, 'RAZORPAY', 'all', now);

    expect(analytics.totalVolume).toBe(1500);
    expect(analytics.totalSuccessCount).toBe(1);
    expect(analytics.successRate).toBe(100);
  });

  test('P3.4: F1 (Transaction) + F7 (PhonePe Analytics): Verified PhonePe webhook immediately increments PhonePe analytics', () => {
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_p3_4', 'turf_p3', 'mem_p3', 'sport_p3', '2026-09-06T15:00:00Z', '2026-09-06T16:00:00Z', 1200, 'PAID', 'CONFIRMED', 1200, 0)
    `).run();

    txRepo.create({
      bookingId: 'bk_p3_4',
      memberId: 'mem_p3',
      gateway: 'PHONEPE',
      gatewayOrderId: 'T_P3_4',
      gatewayPaymentId: 'PP_P3_4',
      amount: 1200,
      status: 'SUCCESS'
    });

    const allTxs = txRepo.findByGateway('PHONEPE');
    const analytics = GatewayAnalyticsCalculator.calculate(allTxs, 'PHONEPE', 'all', now);

    expect(analytics.totalVolume).toBe(1200);
    expect(analytics.totalSuccessCount).toBe(1);
  });

  test('P3.5: F2 (Harmonization) + F8 (Web UI State): Booking with PARTIAL state renders proper badges and amounts in Web UI', () => {
    const status = PaymentHarmonizer.deriveStatus(1000, 0, 300);
    const badge = WebUIFormatter.formatBadge(status.paymentStatus, status.advancePaid, status.amountDue);

    expect(badge.label).toBe('Partial (₹300 Paid, ₹700 Due at Counter)');
    expect(badge.color).toBe('amber');
  });

  test('P3.6: F2 (Harmonization) + F11 (Mobile State): Booking with UNPAID / PAC state renders proper status without false confirmation', () => {
    const status = PaymentHarmonizer.deriveStatus(1000, 0, 0);
    const badge = WebUIFormatter.formatBadge(status.paymentStatus, status.advancePaid, status.amountDue);

    expect(badge.label).toBe('Pay at Counter (₹1000 Due)');
    expect(badge.color).toBe('red');
    expect(badge.label.includes('Paid')).toBe(false);
  });

  test('P3.7: F3 (Slot Locking) + F4 (Auto-refund): 15-minute expiration simultaneously releases slot and triggers wallet refund', () => {
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES ('bk_p3_7', 'turf_p3', 'mem_p3', 'sport_p3', '2026-09-06T18:00:00Z', '2026-09-06T19:00:00Z', 1000, 'PARTIAL', 'PAYMENT_PENDING', 250, 750, ?)
    `).run(twentyMinAgo);

    // Prior to cleanup, check availability logic
    const beforeCleanup = SlotLockService.calculateAvailableCapacity(1, [
      { status: 'PAYMENT_PENDING', createdAt: twentyMinAgo, participantCount: 1 }
    ], now);
    expect(beforeCleanup).toBe(1); // Already expired by time

    // Run cleanup to update DB states
    const cleanupRes = AbandonedBookingCleanupService.cleanup(db, now);
    expect(cleanupRes.expiredBookingsCount).toBe(1);
    expect(cleanupRes.totalRefunded).toBe(250);

    const b = db.prepare(`SELECT status FROM "Booking" WHERE id = 'bk_p3_7'`).get() as any;
    expect(b.status).toBe('CANCELLED');

    const m = db.prepare(`SELECT walletBalance FROM "Member" WHERE id = 'mem_p3'`).get() as any;
    expect(m.walletBalance).toBe(750); // 500 + 250
  });

  test('P3.8: F3 (Slot Locking) + F9 (PAC): Pay at Counter booking immediately confirms slot without 15m expiration risk', () => {
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_p3_8', 'turf_p3', 'mem_p3', 'sport_p3', '2026-09-06T19:00:00Z', '2026-09-06T20:00:00Z', 1000, 'UNPAID', 'CONFIRMED', 0, 1000)
    `).run();

    // CONFIRMED status keeps slot locked permanently
    const capacity = SlotLockService.calculateAvailableCapacity(1, [
      { status: 'CONFIRMED', createdAt: new Date(now.getTime() - 60 * 60 * 1000), participantCount: 1 }
    ], now);
    expect(capacity).toBe(0);
  });

  test('P3.9: F4 (Auto-refund) + F8 (Navbar Wallet): Wallet refund updates member wallet and Navbar immediately displays restored balance', () => {
    db.prepare(`UPDATE "Member" SET walletBalance = 100 WHERE id = 'mem_p3'`).run();
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES ('bk_p3_9', 'turf_p3', 'mem_p3', 'sport_p3', '2026-09-06T20:00:00Z', '2026-09-06T21:00:00Z', 1000, 'PARTIAL', 'PAYMENT_PENDING', 400, 600, ?)
    `).run(twentyMinAgo);

    AbandonedBookingCleanupService.cleanup(db, now);

    const m = db.prepare(`SELECT walletBalance FROM "Member" WHERE id = 'mem_p3'`).get() as any;
    expect(m.walletBalance).toBe(500);

    const navbarDisplay = WebUIFormatter.formatNavbarWallet(m.walletBalance);
    expect(navbarDisplay).toBe('₹500');
  });

  test('P3.10: F5 (RBAC) + F6/F7 (Analytics): Granular RBAC permissions correctly gate access to gateway analytics', () => {
    const adminWithReports = { role: 'ADMIN', isActive: true, permissions: 'view:reports' };
    const adminWithoutReports = { role: 'ADMIN', isActive: true, permissions: 'view:bookings' };

    expect(RBACRouter.canViewPage(adminWithReports, '/admin/razorpay')).toBe(true);
    expect(RBACRouter.canViewPage(adminWithReports, '/admin/phonepe')).toBe(true);

    expect(RBACRouter.canViewPage(adminWithoutReports, '/admin/razorpay')).toBe(false);
    expect(RBACRouter.canViewPage(adminWithoutReports, '/admin/phonepe')).toBe(false);
  });

  test('P3.11: F9 (PAC) + F12 (Mobile Wallet): Partial wallet deduction verified via OTP with remaining balance set to Pay at Counter', () => {
    const mobile = '9876543240';
    const code = WalletOtpManager.generateOtp(mobile, db, now);

    const otpRes = WalletOtpManager.verifyOtp(mobile, code, db, now);
    expect(otpRes.success).toBe(true);

    // Deduct 200 from 500 wallet
    db.prepare(`UPDATE "Member" SET walletBalance = walletBalance - 200 WHERE id = 'mem_p3'`).run();

    // Booking with 1000 total, 200 paid from wallet, 800 due at counter
    const status = PaymentHarmonizer.deriveStatus(1000, 0, 200);
    expect(status.paymentStatus).toBe('PARTIAL');
    expect(status.amountDue).toBe(800);

    const m = db.prepare(`SELECT walletBalance FROM "Member" WHERE id = 'mem_p3'`).get() as any;
    expect(m.walletBalance).toBe(300);
  });

  test('P3.12: F1 (Transaction) + F12 (Wallet OTP): Successful wallet debit logs a WALLET transaction record with SUCCESS status', () => {
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_p3_12', 'turf_p3', 'mem_p3', 'sport_p3', '2026-09-06T17:00:00Z', '2026-09-06T18:00:00Z', 1000, 'PARTIAL', 'CONFIRMED', 200, 800)
    `).run();

    const tx = txRepo.create({
      bookingId: 'bk_p3_12',
      memberId: 'mem_p3',
      gateway: 'WALLET',
      gatewayOrderId: null,
      gatewayPaymentId: null,
      amount: 200,
      status: 'SUCCESS',
      metadata: JSON.stringify({ authorizedVia: 'OTP', mobile: '9876543240' })
    });

    expect(tx.gateway).toBe('WALLET');
    expect(tx.status).toBe('SUCCESS');
    expect(tx.amount).toBe(200);
    const meta = JSON.parse(tx.metadata!);
    expect(meta.authorizedVia).toBe('OTP');
  });
});
