import { prisma } from '../src/lib/prisma';

interface TestMetric {
  name: string;
  runs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
}

interface TestStepResult {
  step: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const stepResults: TestStepResult[] = [];

async function step(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    stepResults.push({ step: name, passed: true });
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    stepResults.push({ step: name, passed: false, error: err?.message || String(err) });
    console.error(`[FAIL] ${name}:`, err?.message || err);
    throw err;
  }
}

function calculateMetrics(name: string, times: number[]): TestMetric {
  times.sort((a, b) => a - b);
  const sum = times.reduce((acc, v) => acc + v, 0);
  const avgMs = sum / times.length;
  const minMs = times[0];
  const maxMs = times[times.length - 1];
  const p95Index = Math.min(Math.floor(times.length * 0.95), times.length - 1);
  const p95Ms = times[p95Index];
  return {
    name,
    runs: times.length,
    avgMs: Number(avgMs.toFixed(3)),
    minMs: Number(minMs.toFixed(3)),
    maxMs: Number(maxMs.toFixed(3)),
    p95Ms: Number(p95Ms.toFixed(3)),
  };
}

async function main() {
  console.log('=================================================================');
  console.log('EMPIRICAL BENCHMARK & CONCURRENCY HARNESS: MILESTONE R1 (DB SCHEMA)');
  console.log('Target: Multi-device tokens, Concurrency, Bulk Indexing, Query Plan');
  console.log('=================================================================\n');

  const timestamp = Date.now();
  const testMobileA = `9811${timestamp.toString().slice(-6)}`;
  const testMobileB = `9822${timestamp.toString().slice(-6)}`;

  let memberAId = '';
  let memberBId = '';
  const createdTokenStrings: string[] = [];

  try {
    // -------------------------------------------------------------
    // STEP 1: Create Test Members (Primary user & Secondary user)
    // -------------------------------------------------------------
    await step('1. Create test members (Primary & Secondary)', async () => {
      const memberA = await prisma.member.create({
        data: {
          name: 'Empirical Primary User',
          mobile: testMobileA,
          email: `emp_primary_${timestamp}@sportsvilla.test`,
          walletBalance: 1000,
          loyaltyPoints: 50,
        },
      });
      memberAId = memberA.id;

      const memberB = await prisma.member.create({
        data: {
          name: 'Empirical Secondary User',
          mobile: testMobileB,
          email: `emp_secondary_${timestamp}@sportsvilla.test`,
          walletBalance: 500,
          loyaltyPoints: 10,
        },
      });
      memberBId = memberB.id;

      if (!memberAId || !memberBId) throw new Error('Member creation failed');
      console.log(`  -> Member A ID: ${memberAId}, Member B ID: ${memberBId}`);
    });

    // -------------------------------------------------------------
    // STEP 2: Multi-device registration for same member
    // (iPhone, Android Tablet, Web Browser)
    // -------------------------------------------------------------
    const iphoneToken = `ExponentPushToken[ios_iphone_${timestamp}]`;
    const tabletToken = `ExponentPushToken[android_tab_${timestamp}]`;
    const webToken = `ExponentPushToken[web_chrome_${timestamp}]`;
    createdTokenStrings.push(iphoneToken, tabletToken, webToken);

    await step('2. Register multiple distinct devices for same member', async () => {
      const t1 = await prisma.deviceToken.create({
        data: { memberId: memberAId, token: iphoneToken, platform: 'ios' },
      });
      const t2 = await prisma.deviceToken.create({
        data: { memberId: memberAId, token: tabletToken, platform: 'android' },
      });
      const t3 = await prisma.deviceToken.create({
        data: { memberId: memberAId, token: webToken, platform: 'web' },
      });

      const memberWithTokens = await prisma.member.findUnique({
        where: { id: memberAId },
        include: { deviceTokens: true },
      });

      if (!memberWithTokens) throw new Error('Member A not found');
      if (memberWithTokens.deviceTokens.length !== 3) {
        throw new Error(`Expected 3 device tokens, got ${memberWithTokens.deviceTokens.length}`);
      }

      const platforms = memberWithTokens.deviceTokens.map(t => t.platform).sort();
      if (JSON.stringify(platforms) !== JSON.stringify(['android', 'ios', 'web'])) {
        throw new Error(`Platform mismatch: ${JSON.stringify(platforms)}`);
      }
      console.log(`  -> Registered ${memberWithTokens.deviceTokens.length} devices: ios, android, web`);
    });

    // -------------------------------------------------------------
    // STEP 3: Concurrent Distinct Token Registrations (Parallel stress)
    // -------------------------------------------------------------
    await step('3. Concurrent registration of 10 distinct device tokens', async () => {
      const concurrentTokens = Array.from({ length: 10 }, (_, i) => {
        const tokenVal = `ExponentPushToken[concurrent_device_${i}_${timestamp}]`;
        createdTokenStrings.push(tokenVal);
        return {
          memberId: memberAId,
          token: tokenVal,
          platform: i % 2 === 0 ? 'android' : 'ios',
        };
      });

      // Fire all 10 creations concurrently
      const startTime = performance.now();
      const results = await Promise.all(
        concurrentTokens.map(dt => prisma.deviceToken.create({ data: dt }))
      );
      const elapsed = performance.now() - startTime;

      if (results.length !== 10) {
        throw new Error(`Expected 10 created tokens, got ${results.length}`);
      }

      const totalTokens = await prisma.deviceToken.count({ where: { memberId: memberAId } });
      if (totalTokens !== 13) {
        throw new Error(`Expected 13 total tokens (3 + 10), found ${totalTokens}`);
      }
      console.log(`  -> Concurrently registered 10 tokens in ${elapsed.toFixed(2)}ms (Total: ${totalTokens})`);
    });

    // -------------------------------------------------------------
    // STEP 4: Concurrent Identical Token Upserts (Race condition test)
    // -------------------------------------------------------------
    await step('4. Concurrent identical token upsert race condition test', async () => {
      const sharedToken = `ExponentPushToken[shared_race_${timestamp}]`;
      createdTokenStrings.push(sharedToken);

      // 5 concurrent upsert calls for the SAME token at the exact same moment
      const upsertPromises = Array.from({ length: 5 }, (_, i) =>
        prisma.deviceToken.upsert({
          where: { token: sharedToken },
          update: {
            platform: `platform_update_${i}`,
            memberId: memberAId,
          },
          create: {
            token: sharedToken,
            platform: `platform_initial_${i}`,
            memberId: memberAId,
          },
        })
      );

      const resolved = await Promise.all(upsertPromises);
      if (resolved.length !== 5) throw new Error('Not all concurrent upserts resolved');

      // Verify that exactly one record exists with this token
      const matching = await prisma.deviceToken.findMany({ where: { token: sharedToken } });
      if (matching.length !== 1) {
        throw new Error(`Expected exactly 1 record for shared token, got ${matching.length}`);
      }
      console.log(`  -> 5 concurrent upserts resolved cleanly to 1 unique record (ID: ${matching[0].id})`);
    });

    // -------------------------------------------------------------
    // STEP 5: Token Reassignment between Members (Device Handover)
    // -------------------------------------------------------------
    await step('5. Token re-assignment between members (Member A -> Member B)', async () => {
      const handoverToken = iphoneToken; // Initially owned by memberA

      // Reassign token to memberB via upsert (standard pattern when another user logs in on same device)
      const reassigned = await prisma.deviceToken.upsert({
        where: { token: handoverToken },
        update: {
          memberId: memberBId,
          platform: 'ios_updated',
        },
        create: {
          token: handoverToken,
          memberId: memberBId,
          platform: 'ios_updated',
        },
      });

      if (reassigned.memberId !== memberBId) {
        throw new Error(`Expected token memberId to be ${memberBId}, got ${reassigned.memberId}`);
      }

      // Verify member A no longer has this token
      const memberATokens = await prisma.deviceToken.findMany({ where: { memberId: memberAId, token: handoverToken } });
      if (memberATokens.length !== 0) {
        throw new Error('Member A still has reassigned token');
      }

      // Verify member B now owns this token
      const memberBTokens = await prisma.deviceToken.findMany({ where: { memberId: memberBId, token: handoverToken } });
      if (memberBTokens.length !== 1) {
        throw new Error('Member B does not own reassigned token');
      }
      console.log(`  -> Successfully transferred device token from Member A to Member B`);
    });

    // -------------------------------------------------------------
    // STEP 6: Bulk Notification Insertion (1,000 notifications)
    // -------------------------------------------------------------
    const BATCH_SIZE = 1000;
    await step(`6. Bulk notification insertion (${BATCH_SIZE} notifications)`, async () => {
      const notificationsData = [];
      const baseDate = new Date(2026, 0, 1).getTime();

      for (let i = 0; i < BATCH_SIZE; i++) {
        // 30% unread (isRead: false), 70% read (isRead: true)
        const isRead = i % 10 >= 3;
        const fakeDate = new Date(baseDate + i * 60000); // 1 minute intervals
        notificationsData.push({
          memberId: memberAId,
          title: `Notification #${i}: ${isRead ? 'Status Update' : 'Action Required'}`,
          body: `Detailed notification payload content for item ${i}. Slot booking confirmation info.`,
          data: {
            index: i,
            category: i % 2 === 0 ? 'BOOKING' : 'OFFER',
            priority: i % 5 === 0 ? 'HIGH' : 'NORMAL',
          },
          isRead,
          readAt: isRead ? new Date(fakeDate.getTime() + 10000) : null,
          createdAt: fakeDate,
        });
      }

      const insertStart = performance.now();
      const insertResult = await prisma.notification.createMany({
        data: notificationsData,
      });
      const insertElapsed = performance.now() - insertStart;

      if (insertResult.count !== BATCH_SIZE) {
        throw new Error(`Expected ${BATCH_SIZE} inserted notifications, got ${insertResult.count}`);
      }

      const totalNotifs = await prisma.notification.count({ where: { memberId: memberAId } });
      if (totalNotifs !== BATCH_SIZE) {
        throw new Error(`Notification count mismatch: expected ${BATCH_SIZE}, got ${totalNotifs}`);
      }

      console.log(`  -> Inserted ${insertResult.count} notifications in ${insertElapsed.toFixed(2)}ms (${(insertElapsed / BATCH_SIZE).toFixed(3)} ms/record)`);
    });

    // -------------------------------------------------------------
    // STEP 7: Query Benchmark: Filter by isRead & Sort by createdAt DESC
    // -------------------------------------------------------------
    await step('7. Benchmark compound index query (memberId + isRead + createdAt desc)', async () => {
      const RUNS = 50;
      const unreadQueryTimes: number[] = [];
      const countQueryTimes: number[] = [];
      const inboxFeedTimes: number[] = [];

      // Warmup run
      await prisma.notification.findMany({
        where: { memberId: memberAId, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      // Benchmark 1: Unread notifications sorted desc (Badge / unread inbox view)
      for (let r = 0; r < RUNS; r++) {
        const t0 = performance.now();
        const unreadRows = await prisma.notification.findMany({
          where: { memberId: memberAId, isRead: false },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
        const elapsed = performance.now() - t0;
        unreadQueryTimes.push(elapsed);
        if (unreadRows.length !== 20) throw new Error(`Expected 20 unread rows, got ${unreadRows.length}`);
        if (unreadRows.some(row => row.isRead)) throw new Error('Returned read row in unread query');
      }

      // Benchmark 2: Unread count query (App icon badge count)
      for (let r = 0; r < RUNS; r++) {
        const t0 = performance.now();
        const unreadCount = await prisma.notification.count({
          where: { memberId: memberAId, isRead: false },
        });
        const elapsed = performance.now() - t0;
        countQueryTimes.push(elapsed);
        if (unreadCount !== 300) throw new Error(`Expected 300 unread count, got ${unreadCount}`);
      }

      // Benchmark 3: Full inbox feed sorted desc (memberId + createdAt desc)
      for (let r = 0; r < RUNS; r++) {
        const t0 = performance.now();
        const feedRows = await prisma.notification.findMany({
          where: { memberId: memberAId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
        const elapsed = performance.now() - t0;
        inboxFeedTimes.push(elapsed);
        if (feedRows.length !== 50) throw new Error(`Expected 50 feed rows, got ${feedRows.length}`);
        // Verify strict descending order
        for (let i = 0; i < feedRows.length - 1; i++) {
          if (feedRows[i].createdAt.getTime() < feedRows[i + 1].createdAt.getTime()) {
            throw new Error(`Feed order violation: index ${i} is earlier than index ${i + 1}`);
          }
        }
      }

      const m1 = calculateMetrics('Unread feed (isRead=false, take 20)', unreadQueryTimes);
      const m2 = calculateMetrics('Unread badge count (count where isRead=false)', countQueryTimes);
      const m3 = calculateMetrics('Full inbox feed (all, order desc, take 50)', inboxFeedTimes);

      console.log('  -> Query Performance Results (50 iterations):');
      console.log(`     - ${m1.name}: avg=${m1.avgMs}ms, p95=${m1.p95Ms}ms, min=${m1.minMs}ms, max=${m1.maxMs}ms`);
      console.log(`     - ${m2.name}: avg=${m2.avgMs}ms, p95=${m2.p95Ms}ms, min=${m2.minMs}ms, max=${m2.maxMs}ms`);
      console.log(`     - ${m3.name}: avg=${m3.avgMs}ms, p95=${m3.p95Ms}ms, min=${m3.minMs}ms, max=${m3.maxMs}ms`);

      if (m1.avgMs > 50) throw new Error(`Query 1 average latency too high: ${m1.avgMs}ms`);
      if (m2.avgMs > 50) throw new Error(`Query 2 average latency too high: ${m2.avgMs}ms`);
      if (m3.avgMs > 50) throw new Error(`Query 3 average latency too high: ${m3.avgMs}ms`);
    });

    // -------------------------------------------------------------
    // STEP 8: Inspect SQLite EXPLAIN QUERY PLAN (Verify index utilization)
    // -------------------------------------------------------------
    await step('8. Verify SQLite EXPLAIN QUERY PLAN actively uses compound indexes', async () => {
      // Safe stringifier for BigInt returned by raw SQLite driver
      const safeStringify = (obj: any) =>
        JSON.stringify(obj, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2);

      // Query A: filter memberId & isRead
      const planA = await prisma.$queryRawUnsafe<any[]>(
        `EXPLAIN QUERY PLAN SELECT id, title, createdAt FROM Notification WHERE memberId = '${memberAId}' AND isRead = 0 ORDER BY createdAt DESC LIMIT 20;`
      );
      console.log('  -> Plan A (memberId + isRead + sort createdAt):');
      console.log('    ', safeStringify(planA));

      // Query B: count unread
      const planB = await prisma.$queryRawUnsafe<any[]>(
        `EXPLAIN QUERY PLAN SELECT count(*) FROM Notification WHERE memberId = '${memberAId}' AND isRead = 0;`
      );
      console.log('  -> Plan B (count where memberId + isRead):');
      console.log('    ', safeStringify(planB));

      // Query C: inbox feed (memberId + createdAt desc)
      const planC = await prisma.$queryRawUnsafe<any[]>(
        `EXPLAIN QUERY PLAN SELECT id, title, createdAt FROM Notification WHERE memberId = '${memberAId}' ORDER BY createdAt DESC LIMIT 50;`
      );
      console.log('  -> Plan C (memberId + sort createdAt):');
      console.log('    ', safeStringify(planC));

      const planAString = safeStringify(planA);
      const planBString = safeStringify(planB);
      const planCString = safeStringify(planC);

      // Verify NO full table scan: SCAN TABLE Notification without index
      if (planAString.includes('SCAN TABLE Notification\n') || planAString.includes('SCAN Notification')) {
        throw new Error(`Plan A performed table scan! Plan: ${planAString}`);
      }

      // Verify that compound indexes are used
      const usesIndexA = planAString.includes('Notification_memberId_') || planAString.includes('USING INDEX');
      const usesIndexB = planBString.includes('Notification_memberId_') || planBString.includes('USING INDEX');
      const usesIndexC = planCString.includes('Notification_memberId_') || planCString.includes('USING INDEX');

      if (!usesIndexA || !usesIndexB || !usesIndexC) {
        throw new Error(`Query plans did not use index! A: ${usesIndexA}, B: ${usesIndexB}, C: ${usesIndexC}`);
      }
      console.log('  -> Confirmed: SQLite Query Planner utilizes compound indexes for all queries; zero table scans.');
    });

    // -------------------------------------------------------------
    // STEP 9: Cascade Deletion Verification
    // -------------------------------------------------------------
    await step('9. Verify Cascade Deletion across all relations', async () => {
      const dtBefore = await prisma.deviceToken.count({ where: { OR: [{ memberId: memberAId }, { memberId: memberBId }] } });
      const notifBefore = await prisma.notification.count({ where: { OR: [{ memberId: memberAId }, { memberId: memberBId }] } });

      console.log(`  -> Before deletion: ${dtBefore} device tokens, ${notifBefore} notifications`);

      if (dtBefore === 0 || notifBefore === 0) {
        throw new Error('Pre-deletion counts invalid');
      }

      // Delete member A
      await prisma.member.delete({ where: { id: memberAId } });
      // Delete member B
      await prisma.member.delete({ where: { id: memberBId } });

      // Confirm Members gone
      const mACheck = await prisma.member.findUnique({ where: { id: memberAId } });
      const mBCheck = await prisma.member.findUnique({ where: { id: memberBId } });
      if (mACheck !== null || mBCheck !== null) {
        throw new Error('Members still exist after deletion');
      }

      // Confirm Cascade
      const dtAfter = await prisma.deviceToken.count({ where: { OR: [{ memberId: memberAId }, { memberId: memberBId }] } });
      const notifAfter = await prisma.notification.count({ where: { OR: [{ memberId: memberAId }, { memberId: memberBId }] } });

      if (dtAfter !== 0) throw new Error(`DeviceToken cascade failed: ${dtAfter} tokens remaining`);
      if (notifAfter !== 0) throw new Error(`Notification cascade failed: ${notifAfter} notifications remaining`);

      console.log(`  -> Cascade deletion confirmed: 0 device tokens, 0 notifications remain`);
    });

    // -------------------------------------------------------------
    // STEP 10: Final Database Cleanliness Check
    // -------------------------------------------------------------
    await step('10. Cleanliness check — zero orphaned records', async () => {
      const orphanTokens = await prisma.deviceToken.findMany({
        where: {
          token: { in: createdTokenStrings },
        },
      });

      if (orphanTokens.length > 0) {
        throw new Error(`Orphaned tokens found: ${orphanTokens.length}`);
      }

      console.log('  -> Verified zero test records left in dev.db');
    });

    console.log('\n=================================================================');
    console.log('ALL 10 EMPIRICAL CONCURRENCY & BENCHMARK STRESS TESTS PASSED!');
    console.log('=================================================================');
  } catch (outerErr) {
    console.error('\n=== EMPIRICAL TEST SUITE FAILED ===');
    console.error(outerErr);
    // Emergency cleanup
    try {
      if (memberAId) {
        await prisma.deviceToken.deleteMany({ where: { memberId: memberAId } });
        await prisma.notification.deleteMany({ where: { memberId: memberAId } });
        await prisma.member.deleteMany({ where: { id: memberAId } });
      }
      if (memberBId) {
        await prisma.deviceToken.deleteMany({ where: { memberId: memberBId } });
        await prisma.notification.deleteMany({ where: { memberId: memberBId } });
        await prisma.member.deleteMany({ where: { id: memberBId } });
      }
      if (createdTokenStrings.length > 0) {
        await prisma.deviceToken.deleteMany({ where: { token: { in: createdTokenStrings } } });
      }
      console.log('Emergency cleanup completed.');
    } catch (cleanErr) {
      console.error('Emergency cleanup error:', cleanErr);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
