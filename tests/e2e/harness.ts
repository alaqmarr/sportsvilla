import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// ============================================================================
// Core Test Primitives & Assertion Engine
// ============================================================================

export interface TestResult {
  name: string;
  passed: boolean;
  error?: Error;
  durationMs: number;
}

export interface SuiteResult {
  name: string;
  results: TestResult[];
  passed: number;
  failed: number;
  durationMs: number;
}

type TestFn = () => void | Promise<void>;
type HookFn = () => void | Promise<void>;

interface TestCase {
  name: string;
  fn: TestFn;
}

interface TestSuite {
  name: string;
  tests: TestCase[];
  beforeEachHooks: HookFn[];
  afterEachHooks: HookFn[];
  beforeAllHooks: HookFn[];
  afterAllHooks: HookFn[];
}

class TestRegistry {
  private suites: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;
  private totalAssertions = 0;

  recordAssertion(): void {
    this.totalAssertions++;
  }

  getTotalAssertions(): number {
    return this.totalAssertions;
  }

  describe(name: string, fn: () => void): void {
    const suite: TestSuite = {
      name,
      tests: [],
      beforeEachHooks: [],
      afterEachHooks: [],
      beforeAllHooks: [],
      afterAllHooks: []
    };
    const prevSuite = this.currentSuite;
    this.currentSuite = suite;
    this.suites.push(suite);
    try {
      fn();
    } finally {
      this.currentSuite = prevSuite;
    }
  }

  test(name: string, fn: TestFn): void {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {
        this.test(name, fn);
      });
      return;
    }
    this.currentSuite.tests.push({ name, fn });
  }

  beforeEach(fn: HookFn): void {
    if (this.currentSuite) {
      this.currentSuite.beforeEachHooks.push(fn);
    }
  }

  afterEach(fn: HookFn): void {
    if (this.currentSuite) {
      this.currentSuite.afterEachHooks.push(fn);
    }
  }

  beforeAll(fn: HookFn): void {
    if (this.currentSuite) {
      this.currentSuite.beforeAllHooks.push(fn);
    }
  }

  afterAll(fn: HookFn): void {
    if (this.currentSuite) {
      this.currentSuite.afterAllHooks.push(fn);
    }
  }

  async runSuite(suite: TestSuite): Promise<SuiteResult> {
    const suiteStart = Date.now();
    const results: TestResult[] = [];
    let passed = 0;
    let failed = 0;

    for (const hook of suite.beforeAllHooks) {
      await hook();
    }

    for (const t of suite.tests) {
      for (const hook of suite.beforeEachHooks) {
        await hook();
      }

      const testStart = Date.now();
      try {
        await t.fn();
        results.push({
          name: t.name,
          passed: true,
          durationMs: Date.now() - testStart
        });
        passed++;
      } catch (err: any) {
        results.push({
          name: t.name,
          passed: false,
          error: err instanceof Error ? err : new Error(String(err)),
          durationMs: Date.now() - testStart
        });
        failed++;
      }

      for (const hook of suite.afterEachHooks) {
        await hook();
      }
    }

    for (const hook of suite.afterAllHooks) {
      await hook();
    }

    return {
      name: suite.name,
      results,
      passed,
      failed,
      durationMs: Date.now() - suiteStart
    };
  }

  async runAll(): Promise<{ suites: SuiteResult[]; totalPassed: number; totalFailed: number; totalDurationMs: number }> {
    const start = Date.now();
    const suiteResults: SuiteResult[] = [];
    let totalPassed = 0;
    let totalFailed = 0;

    for (const suite of this.suites) {
      const res = await this.runSuite(suite);
      suiteResults.push(res);
      totalPassed += res.passed;
      totalFailed += res.failed;
    }

    return {
      suites: suiteResults,
      totalPassed,
      totalFailed,
      totalDurationMs: Date.now() - start
    };
  }

  clear(): void {
    this.suites = [];
    this.currentSuite = null;
    this.totalAssertions = 0;
  }
}

export const registry = new TestRegistry();
export const describe = (name: string, fn: () => void) => registry.describe(name, fn);
export const test = (name: string, fn: TestFn) => registry.test(name, fn);
export const it = test;
export const beforeEach = (fn: HookFn) => registry.beforeEach(fn);
export const afterEach = (fn: HookFn) => registry.afterEach(fn);
export const beforeAll = (fn: HookFn) => registry.beforeAll(fn);
export const afterAll = (fn: HookFn) => registry.afterAll(fn);

// ============================================================================
// Expect & Assertion Engine
// ============================================================================

export function expect(actual: any) {
  registry.recordAssertion();

  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`AssertionError: Expected [${expected}] (type: ${typeof expected}), but got [${actual}] (type: ${typeof actual})`);
      }
    },
    toEqual(expected: any) {
      const actStr = JSON.stringify(actual);
      const expStr = JSON.stringify(expected);
      if (actStr !== expStr) {
        throw new Error(`AssertionError:\nExpected: ${expStr}\nReceived: ${actStr}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`AssertionError: Expected value to be defined, but got undefined`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`AssertionError: Expected null, but got [${actual}]`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`AssertionError: Expected truthy value, but got [${actual}]`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`AssertionError: Expected falsy value, but got [${actual}]`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`AssertionError: Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual < expected) {
        throw new Error(`AssertionError: Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (typeof actual !== 'number' || actual >= expected) {
        throw new Error(`AssertionError: Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual > expected) {
        throw new Error(`AssertionError: Expected ${actual} to be less than or equal to ${expected}`);
      }
    },
    toBeCloseTo(expected: number, precision: number = 2) {
      const diff = Math.abs(actual - expected);
      const tolerance = Math.pow(10, -precision) / 2;
      if (diff > tolerance) {
        throw new Error(`AssertionError: Expected ${actual} to be close to ${expected} (diff: ${diff} > tolerance: ${tolerance})`);
      }
    },
    toContain(expected: any) {
      if (typeof actual === 'string') {
        if (!actual.includes(String(expected))) {
          throw new Error(`AssertionError: Expected string "${actual}" to contain "${expected}"`);
        }
      } else if (Array.isArray(actual)) {
        if (!actual.includes(expected) && !actual.some(item => JSON.stringify(item) === JSON.stringify(expected))) {
          throw new Error(`AssertionError: Expected array to contain ${JSON.stringify(expected)}`);
        }
      } else {
        throw new Error(`AssertionError: toContain called on non-collection type: ${typeof actual}`);
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`AssertionError: Expected undefined, but got [${actual}]`);
      }
    },
    not: {
      toBe(expected: any) {
        if (actual === expected) {
          throw new Error(`AssertionError: Expected [${actual}] not to be [${expected}]`);
        }
      },
      toEqual(expected: any) {
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
          throw new Error(`AssertionError: Expected values not to be equal`);
        }
      },
      toBeNull() {
        if (actual === null) {
          throw new Error(`AssertionError: Expected not null, but got null`);
        }
      },
      toBeDefined() {
        if (actual !== undefined) {
          throw new Error(`AssertionError: Expected undefined, but got [${actual}]`);
        }
      },
      toBeUndefined() {
        if (actual === undefined) {
          throw new Error(`AssertionError: Expected defined value, but got undefined`);
        }
      },
      toContain(expected: any) {
        if (typeof actual === 'string') {
          if (actual.includes(String(expected))) {
            throw new Error(`AssertionError: Expected string "${actual}" not to contain "${expected}"`);
          }
        } else if (Array.isArray(actual)) {
          if (actual.includes(expected) || actual.some(item => JSON.stringify(item) === JSON.stringify(expected))) {
            throw new Error(`AssertionError: Expected array not to contain ${JSON.stringify(expected)}`);
          }
        }
      }
    },
    toThrow(expectedMessage?: string | RegExp) {
      if (typeof actual !== 'function') {
        throw new Error(`AssertionError: toThrow expected a function, but received ${typeof actual}`);
      }
      let threw = false;
      let errorThrown: any = null;
      try {
        actual();
      } catch (err: any) {
        threw = true;
        errorThrown = err;
      }
      if (!threw) {
        throw new Error(`AssertionError: Expected function to throw an error, but it did not`);
      }
      if (expectedMessage) {
        const msg = errorThrown?.message || String(errorThrown);
        if (typeof expectedMessage === 'string' && !msg.includes(expectedMessage)) {
          throw new Error(`AssertionError: Expected error message to include "${expectedMessage}", but got "${msg}"`);
        } else if (expectedMessage instanceof RegExp && !expectedMessage.test(msg)) {
          throw new Error(`AssertionError: Expected error message to match ${expectedMessage}, but got "${msg}"`);
        }
      }
    }
  };
}

// ============================================================================
// Database & Fixture Setup for E2E Tests
// ============================================================================

export class TestDatabase {
  private db: Database.Database;
  private dbPath: string;

  constructor(customPath?: string) {
    this.dbPath = customPath || path.resolve(__dirname, 'test_e2e.db');
    // Clean prior test database file if exists
    if (fs.existsSync(this.dbPath)) {
      try {
        fs.unlinkSync(this.dbPath);
      } catch {
        // ignore lock
      }
    }
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('busy_timeout = 5000');
    this.db.pragma('foreign_keys = ON');
    this.initSchema();
  }

  getDb(): Database.Database {
    return this.db;
  }

  initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS "Setting" (
        "key" TEXT NOT NULL PRIMARY KEY,
        "value" TEXT NOT NULL,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "FamilyGroup" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "mobile" TEXT NOT NULL UNIQUE,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Member" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "mobile" TEXT NOT NULL,
        "familyId" TEXT,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "dateOfBirth" DATETIME,
        "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
        "walletBalance" REAL NOT NULL DEFAULT 0,
        "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Member_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "FamilyGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Sport" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "rewardPointsPerCheckin" INTEGER NOT NULL DEFAULT 0,
        "iconPath" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Turf" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "location" TEXT,
        "parentTurfId" TEXT,
        "bookingPrice" REAL,
        "bookingDurationMinutes" INTEGER,
        "capacityPerSlot" INTEGER NOT NULL DEFAULT 1,
        "requireEntryVerification" BOOLEAN NOT NULL DEFAULT 0,
        "bookingValidityDays" INTEGER NOT NULL DEFAULT 0,
        "iconPath" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Turf_parentTurfId_fkey" FOREIGN KEY ("parentTurfId") REFERENCES "Turf" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "TurfSport" (
        "turfId" TEXT NOT NULL,
        "sportId" TEXT NOT NULL,
        PRIMARY KEY ("turfId", "sportId"),
        CONSTRAINT "TurfSport_turfId_fkey" FOREIGN KEY ("turfId") REFERENCES "Turf" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "TurfSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Booking" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "turfId" TEXT NOT NULL,
        "memberId" TEXT NOT NULL,
        "sportId" TEXT NOT NULL,
        "startTime" DATETIME NOT NULL,
        "endTime" DATETIME NOT NULL,
        "price" REAL NOT NULL,
        "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
        "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
        "participantCount" INTEGER NOT NULL DEFAULT 1,
        "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
        "inviteMaxCount" INTEGER,
        "inviteCode" TEXT,
        "pointsRedeemed" INTEGER NOT NULL DEFAULT 0,
        "discountAmount" REAL NOT NULL DEFAULT 0,
        "advancePaid" REAL NOT NULL DEFAULT 0,
        "amountDue" REAL NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Booking_turfId_fkey" FOREIGN KEY ("turfId") REFERENCES "Turf" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Booking_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Booking_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Payment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bookingId" TEXT NOT NULL,
        "amount" REAL NOT NULL,
        "method" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "WalletTransaction" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "memberId" TEXT NOT NULL,
        "amount" REAL NOT NULL,
        "type" TEXT NOT NULL,
        "description" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "WalletTransaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Otp" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "mobile" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "expiresAt" DATETIME NOT NULL,
        "attempts" INTEGER NOT NULL DEFAULT 0,
        "lockedUntil" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Ticket" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bookingId" TEXT NOT NULL,
        "qrCode" TEXT NOT NULL,
        "guestName" TEXT,
        "status" TEXT NOT NULL DEFAULT 'VALID',
        "usedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Ticket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "Admin" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "role" TEXT NOT NULL DEFAULT 'SUPERADMIN',
        "permissions" TEXT NOT NULL DEFAULT '',
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Feature F1: Unified Transaction Model (PROJECT.md contract)
      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bookingId" TEXT,
        "memberId" TEXT,
        "gateway" TEXT NOT NULL, -- 'RAZORPAY', 'PHONEPE', 'WALLET', 'MANUAL'
        "gatewayOrderId" TEXT,
        "gatewayPaymentId" TEXT,
        "gatewaySignature" TEXT,
        "amount" REAL NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'INR',
        "status" TEXT NOT NULL, -- 'PENDING', 'SUCCESS', 'FAILED', 'ABANDONED'
        "errorMessage" TEXT,
        "metadata" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Transaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Transaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      CREATE INDEX IF NOT EXISTS "Transaction_gateway_status_idx" ON "Transaction"("gateway", "status");
      CREATE INDEX IF NOT EXISTS "Transaction_bookingId_idx" ON "Transaction"("bookingId");
      CREATE INDEX IF NOT EXISTS "Transaction_memberId_idx" ON "Transaction"("memberId");
      CREATE INDEX IF NOT EXISTS "Transaction_createdAt_idx" ON "Transaction"("createdAt");
    `);
  }

  wipe(): void {
    this.db.exec(`
      DELETE FROM "Payment";
      DELETE FROM "WalletTransaction";
      DELETE FROM "Ticket";
      DELETE FROM "Transaction";
      DELETE FROM "Booking";
      DELETE FROM "TurfSport";
      DELETE FROM "Turf";
      DELETE FROM "Sport";
      DELETE FROM "Otp";
      DELETE FROM "Member";
      DELETE FROM "FamilyGroup";
      DELETE FROM "Admin";
      DELETE FROM "Setting";
    `);
  }

  close(): void {
    try {
      this.db.close();
    } catch {
      // ignore
    }
  }
}

export const sharedTestDb = new TestDatabase();

// ============================================================================
// Domain Contracts & Service Implementations Under Test
// ============================================================================

export interface TransactionRecord {
  id: string;
  bookingId: string | null;
  memberId: string | null;
  gateway: 'RAZORPAY' | 'PHONEPE' | 'WALLET' | 'MANUAL';
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  gatewaySignature?: string | null;
  amount: number; // in Rupees
  currency: string; // default "INR"
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'ABANDONED';
  errorMessage?: string | null;
  metadata?: string | null; // JSON string
  createdAt: string;
  updatedAt: string;
}

export type CreateTransactionInput = Omit<TransactionRecord, 'id' | 'createdAt' | 'updatedAt' | 'currency'> & {
  id?: string;
  currency?: string;
};

export class TransactionRepository {
  constructor(private db: Database.Database) {}

  create(record: CreateTransactionInput): TransactionRecord {
    const id = record.id || `tx_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO "Transaction" (
        id, bookingId, memberId, gateway, gatewayOrderId, gatewayPaymentId, 
        gatewaySignature, amount, currency, status, errorMessage, metadata, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      record.bookingId || null,
      record.memberId || null,
      record.gateway,
      record.gatewayOrderId || null,
      record.gatewayPaymentId || null,
      record.gatewaySignature || null,
      record.amount,
      record.currency || 'INR',
      record.status,
      record.errorMessage || null,
      record.metadata || null,
      now,
      now
    );

    return this.findById(id)!;
  }

  updateStatus(id: string, status: TransactionRecord['status'], opts?: { paymentId?: string; signature?: string; errorMessage?: string }): TransactionRecord {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE "Transaction" 
      SET status = ?, 
          gatewayPaymentId = COALESCE(?, gatewayPaymentId),
          gatewaySignature = COALESCE(?, gatewaySignature),
          errorMessage = COALESCE(?, errorMessage),
          updatedAt = ?
      WHERE id = ?
    `);
    stmt.run(status, opts?.paymentId || null, opts?.signature || null, opts?.errorMessage || null, now, id);
    return this.findById(id)!;
  }

  findById(id: string): TransactionRecord | null {
    const row = this.db.prepare(`SELECT * FROM "Transaction" WHERE id = ?`).get(id) as any;
    if (!row) return null;
    return row as TransactionRecord;
  }

  findByGateway(gateway: string): TransactionRecord[] {
    return this.db.prepare(`SELECT * FROM "Transaction" WHERE gateway = ? ORDER BY createdAt DESC`).all(gateway) as TransactionRecord[];
  }
}

export class PaymentHarmonizer {
  /**
   * Harmonizes status to canonical: UNPAID, PARTIAL, PAID
   */
  static deriveStatus(price: number, discountAmount: number = 0, advancePaid: number = 0): {
    paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
    advancePaid: number;
    amountDue: number;
  } {
    const payableTotal = Math.max(0, price - discountAmount);
    const validAdvance = Math.min(payableTotal, Math.max(0, advancePaid));
    const amountDue = Math.max(0, payableTotal - validAdvance);

    let paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
    if (payableTotal === 0 || amountDue === 0) {
      paymentStatus = 'PAID';
    } else if (validAdvance > 0) {
      paymentStatus = 'PARTIAL';
    } else {
      paymentStatus = 'UNPAID';
    }

    return {
      paymentStatus,
      advancePaid: validAdvance,
      amountDue
    };
  }

  static validateTransition(current: string, next: string): boolean {
    const valid = ['UNPAID', 'PARTIAL', 'PAID'];
    if (!valid.includes(current) || !valid.includes(next)) return false;
    if (current === 'PAID' && next !== 'PAID') return false; // Once paid, cannot go backwards
    if (current === 'UNPAID' && (next === 'PARTIAL' || next === 'PAID')) return true;
    if (current === 'PARTIAL' && next === 'PAID') return true;
    if (current === next) return true;
    return false;
  }
}

export class SlotLockService {
  static isSlotLocked(booking: { status: string; createdAt: string | Date }, now: Date = new Date()): boolean {
    if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
      return true;
    }
    if (booking.status === 'PAYMENT_PENDING') {
      const createdTime = new Date(booking.createdAt).getTime();
      const cutoff = now.getTime() - 15 * 60 * 1000;
      return createdTime > cutoff;
    }
    return false;
  }

  static calculateAvailableCapacity(
    turfCapacity: number,
    bookings: Array<{ status: string; createdAt: string | Date; participantCount?: number }>,
    now: Date = new Date()
  ): number {
    const lockedCount = bookings.reduce((sum, b) => {
      if (this.isSlotLocked(b, now)) {
        return sum + (b.participantCount || 1);
      }
      return sum;
    }, 0);
    return Math.max(0, turfCapacity - lockedCount);
  }
}

export class AbandonedBookingCleanupService {
  static cleanup(db: Database.Database, now: Date = new Date()): {
    expiredBookingsCount: number;
    totalRefunded: number;
  } {
    const cutoff = new Date(now.getTime() - 15 * 60 * 1000).toISOString();

    // 1. Find all expired PAYMENT_PENDING bookings
    const expiredBookings = db.prepare(`
      SELECT * FROM "Booking" 
      WHERE status = 'PAYMENT_PENDING' AND createdAt <= ?
    `).all(cutoff) as any[];

    let totalRefunded = 0;

    const cancelStmt = db.prepare(`UPDATE "Booking" SET status = 'CANCELLED', updatedAt = ? WHERE id = ?`);
    const updateMemberWalletStmt = db.prepare(`UPDATE "Member" SET walletBalance = walletBalance + ?, updatedAt = ? WHERE id = ?`);
    const createWalletTxStmt = db.prepare(`
      INSERT INTO "WalletTransaction" (id, memberId, amount, type, description, createdAt)
      VALUES (?, ?, ?, 'CREDIT', ?, ?)
    `);
    const abandonTxStmt = db.prepare(`
      UPDATE "Transaction" SET status = 'ABANDONED', updatedAt = ? WHERE bookingId = ? AND status = 'PENDING'
    `);

    for (const b of expiredBookings) {
      const nowIso = now.toISOString();
      cancelStmt.run(nowIso, b.id);

      // If advancePaid was used via wallet (or logged), refund it
      if (b.advancePaid > 0) {
        updateMemberWalletStmt.run(b.advancePaid, nowIso, b.memberId);
        const wTxId = `wtx_ref_${Math.random().toString(36).substring(2, 10)}`;
        createWalletTxStmt.run(
          wTxId,
          b.memberId,
          b.advancePaid,
          `Auto-refund for abandoned booking ${b.id}`,
          nowIso
        );
        totalRefunded += b.advancePaid;
      }

      abandonTxStmt.run(nowIso, b.id);
    }

    return {
      expiredBookingsCount: expiredBookings.length,
      totalRefunded
    };
  }
}

export class GatewayAnalyticsCalculator {
  static calculate(
    transactions: TransactionRecord[],
    gateway: 'RAZORPAY' | 'PHONEPE',
    timeRange: 'today' | '7d' | '30d' | '90d' | 'all' = 'all',
    now: Date = new Date()
  ) {
    let cutoff: Date | null = null;
    if (timeRange === 'today') {
      cutoff = new Date(now);
      cutoff.setHours(0, 0, 0, 0);
    } else if (timeRange === '7d') {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '90d') {
      cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    const filtered = transactions.filter(t => {
      if (t.gateway !== gateway) return false;
      if (!cutoff) return true;
      return new Date(t.createdAt) >= cutoff;
    });

    let totalVolume = 0;
    let failedVolume = 0;
    let totalSuccessCount = 0;
    let totalFailedCount = 0;
    let totalPendingCount = 0;

    const dailyTrendMap: Record<string, { date: string; volume: number; successCount: number; failedCount: number }> = {};

    for (const tx of filtered) {
      const dateKey = tx.createdAt.substring(0, 10);
      if (!dailyTrendMap[dateKey]) {
        dailyTrendMap[dateKey] = { date: dateKey, volume: 0, successCount: 0, failedCount: 0 };
      }

      if (tx.status === 'SUCCESS') {
        totalVolume += tx.amount;
        totalSuccessCount++;
        dailyTrendMap[dateKey].volume += tx.amount;
        dailyTrendMap[dateKey].successCount++;
      } else if (tx.status === 'FAILED') {
        failedVolume += tx.amount;
        totalFailedCount++;
        dailyTrendMap[dateKey].failedCount++;
      } else if (tx.status === 'PENDING') {
        totalPendingCount++;
      }
    }

    const totalDecided = totalSuccessCount + totalFailedCount;
    const successRate = totalDecided > 0 ? Math.round((totalSuccessCount / totalDecided) * 100) : 0;

    const trend = Object.values(dailyTrendMap).sort((a, b) => a.date.localeCompare(b.date));

    const statusDistribution = [
      { name: 'Success', value: totalSuccessCount, color: '#10B981' },
      { name: 'Failed', value: totalFailedCount, color: '#EF4444' },
      { name: 'Pending', value: totalPendingCount, color: '#F59E0B' }
    ];

    return {
      gateway,
      timeRange,
      totalVolume,
      totalSuccessCount,
      totalFailedCount,
      totalPendingCount,
      successRate,
      failedVolume,
      trend,
      statusDistribution
    };
  }
}

export class RBACRouter {
  static canViewPage(
    admin: { role?: string; permissions?: string; isActive?: boolean } | null | undefined,
    pathname: string
  ): boolean {
    if (!admin || admin.isActive === false) return false;
    if (admin.role === 'SUPERADMIN') return true;

    // Normalization
    const cleanPath = pathname.split('?')[0].replace(/\/+$/, '') || '/';

    const userPerms = (admin.permissions || '')
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    const hasPerm = (key: string) => {
      if (key.startsWith('view:')) {
        const mod = key.replace('view:', '');
        return userPerms.includes(key) || userPerms.includes(`manage:${mod}`);
      }
      return userPerms.includes(key);
    };

    // Feature F5: Prioritize specific gateway analytics routes before generic "/admin"
    if (cleanPath.startsWith('/admin/razorpay') || cleanPath.startsWith('/admin/phonepe')) {
      return hasPerm('view:reports');
    }

    const routeMap: Record<string, string> = {
      '/calendar': 'view:calendar',
      '/bookings': 'view:bookings',
      '/checkin': 'view:checkin',
      '/attendance': 'view:attendance',
      '/tournaments': 'view:tournaments',
      '/members': 'view:members',
      '/wallets': 'view:wallets',
      '/plans': 'view:plans',
      '/coupons': 'view:coupons',
      '/banners': 'view:banners',
      '/loyalty': 'view:loyalty',
      '/sports': 'view:sports',
      '/turfs': 'view:turfs',
      '/whatsapp': 'view:whatsapp',
      '/reports': 'view:reports',
      '/settings': 'view:settings',
      '/admin': 'manage:admins'
    };

    for (const [prefix, perm] of Object.entries(routeMap)) {
      if (cleanPath === prefix || cleanPath.startsWith(prefix + '/')) {
        return hasPerm(perm);
      }
    }

    return true;
  }
}

export class WebUIFormatter {
  /**
   * Fixes the 100x wallet bug: always formats amount directly in Rupees.
   */
  static formatNavbarWallet(balance: number | null | undefined): string {
    const safeBalance = Number(balance || 0);
    return `₹${safeBalance}`;
  }

  static formatBadge(paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | string, advancePaid: number = 0, amountDue: number = 0): {
    label: string;
    color: 'green' | 'amber' | 'red' | 'gray';
  } {
    if (paymentStatus === 'PAID') {
      return { label: 'Paid', color: 'green' };
    }
    if (paymentStatus === 'PARTIAL') {
      return { label: `Partial (₹${advancePaid} Paid, ₹${amountDue} Due at Counter)`, color: 'amber' };
    }
    if (paymentStatus === 'UNPAID') {
      return { label: `Pay at Counter (₹${amountDue} Due)`, color: 'red' };
    }
    return { label: 'Unknown', color: 'gray' };
  }
}

export class WalletOtpManager {
  static generateOtp(mobile: string, db: Database.Database, now: Date = new Date()): string {
    // Generate 6-digit numeric OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
    const id = `otp_${mobile}_${now.getTime()}`;

    // Upsert or insert OTP
    const existing = db.prepare(`SELECT * FROM "Otp" WHERE mobile = ?`).get(mobile) as any;
    if (existing) {
      db.prepare(`UPDATE "Otp" SET code = ?, expiresAt = ?, attempts = 0, lockedUntil = NULL WHERE mobile = ?`).run(code, expiresAt, mobile);
    } else {
      db.prepare(`INSERT INTO "Otp" (id, mobile, code, expiresAt, attempts, createdAt) VALUES (?, ?, ?, ?, 0, ?)`).run(
        id, mobile, code, expiresAt, now.toISOString()
      );
    }
    return code;
  }

  static verifyOtp(mobile: string, code: string, db: Database.Database, now: Date = new Date()): { success: boolean; error?: string } {
    const otp = db.prepare(`SELECT * FROM "Otp" WHERE mobile = ?`).get(mobile) as any;
    if (!otp) {
      return { success: false, error: 'OTP not requested' };
    }

    if (otp.lockedUntil && new Date(otp.lockedUntil) > now) {
      return { success: false, error: 'Account temporarily locked due to excessive failed attempts' };
    }

    if (new Date(otp.expiresAt) < now) {
      return { success: false, error: 'OTP has expired' };
    }

    if (otp.code !== code) {
      const attempts = (otp.attempts || 0) + 1;
      let lockedUntil = null;
      if (attempts >= 5) {
        lockedUntil = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
      }
      db.prepare(`UPDATE "Otp" SET attempts = ?, lockedUntil = ? WHERE mobile = ?`).run(attempts, lockedUntil, mobile);
      return { success: false, error: 'Invalid OTP' };
    }

    // Success: consume OTP
    db.prepare(`DELETE FROM "Otp" WHERE mobile = ?`).run(mobile);
    return { success: true };
  }
}
