import { describe, test, expect, beforeEach, sharedTestDb, PaymentHarmonizer } from '../harness';

describe('Tier 1 - Feature F2: Payment Status Harmonization', () => {
  const db = sharedTestDb.getDb();

  beforeEach(() => {
    sharedTestDb.wipe();

    db.prepare(`
      INSERT INTO "Member" (id, mobile, name, walletBalance) 
      VALUES ('mem_002', '9876543211', 'Pooja Verma', 1000)
    `).run();

    db.prepare(`
      INSERT INTO "Sport" (id, name) VALUES ('sport_02', 'Tennis')
    `).run();

    db.prepare(`
      INSERT INTO "Turf" (id, name, bookingPrice, capacityPerSlot) 
      VALUES ('turf_02', 'Clay Court 1', 1000, 1)
    `).run();
  });

  test('T1.2.1: Booking with 0 advance paid and full amount due has canonical paymentStatus UNPAID', () => {
    const result = PaymentHarmonizer.deriveStatus(1000, 0, 0);
    expect(result.paymentStatus).toBe('UNPAID');
    expect(result.advancePaid).toBe(0);
    expect(result.amountDue).toBe(1000);

    // Verify DB insertion with canonical status
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_unpaid_01', 'turf_02', 'mem_002', 'sport_02', '2026-09-12T10:00:00.000Z', '2026-09-12T11:00:00.000Z', 1000, ?, 'CONFIRMED', ?, ?)
    `).run(result.paymentStatus, result.advancePaid, result.amountDue);

    const booking = db.prepare(`SELECT * FROM "Booking" WHERE id = 'bk_unpaid_01'`).get() as any;
    expect(booking.paymentStatus).toBe('UNPAID');
    expect(booking.amountDue).toBe(1000);
  });

  test('T1.2.2: Booking with partial advance paid has canonical paymentStatus PARTIAL', () => {
    const result = PaymentHarmonizer.deriveStatus(1000, 0, 400);
    expect(result.paymentStatus).toBe('PARTIAL');
    expect(result.advancePaid).toBe(400);
    expect(result.amountDue).toBe(600);

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_partial_01', 'turf_02', 'mem_002', 'sport_02', '2026-09-12T11:00:00.000Z', '2026-09-12T12:00:00.000Z', 1000, ?, 'CONFIRMED', ?, ?)
    `).run(result.paymentStatus, result.advancePaid, result.amountDue);

    const booking = db.prepare(`SELECT * FROM "Booking" WHERE id = 'bk_partial_01'`).get() as any;
    expect(booking.paymentStatus).toBe('PARTIAL');
    expect(booking.advancePaid).toBe(400);
    expect(booking.amountDue).toBe(600);
  });

  test('T1.2.3: Booking with full advance paid has canonical paymentStatus PAID and zero amount due', () => {
    const result = PaymentHarmonizer.deriveStatus(1000, 0, 1000);
    expect(result.paymentStatus).toBe('PAID');
    expect(result.advancePaid).toBe(1000);
    expect(result.amountDue).toBe(0);

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_paid_01', 'turf_02', 'mem_002', 'sport_02', '2026-09-12T12:00:00.000Z', '2026-09-12T13:00:00.000Z', 1000, ?, 'CONFIRMED', ?, ?)
    `).run(result.paymentStatus, result.advancePaid, result.amountDue);

    const booking = db.prepare(`SELECT * FROM "Booking" WHERE id = 'bk_paid_01'`).get() as any;
    expect(booking.paymentStatus).toBe('PAID');
    expect(booking.amountDue).toBe(0);
  });

  test('T1.2.4: Payment transition from UNPAID to PARTIAL upon partial advance deposit', () => {
    // Initial UNPAID state
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_trans_01', 'turf_02', 'mem_002', 'sport_02', '2026-09-12T14:00:00.000Z', '2026-09-12T15:00:00.000Z', 1000, 'UNPAID', 'CONFIRMED', 0, 1000)
    `).run();

    const allowed = PaymentHarmonizer.validateTransition('UNPAID', 'PARTIAL');
    expect(allowed).toBe(true);

    // Apply partial payment of 300
    const newStatus = PaymentHarmonizer.deriveStatus(1000, 0, 300);
    db.prepare(`
      UPDATE "Booking" 
      SET paymentStatus = ?, advancePaid = ?, amountDue = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = 'bk_trans_01'
    `).run(newStatus.paymentStatus, newStatus.advancePaid, newStatus.amountDue);

    const updated = db.prepare(`SELECT * FROM "Booking" WHERE id = 'bk_trans_01'`).get() as any;
    expect(updated.paymentStatus).toBe('PARTIAL');
    expect(updated.advancePaid).toBe(300);
    expect(updated.amountDue).toBe(700);
  });

  test('T1.2.5: Payment transition from PARTIAL to PAID upon full balance settlement at counter', () => {
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_trans_02', 'turf_02', 'mem_002', 'sport_02', '2026-09-12T16:00:00.000Z', '2026-09-12T17:00:00.000Z', 1000, 'PARTIAL', 'CONFIRMED', 300, 700)
    `).run();

    const allowed = PaymentHarmonizer.validateTransition('PARTIAL', 'PAID');
    expect(allowed).toBe(true);

    // Pay the remaining 700
    const newStatus = PaymentHarmonizer.deriveStatus(1000, 0, 1000);
    db.prepare(`
      UPDATE "Booking" 
      SET paymentStatus = ?, advancePaid = ?, amountDue = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = 'bk_trans_02'
    `).run(newStatus.paymentStatus, newStatus.advancePaid, newStatus.amountDue);

    const updated = db.prepare(`SELECT * FROM "Booking" WHERE id = 'bk_trans_02'`).get() as any;
    expect(updated.paymentStatus).toBe('PAID');
    expect(updated.advancePaid).toBe(1000);
    expect(updated.amountDue).toBe(0);
  });
});
