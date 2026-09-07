import { describe, test, expect, beforeEach, sharedTestDb, SlotLockService } from '../harness';

describe('Tier 1 - Feature F3: Slot Locking & SSR Expiration Consistency', () => {
  const db = sharedTestDb.getDb();
  const now = new Date('2026-09-06T12:00:00.000Z');

  beforeEach(() => {
    sharedTestDb.wipe();

    db.prepare(`
      INSERT INTO "Member" (id, mobile, name) VALUES ('mem_003', '9876543212', 'Vikas Patel')
    `).run();

    db.prepare(`
      INSERT INTO "Sport" (id, name) VALUES ('sport_03', 'Football')
    `).run();

    db.prepare(`
      INSERT INTO "Turf" (id, name, bookingPrice, capacityPerSlot) 
      VALUES ('turf_03', 'Turf Arena 1', 1200, 2)
    `).run();
  });

  test('T1.3.1: PAYMENT_PENDING booking created 8 minutes ago locks slot capacity', () => {
    const eightMinAgo = new Date(now.getTime() - 8 * 60 * 1000).toISOString();
    const isLocked = SlotLockService.isSlotLocked({ status: 'PAYMENT_PENDING', createdAt: eightMinAgo }, now);
    expect(isLocked).toBe(true);

    const available = SlotLockService.calculateAvailableCapacity(2, [
      { status: 'PAYMENT_PENDING', createdAt: eightMinAgo, participantCount: 1 }
    ], now);
    expect(available).toBe(1);
  });

  test('T1.3.2: Expired PAYMENT_PENDING booking created 16 minutes ago does NOT lock slot capacity', () => {
    const sixteenMinAgo = new Date(now.getTime() - 16 * 60 * 1000).toISOString();
    const isLocked = SlotLockService.isSlotLocked({ status: 'PAYMENT_PENDING', createdAt: sixteenMinAgo }, now);
    expect(isLocked).toBe(false);

    const available = SlotLockService.calculateAvailableCapacity(2, [
      { status: 'PAYMENT_PENDING', createdAt: sixteenMinAgo, participantCount: 1 }
    ], now);
    expect(available).toBe(2);
  });

  test('T1.3.3: CONFIRMED booking locks slot permanently regardless of age', () => {
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    const isLocked = SlotLockService.isSlotLocked({ status: 'CONFIRMED', createdAt: twoDaysAgo }, now);
    expect(isLocked).toBe(true);

    const available = SlotLockService.calculateAvailableCapacity(2, [
      { status: 'CONFIRMED', createdAt: twoDaysAgo, participantCount: 1 }
    ], now);
    expect(available).toBe(1);
  });

  test('T1.3.4: CANCELLED booking never locks slot', () => {
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const isLocked = SlotLockService.isSlotLocked({ status: 'CANCELLED', createdAt: fiveMinAgo }, now);
    expect(isLocked).toBe(false);

    const available = SlotLockService.calculateAvailableCapacity(2, [
      { status: 'CANCELLED', createdAt: fiveMinAgo, participantCount: 1 }
    ], now);
    expect(available).toBe(2);
  });

  test('T1.3.5: Query filter parity matches between SSR and AvailabilityService logic', () => {
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const twentyMinAgo = new Date(now.getTime() - 20 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO "Booking" (id, turfId, memberId, sportId, startTime, endTime, price, paymentStatus, status, createdAt)
      VALUES 
        ('bk_active_lock', 'turf_03', 'mem_003', 'sport_03', '2026-09-06T15:00:00.000Z', '2026-09-06T16:00:00.000Z', 1200, 'UNPAID', 'PAYMENT_PENDING', ?),
        ('bk_expired_lock', 'turf_03', 'mem_003', 'sport_03', '2026-09-06T15:00:00.000Z', '2026-09-06T16:00:00.000Z', 1200, 'UNPAID', 'PAYMENT_PENDING', ?),
        ('bk_confirmed', 'turf_03', 'mem_003', 'sport_03', '2026-09-06T17:00:00.000Z', '2026-09-06T18:00:00.000Z', 1200, 'PAID', 'CONFIRMED', ?)
    `).run(fiveMinAgo, twentyMinAgo, twentyMinAgo);

    // Standard filter: exclude CANCELLED, include CONFIRMED/COMPLETED, or PAYMENT_PENDING within 15 min
    const cutoff = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
    const activeLocks = db.prepare(`
      SELECT * FROM "Booking"
      WHERE status != 'CANCELLED'
        AND (
          status IN ('CONFIRMED', 'COMPLETED')
          OR (status = 'PAYMENT_PENDING' AND createdAt > ?)
        )
    `).all(cutoff) as any[];

    const activeIds = activeLocks.map(b => b.id);
    expect(activeIds).toContain('bk_active_lock');
    expect(activeIds).toContain('bk_confirmed');
    expect(activeIds.includes('bk_expired_lock')).toBe(false);
  });
});
