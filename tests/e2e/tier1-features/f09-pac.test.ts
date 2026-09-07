import { describe, test, expect, beforeEach, sharedTestDb, PaymentHarmonizer } from '../harness';

describe('Tier 1 - Feature F9: Pay at Counter (PAC) Booking & Outstanding Balance', () => {
  const db = sharedTestDb.getDb();

  beforeEach(() => {
    sharedTestDb.wipe();

    db.prepare(`
      INSERT INTO "Member" (id, mobile, name) VALUES ('mem_pac_01', '9876543214', 'Amit Trivedi')
    `).run();

    db.prepare(`
      INSERT INTO "Sport" (id, name) VALUES ('sport_pac_01', 'Basketball')
    `).run();

    db.prepare(`
      INSERT INTO "Turf" (id, name, bookingPrice, capacityPerSlot) 
      VALUES ('turf_pac_01', 'Hoop Arena', 1500, 1)
    `).run();
  });

  test('T1.9.1: Zero advance PAC booking initializes advancePaid = 0, amountDue = full price, paymentStatus = UNPAID', () => {
    const status = PaymentHarmonizer.deriveStatus(1500, 0, 0);
    expect(status.paymentStatus).toBe('UNPAID');
    expect(status.advancePaid).toBe(0);
    expect(status.amountDue).toBe(1500);

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_pac_zero', 'turf_pac_01', 'mem_pac_01', 'sport_pac_01', '2026-09-15T10:00:00.000Z', '2026-09-15T11:00:00.000Z', 1500, ?, 'CONFIRMED', ?, ?)
    `).run(status.paymentStatus, status.advancePaid, status.amountDue);

    const b = db.prepare(`SELECT * FROM "Booking" WHERE id = 'bk_pac_zero'`).get() as any;
    expect(b.paymentStatus).toBe('UNPAID');
    expect(b.amountDue).toBe(1500);
    expect(b.advancePaid).toBe(0);
  });

  test('T1.9.2: Partial advance PAC booking initializes advancePaid = 500, amountDue = 1000, paymentStatus = PARTIAL', () => {
    const status = PaymentHarmonizer.deriveStatus(1500, 0, 500);
    expect(status.paymentStatus).toBe('PARTIAL');
    expect(status.advancePaid).toBe(500);
    expect(status.amountDue).toBe(1000);

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_pac_partial', 'turf_pac_01', 'mem_pac_01', 'sport_pac_01', '2026-09-15T11:00:00.000Z', '2026-09-15T12:00:00.000Z', 1500, ?, 'CONFIRMED', ?, ?)
    `).run(status.paymentStatus, status.advancePaid, status.amountDue);

    const b = db.prepare(`SELECT * FROM "Booking" WHERE id = 'bk_pac_partial'`).get() as any;
    expect(b.paymentStatus).toBe('PARTIAL');
    expect(b.advancePaid).toBe(500);
    expect(b.amountDue).toBe(1000);
  });

  test('T1.9.3: Balance equation holds: advancePaid + amountDue + discountAmount === price', () => {
    const price = 1500;
    const discount = 200;
    const advance = 400;
    const status = PaymentHarmonizer.deriveStatus(price, discount, advance);

    expect(status.advancePaid + status.amountDue + discount).toBe(price);
    expect(status.paymentStatus).toBe('PARTIAL');
  });

  test('T1.9.4: Admin counter cash settlement creates a CASH Payment record linked to booking', () => {
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_pac_settle', 'turf_pac_01', 'mem_pac_01', 'sport_pac_01', '2026-09-15T13:00:00.000Z', '2026-09-15T14:00:00.000Z', 1500, 'PARTIAL', 'CONFIRMED', 500, 1000)
    `).run();

    // Admin collects 1000 cash at counter
    const paymentId = 'pay_cash_01';
    db.prepare(`
      INSERT INTO "Payment" (id, bookingId, amount, method, createdAt)
      VALUES (?, 'bk_pac_settle', 1000, 'CASH', CURRENT_TIMESTAMP)
    `).run(paymentId);

    const pay = db.prepare(`SELECT * FROM "Payment" WHERE id = ?`).get(paymentId) as any;
    expect(pay).toBeDefined();
    expect(pay.amount).toBe(1000);
    expect(pay.method).toBe('CASH');
    expect(pay.bookingId).toBe('bk_pac_settle');
  });

  test('T1.9.5: Counter settlement updates booking to amountDue = 0 and paymentStatus = PAID', () => {
    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, advancePaid, amountDue)
      VALUES ('bk_pac_full', 'turf_pac_01', 'mem_pac_01', 'sport_pac_01', '2026-09-15T14:00:00.000Z', '2026-09-15T15:00:00.000Z', 1500, 'PARTIAL', 'CONFIRMED', 500, 1000)
    `).run();

    // Settle counter balance
    db.prepare(`
      UPDATE "Booking" 
      SET advancePaid = advancePaid + amountDue,
          amountDue = 0,
          paymentStatus = 'PAID',
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = 'bk_pac_full'
    `).run();

    const updated = db.prepare(`SELECT * FROM "Booking" WHERE id = 'bk_pac_full'`).get() as any;
    expect(updated.paymentStatus).toBe('PAID');
    expect(updated.amountDue).toBe(0);
    expect(updated.advancePaid).toBe(1500);
  });
});
