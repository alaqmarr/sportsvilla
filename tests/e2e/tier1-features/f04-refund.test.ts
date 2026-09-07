import { describe, test, expect, beforeEach, sharedTestDb, AbandonedBookingCleanupService, TransactionRepository } from '../harness';

describe('Tier 1 - Feature F4: Abandoned Payment Expiration & Wallet Auto-Refund', () => {
  const db = sharedTestDb.getDb();
  const txRepo = new TransactionRepository(db);
  const now = new Date('2026-09-06T14:00:00.000Z');

  beforeEach(() => {
    sharedTestDb.wipe();

    db.prepare(`
      INSERT INTO "Member" (id, mobile, name, walletBalance) 
      VALUES ('mem_004', '9876543213', 'Sneha Kapoor', 300)
    `).run();

    db.prepare(`
      INSERT INTO "Sport" (id, name) VALUES ('sport_04', 'Squash')
    `).run();

    db.prepare(`
      INSERT INTO "Turf" (id, name, bookingPrice, capacityPerSlot) 
      VALUES ('turf_04', 'Squash Court 1', 800, 1)
    `).run();
  });

  test('T1.4.1: Cleanup cancels PAYMENT_PENDING bookings older than 15 minutes', () => {
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES ('bk_abandoned_01', 'turf_04', 'mem_004', 'sport_04', '2026-09-06T16:00:00.000Z', '2026-09-06T17:00:00.000Z', 800, 'UNPAID', 'PAYMENT_PENDING', 0, 800, ?)
    `).run(twentyMinAgo);

    const result = AbandonedBookingCleanupService.cleanup(db, now);
    expect(result.expiredBookingsCount).toBe(1);

    const updatedBooking = db.prepare(`SELECT * FROM "Booking" WHERE id = 'bk_abandoned_01'`).get() as any;
    expect(updatedBooking.status).toBe('CANCELLED');
  });

  test('T1.4.2: Abandoned booking restores deducted wallet balance to member', () => {
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    // Member originally had 500, deducted 200 for advance, current balance = 300
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES ('bk_abandoned_wallet', 'turf_04', 'mem_004', 'sport_04', '2026-09-06T16:00:00.000Z', '2026-09-06T17:00:00.000Z', 800, 'PARTIAL', 'PAYMENT_PENDING', 200, 600, ?)
    `).run(twentyMinAgo);

    const result = AbandonedBookingCleanupService.cleanup(db, now);
    expect(result.totalRefunded).toBe(200);

    const member = db.prepare(`SELECT * FROM "Member" WHERE id = 'mem_004'`).get() as any;
    expect(member.walletBalance).toBe(500); // 300 + 200 restored
  });

  test('T1.4.3: Wallet refund generates WalletTransaction credit audit record', () => {
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES ('bk_abandoned_audit', 'turf_04', 'mem_004', 'sport_04', '2026-09-06T16:00:00.000Z', '2026-09-06T17:00:00.000Z', 800, 'PARTIAL', 'PAYMENT_PENDING', 150, 650, ?)
    `).run(twentyMinAgo);

    AbandonedBookingCleanupService.cleanup(db, now);

    const wtx = db.prepare(`SELECT * FROM "WalletTransaction" WHERE memberId = 'mem_004' ORDER BY createdAt DESC`).get() as any;
    expect(wtx).toBeDefined();
    expect(wtx.amount).toBe(150);
    expect(wtx.type).toBe('CREDIT');
    expect(wtx.description).toContain('Auto-refund for abandoned booking bk_abandoned_audit');
  });

  test('T1.4.4: Associated PENDING transaction record is transitioned to ABANDONED', () => {
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES ('bk_tx_abandon', 'turf_04', 'mem_004', 'sport_04', '2026-09-06T16:00:00.000Z', '2026-09-06T17:00:00.000Z', 800, 'UNPAID', 'PAYMENT_PENDING', 0, 800, ?)
    `).run(twentyMinAgo);

    const tx = txRepo.create({
      bookingId: 'bk_tx_abandon',
      memberId: 'mem_004',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'order_rzp_abandoned',
      gatewayPaymentId: null,
      amount: 800,
      status: 'PENDING'
    });

    AbandonedBookingCleanupService.cleanup(db, now);

    const updatedTx = txRepo.findById(tx.id);
    expect(updatedTx!.status).toBe('ABANDONED');
  });

  test('T1.4.5: Cleanup idempotency ensures re-runs do not issue duplicate refunds', () => {
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES ('bk_idempotent', 'turf_04', 'mem_004', 'sport_04', '2026-09-06T16:00:00.000Z', '2026-09-06T17:00:00.000Z', 800, 'PARTIAL', 'PAYMENT_PENDING', 250, 550, ?)
    `).run(twentyMinAgo);

    // First run refunds 250
    const run1 = AbandonedBookingCleanupService.cleanup(db, now);
    expect(run1.expiredBookingsCount).toBe(1);
    expect(run1.totalRefunded).toBe(250);

    const balanceAfterRun1 = (db.prepare(`SELECT walletBalance FROM "Member" WHERE id = 'mem_004'`).get() as any).walletBalance;
    expect(balanceAfterRun1).toBe(550); // 300 + 250

    // Second run (immediate re-trigger) finds 0 expired and refunds 0
    const run2 = AbandonedBookingCleanupService.cleanup(db, now);
    expect(run2.expiredBookingsCount).toBe(0);
    expect(run2.totalRefunded).toBe(0);

    const balanceAfterRun2 = (db.prepare(`SELECT walletBalance FROM "Member" WHERE id = 'mem_004'`).get() as any).walletBalance;
    expect(balanceAfterRun2).toBe(550); // Unchanged
  });
});
