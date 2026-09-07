import { describe, test, expect, beforeEach, sharedTestDb, TransactionRepository } from '../harness';

describe('Tier 1 - Feature F1: Unified Transaction Logging', () => {
  const db = sharedTestDb.getDb();
  const repo = new TransactionRepository(db);

  beforeEach(() => {
    sharedTestDb.wipe();

    // Seed test member and booking
    db.prepare(`
      INSERT INTO "Member" (id, mobile, name, walletBalance) 
      VALUES ('mem_001', '9876543210', 'Rahul Sharma', 500)
    `).run();

    db.prepare(`
      INSERT INTO "Sport" (id, name) VALUES ('sport_01', 'Badminton')
    `).run();

    db.prepare(`
      INSERT INTO "Turf" (id, name, bookingPrice, capacityPerSlot) 
      VALUES ('turf_01', 'Court A', 600, 1)
    `).run();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_001', 'turf_01', 'mem_001', 'sport_01', '2026-09-10T10:00:00.000Z', '2026-09-10T11:00:00.000Z', 600, 'PENDING', 'CONFIRMED', 0, 600)
    `).run();
  });

  test('T1.1.1: Creates RAZORPAY transaction with valid amounts, status PENDING and orderId', () => {
    const tx = repo.create({
      bookingId: 'bk_001',
      memberId: 'mem_001',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'order_rzp_999',
      gatewayPaymentId: null,
      amount: 600,
      currency: 'INR',
      status: 'PENDING'
    });

    expect(tx.id).toBeDefined();
    expect(tx.gateway).toBe('RAZORPAY');
    expect(tx.amount).toBe(600);
    expect(tx.currency).toBe('INR');
    expect(tx.status).toBe('PENDING');
    expect(tx.gatewayOrderId).toBe('order_rzp_999');
    expect(tx.bookingId).toBe('bk_001');
  });

  test('T1.1.2: Creates PHONEPE transaction and transitions status from PENDING to SUCCESS upon callback', () => {
    const tx = repo.create({
      bookingId: 'bk_001',
      memberId: 'mem_001',
      gateway: 'PHONEPE',
      gatewayOrderId: 'T_PHONEPE_123456',
      gatewayPaymentId: null,
      amount: 600,
      status: 'PENDING'
    });

    expect(tx.status).toBe('PENDING');

    const updated = repo.updateStatus(tx.id, 'SUCCESS', {
      paymentId: 'PP_PAY_98765',
      signature: 'sha256_mock_sig'
    });

    expect(updated.status).toBe('SUCCESS');
    expect(updated.gatewayPaymentId).toBe('PP_PAY_98765');
    expect(updated.gatewaySignature).toBe('sha256_mock_sig');
  });

  test('T1.1.3: Creates WALLET transaction linked to member and booking with exact deducted amount', () => {
    const tx = repo.create({
      bookingId: 'bk_001',
      memberId: 'mem_001',
      gateway: 'WALLET',
      gatewayOrderId: null,
      gatewayPaymentId: null,
      amount: 250,
      status: 'SUCCESS'
    });

    expect(tx.gateway).toBe('WALLET');
    expect(tx.amount).toBe(250);
    expect(tx.status).toBe('SUCCESS');
    expect(tx.memberId).toBe('mem_001');
  });

  test('T1.1.4: Creates MANUAL cash transaction for offline counter settlement', () => {
    const tx = repo.create({
      bookingId: 'bk_001',
      memberId: 'mem_001',
      gateway: 'MANUAL',
      gatewayOrderId: 'CASH_RECEIPT_01',
      gatewayPaymentId: null,
      amount: 600,
      status: 'SUCCESS',
      metadata: JSON.stringify({ collectedBy: 'Admin John', location: 'Reception Desk' })
    });

    expect(tx.gateway).toBe('MANUAL');
    expect(tx.status).toBe('SUCCESS');
    const meta = JSON.parse(tx.metadata!);
    expect(meta.collectedBy).toBe('Admin John');
  });

  test('T1.1.5: Serializes and retrieves complex gateway metadata and error message payload', () => {
    const errPayload = { code: 'BAD_REQUEST_ERROR', description: 'Payment failed due to bank timeout', step: 'payment_auth' };
    const tx = repo.create({
      bookingId: 'bk_001',
      memberId: 'mem_001',
      gateway: 'RAZORPAY',
      gatewayOrderId: 'order_failed_01',
      gatewayPaymentId: 'pay_fail_01',
      amount: 1200,
      status: 'FAILED',
      errorMessage: 'Payment authorization failed at bank',
      metadata: JSON.stringify(errPayload)
    });

    const retrieved = repo.findById(tx.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.status).toBe('FAILED');
    expect(retrieved!.errorMessage).toContain('Payment authorization failed');
    const parsed = JSON.parse(retrieved!.metadata!);
    expect(parsed.code).toBe('BAD_REQUEST_ERROR');
    expect(parsed.step).toBe('payment_auth');
  });
});
