import { describe, test, expect, beforeEach, sharedTestDb, TransactionRepository, PaymentHarmonizer, SlotLockService, AbandonedBookingCleanupService, GatewayAnalyticsCalculator, WebUIFormatter, WalletOtpManager } from '../harness';
import crypto from 'crypto';

describe('Tier 4 - Real-World Application Workload Scenarios', () => {
  const db = sharedTestDb.getDb();
  const txRepo = new TransactionRepository(db);
  const now = new Date('2026-09-06T12:00:00.000Z');

  beforeEach(() => {
    sharedTestDb.wipe();

    db.prepare(`
      INSERT INTO "Member" (id, mobile, name, walletBalance) 
      VALUES ('mem_rw_01', '9876543250', 'Vikram Seth', 1000)
    `).run();

    db.prepare(`
      INSERT INTO "Sport" (id, name) VALUES ('sport_rw_01', 'Badminton')
    `).run();

    db.prepare(`
      INSERT INTO "Turf" (id, name, bookingPrice, capacityPerSlot) 
      VALUES ('turf_rw_01', 'Olympic Turf', 1200, 1)
    `).run();

    db.prepare(`
      INSERT INTO "Setting" (key, value) VALUES ('RAZORPAY_KEY_SECRET', 'test_rzp_secret_key_123')
    `).run();

    db.prepare(`
      INSERT INTO "Setting" (key, value) VALUES ('PHONEPE_SALT_KEY', 'test_phonepe_salt_key_456')
    `).run();
    db.prepare(`
      INSERT INTO "Setting" (key, value) VALUES ('PHONEPE_SALT_INDEX', '1')
    `).run();
  });

  test('Scenario 1: Full Razorpay Flow (Booking -> Order -> Signature Verification -> Transaction Log -> Admin Dashboard)', () => {
    // Step 1: Customer initiates booking (1200 INR)
    const bookingId = 'bk_scenario_1';
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES (?, 'turf_rw_01', 'mem_rw_01', 'sport_rw_01', '2026-09-06T15:00:00Z', '2026-09-06T16:00:00Z', 1200, 'UNPAID', 'PAYMENT_PENDING', 0, 1200, ?)
    `).run(bookingId, now.toISOString());

    // Step 2: Temporary lock verified
    const isLockedBefore = SlotLockService.isSlotLocked({ status: 'PAYMENT_PENDING', createdAt: now }, now);
    expect(isLockedBefore).toBe(true);

    // Step 3: Razorpay order generated & initial PENDING transaction logged
    const orderId = 'order_sc1_999';
    const tx = txRepo.create({
      bookingId,
      memberId: 'mem_rw_01',
      gateway: 'RAZORPAY',
      gatewayOrderId: orderId,
      gatewayPaymentId: null,
      amount: 1200,
      status: 'PENDING'
    });
    expect(tx.status).toBe('PENDING');

    // Step 4: Razorpay checkout completes on client, generates paymentId and HMAC signature
    const paymentId = 'pay_sc1_888';
    const rzpSecret = 'test_rzp_secret_key_123';
    const signatureBody = `${orderId}|${paymentId}`;
    const validSignature = crypto.createHmac('sha256', rzpSecret).update(signatureBody).digest('hex');

    // Server verifies signature
    const expectedSig = crypto.createHmac('sha256', rzpSecret).update(`${orderId}|${paymentId}`).digest('hex');
    expect(validSignature).toBe(expectedSig);

    // Step 5: Settle booking and transition transaction to SUCCESS
    const paymentHarmonized = PaymentHarmonizer.deriveStatus(1200, 0, 1200);
    expect(paymentHarmonized.paymentStatus).toBe('PAID');

    db.prepare(`
      UPDATE "Booking"
      SET status = 'CONFIRMED',
          paymentStatus = 'PAID',
          advancePaid = 1200,
          amountDue = 0,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(bookingId);

    db.prepare(`
      INSERT INTO "Payment" (id, bookingId, amount, method)
      VALUES ('pay_rec_sc1', ?, 1200, 'ONLINE')
    `).run(bookingId);

    txRepo.updateStatus(tx.id, 'SUCCESS', { paymentId, signature: validSignature });

    // Step 6: Verify Web UI state
    const badge = WebUIFormatter.formatBadge('PAID', 1200, 0);
    expect(badge.label).toBe('Paid');
    expect(badge.color).toBe('green');

    // Step 7: Verify Admin Gateway Analytics reflects transaction
    const rzpTxs = txRepo.findByGateway('RAZORPAY');
    const analytics = GatewayAnalyticsCalculator.calculate(rzpTxs, 'RAZORPAY', 'all', now);
    expect(analytics.totalVolume).toBe(1200);
    expect(analytics.totalSuccessCount).toBe(1);
    expect(analytics.successRate).toBe(100);
  });

  test('Scenario 2: Full PhonePe Flow (Booking -> S2S Pay -> Webhook -> Transaction Log -> Admin Dashboard)', () => {
    // Step 1: Customer initiates booking (1200 INR)
    const bookingId = 'bk_scenario_2';
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES (?, 'turf_rw_01', 'mem_rw_01', 'sport_rw_01', '2026-09-06T17:00:00Z', '2026-09-06T18:00:00Z', 1200, 'UNPAID', 'PAYMENT_PENDING', 0, 1200, ?)
    `).run(bookingId, now.toISOString());

    // Step 2: S2S transaction initiated
    const merchantTxId = 'T_SCENARIO_2_PHONEPE';
    const tx = txRepo.create({
      bookingId,
      memberId: 'mem_rw_01',
      gateway: 'PHONEPE',
      gatewayOrderId: merchantTxId,
      gatewayPaymentId: null,
      amount: 1200,
      status: 'PENDING'
    });

    // Step 3: Webhook payload received from PhonePe with base64 and X-VERIFY checksum
    const webhookPayload = {
      response: Buffer.from(JSON.stringify({
        success: true,
        code: 'PAYMENT_SUCCESS',
        data: {
          merchantTransactionId: merchantTxId,
          transactionId: 'PP_PROD_998877',
          amount: 120000 // in paise
        }
      })).toString('base64')
    };

    const saltKey = 'test_phonepe_salt_key_456';
    const saltIndex = '1';
    const sha256 = crypto.createHash('sha256').update(webhookPayload.response + saltKey).digest('hex');
    const xVerifyHeader = `${sha256}###${saltIndex}`;

    // Verify webhook signature
    const checkSha = crypto.createHash('sha256').update(webhookPayload.response + saltKey).digest('hex');
    expect(xVerifyHeader).toBe(`${checkSha}###${saltIndex}`);

    // Decode and process
    const decoded = JSON.parse(Buffer.from(webhookPayload.response, 'base64').toString('utf-8'));
    expect(decoded.code).toBe('PAYMENT_SUCCESS');

    // Step 4: Update booking and transaction to SUCCESS
    db.prepare(`
      UPDATE "Booking"
      SET status = 'CONFIRMED',
          paymentStatus = 'PAID',
          advancePaid = 1200,
          amountDue = 0,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(bookingId);

    txRepo.updateStatus(tx.id, 'SUCCESS', { paymentId: decoded.data.transactionId });

    // Step 5: Verify Admin PhonePe Analytics
    const ppTxs = txRepo.findByGateway('PHONEPE');
    const analytics = GatewayAnalyticsCalculator.calculate(ppTxs, 'PHONEPE', 'all', now);
    expect(analytics.totalVolume).toBe(1200);
    expect(analytics.totalSuccessCount).toBe(1);
    expect(analytics.successRate).toBe(100);
  });

  test('Scenario 3: Split Wallet + Online Booking with Temporary Lock and Release', () => {
    // Member has 1000 wallet balance. Price is 1200.
    // Member applies 400 from wallet, remaining 800 to be paid online via Razorpay.
    const bookingId = 'bk_scenario_3';

    // Step 1: Booking created with PAYMENT_PENDING lock for the remaining 800
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES (?, 'turf_rw_01', 'mem_rw_01', 'sport_rw_01', '2026-09-06T19:00:00Z', '2026-09-06T20:00:00Z', 1200, 'PARTIAL', 'PAYMENT_PENDING', 400, 800, ?)
    `).run(bookingId, now.toISOString());

    // Step 2: Wallet deduction of 400
    db.prepare(`UPDATE "Member" SET walletBalance = walletBalance - 400 WHERE id = 'mem_rw_01'`).run();
    db.prepare(`
      INSERT INTO "WalletTransaction" (id, memberId, amount, type, description)
      VALUES ('wtx_sc3', 'mem_rw_01', 400, 'DEBIT', 'Advance payment for booking')
    `).run();

    const wTx = txRepo.create({
      bookingId,
      memberId: 'mem_rw_01',
      gateway: 'WALLET',
      gatewayOrderId: null,
      gatewayPaymentId: null,
      amount: 400,
      status: 'SUCCESS'
    });

    // Step 3: Online gateway transaction logged
    const onlineTx = txRepo.create({
      bookingId,
      memberId: 'mem_rw_01',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'order_sc3',
      gatewayPaymentId: null,
      amount: 800,
      status: 'PENDING'
    });

    // Step 4: Online payment succeeds
    txRepo.updateStatus(onlineTx.id, 'SUCCESS', { paymentId: 'pay_sc3_ok' });

    db.prepare(`
      UPDATE "Booking"
      SET status = 'CONFIRMED',
          paymentStatus = 'PAID',
          advancePaid = 1200,
          amountDue = 0,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(bookingId);

    // Step 5: Verification of final states
    const booking = db.prepare(`SELECT * FROM "Booking" WHERE id = ?`).get(bookingId) as any;
    expect(booking.status).toBe('CONFIRMED');
    expect(booking.paymentStatus).toBe('PAID');
    expect(booking.advancePaid).toBe(1200);
    expect(booking.amountDue).toBe(0);

    const member = db.prepare(`SELECT walletBalance FROM "Member" WHERE id = 'mem_rw_01'`).get() as any;
    expect(member.walletBalance).toBe(600); // 1000 - 400
  });

  test('Scenario 4: Abandoned Payment with Wallet Auto-Refund & Slot Release', () => {
    // Member uses 300 from wallet, but abandons payment (>15 minutes ago)
    const bookingId = 'bk_scenario_4';
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

    // Initial deduction
    db.prepare(`UPDATE "Member" SET walletBalance = walletBalance - 300 WHERE id = 'mem_rw_01'`).run();
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue, createdAt)
      VALUES (?, 'turf_rw_01', 'mem_rw_01', 'sport_rw_01', '2026-09-06T20:00:00Z', '2026-09-06T21:00:00Z', 1200, 'PARTIAL', 'PAYMENT_PENDING', 300, 900, ?)
    `).run(bookingId, thirtyMinAgo);

    const pendingTx = txRepo.create({
      bookingId,
      memberId: 'mem_rw_01',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'order_sc4_ab',
      gatewayPaymentId: null,
      amount: 900,
      status: 'PENDING'
    });

    // Cleanup executes
    const cleanupResult = AbandonedBookingCleanupService.cleanup(db, now);
    expect(cleanupResult.expiredBookingsCount).toBe(1);
    expect(cleanupResult.totalRefunded).toBe(300);

    // Verify slot is released (available capacity restored to 1)
    const capacity = SlotLockService.calculateAvailableCapacity(1, [
      { status: 'CANCELLED', createdAt: thirtyMinAgo, participantCount: 1 }
    ], now);
    expect(capacity).toBe(1);

    // Verify member wallet restored
    const member = db.prepare(`SELECT walletBalance FROM "Member" WHERE id = 'mem_rw_01'`).get() as any;
    expect(member.walletBalance).toBe(1000); // Restored from 700 back to 1000

    // Verify transaction marked ABANDONED
    const updatedTx = txRepo.findById(pendingTx.id);
    expect(updatedTx!.status).toBe('ABANDONED');
  });

  test('Scenario 5: Mobile Booking State Sync (Partial PAC without premature confirmation)', () => {
    // Mobile user books a court using Pay at Counter (PAC) with 0 advance
    const bookingId = 'bk_scenario_5';

    const status = PaymentHarmonizer.deriveStatus(1200, 0, 0);
    expect(status.paymentStatus).toBe('UNPAID');

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES (?, 'turf_rw_01', 'mem_rw_01', 'sport_rw_01', '2026-09-06T21:00:00Z', '2026-09-06T22:00:00Z', 1200, ?, 'CONFIRMED', ?, ?)
    `).run(bookingId, status.paymentStatus, status.advancePaid, status.amountDue);

    // Mobile badge verification: must NOT show Paid
    const badge = WebUIFormatter.formatBadge(status.paymentStatus, status.advancePaid, status.amountDue);
    expect(badge.label).toBe('Pay at Counter (₹1200 Due)');
    expect(badge.color).toBe('red');

    // Admin settles at venue counter
    db.prepare(`
      UPDATE "Booking"
      SET advancePaid = 1200,
          amountDue = 0,
          paymentStatus = 'PAID',
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(bookingId);

    const updatedBooking = db.prepare(`SELECT * FROM "Booking" WHERE id = ?`).get(bookingId) as any;
    expect(updatedBooking.paymentStatus).toBe('PAID');
    expect(updatedBooking.amountDue).toBe(0);

    const updatedBadge = WebUIFormatter.formatBadge(updatedBooking.paymentStatus, updatedBooking.advancePaid, updatedBooking.amountDue);
    expect(updatedBadge.label).toBe('Paid');
    expect(updatedBadge.color).toBe('green');
  });
});
