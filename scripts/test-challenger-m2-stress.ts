import { prisma } from '../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { POST as postDeviceToken, DELETE as deleteDeviceToken } from '../src/app/api/client/v1/notifications/device-token/route';
import { GET as getNotifications } from '../src/app/api/client/v1/notifications/route';
import { PATCH as patchRead } from '../src/app/api/client/v1/notifications/[id]/read/route';
import { POST as postMarkRead } from '../src/app/api/client/v1/notifications/mark-read/route';

async function runStress() {
  console.log('======================================================================');
  console.log('ADVERSARIAL STRESS HARNESS: CONCURRENCY, MALFORMED PARAMS & BOUNDARIES');
  console.log('======================================================================\n');

  const secret = process.env.NEXTAUTH_SECRET!;
  const timestamp = Date.now();
  const testMobile = `9777${timestamp.toString().slice(-6)}`;

  const member = await prisma.member.create({
    data: {
      name: 'Stress Test User',
      mobile: testMobile,
      email: `stress_${timestamp}@sportsvilla.test`,
      walletBalance: 0,
      loyaltyPoints: 0,
    },
  });

  const authToken = jwt.sign({ memberId: member.id, uid: member.mobile }, secret);
  const authHeaders = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  const stressTokens: string[] = [];

  try {
    // 1. Zero notifications edge-case
    console.log('Testing Zero Notifications boundary...');
    const zeroRes = await getNotifications(
      new Request('http://localhost:3000/api/client/v1/notifications', {
        method: 'GET',
        headers: authHeaders,
      }),
      {}
    );
    const zeroData = await zeroRes.json();
    if (zeroRes.status !== 200 || zeroData.unreadCount !== 0 || zeroData.notifications.length !== 0) {
      throw new Error(`Zero notifications failed: ${JSON.stringify(zeroData)}`);
    }
    console.log('[PASS] Zero notifications returns empty array and unreadCount: 0');

    // 2. Malformed query parameters for GET notifications
    console.log('Testing malformed pagination parameters...');
    const malformedRes = await getNotifications(
      new Request('http://localhost:3000/api/client/v1/notifications?take=invalid&skip=-99&page=-5', {
        method: 'GET',
        headers: authHeaders,
      }),
      {}
    );
    const malformedData = await malformedRes.json();
    if (malformedRes.status !== 200 || !Array.isArray(malformedData.notifications)) {
      throw new Error(`Malformed query params failed: ${JSON.stringify(malformedData)}`);
    }
    console.log('[PASS] Malformed query params gracefully sanitized (no 500 error)');

    // 3. Concurrent Upsert Burst: 20 simultaneous registrations for same token
    console.log('Testing Concurrent Upsert Burst (20 parallel requests for same token)...');
    const concurrentToken = `ExponentPushToken[concurrent_burst_${timestamp}]`;
    stressTokens.push(concurrentToken);

    const platforms = ['ios', 'android', 'web'];
    const burstPromises = Array.from({ length: 20 }, (_, i) => {
      const p = platforms[i % platforms.length];
      return postDeviceToken(
        new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ token: concurrentToken, platform: p }),
        }),
        {}
      );
    });

    const burstResults = await Promise.all(burstPromises);
    for (const res of burstResults) {
      if (res.status !== 200) {
        throw new Error(`Burst upsert returned non-200 status: ${res.status}`);
      }
    }

    const dbTokens = await prisma.deviceToken.findMany({
      where: { token: concurrentToken },
    });
    if (dbTokens.length !== 1) {
      throw new Error(`Race condition in upsert! Expected 1 token row, found ${dbTokens.length}`);
    }
    console.log(`[PASS] 20 concurrent upserts completed. Exactly 1 record preserved: platform=${dbTokens[0].platform}`);

    // 4. Concurrent Bulk Mark-Read Burst
    console.log('Testing Concurrent Bulk Mark-Read Burst...');
    // Create 10 unread notifications
    const createdNotifIds: string[] = [];
    for (let i = 0; i < 10; i++) {
      const n = await prisma.notification.create({
        data: {
          memberId: member.id,
          title: `Concurrent Notif ${i}`,
          body: `Body ${i}`,
          isRead: false,
        },
      });
      createdNotifIds.push(n.id);
    }

    // Fire 5 concurrent markAll requests
    const markBurstPromises = Array.from({ length: 5 }, () =>
      postMarkRead(
        new Request('http://localhost:3000/api/client/v1/notifications/mark-read', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ all: true }),
        }),
        {}
      )
    );

    const markBurstResults = await Promise.all(markBurstPromises);
    for (const res of markBurstResults) {
      if (res.status !== 200) {
        throw new Error(`Mark-all burst returned status: ${res.status}`);
      }
    }

    const unreadCountAfter = await prisma.notification.count({
      where: { memberId: member.id, isRead: false },
    });
    if (unreadCountAfter !== 0) {
      throw new Error(`Expected 0 unread notifications, found ${unreadCountAfter}`);
    }
    console.log('[PASS] Concurrent bulk mark-all succeeded idempotently');

    // 5. Invalid input boundary: non-array notificationIds in mark-read
    console.log('Testing mark-read validation errors...');
    const badMarkRes = await postMarkRead(
      new Request('http://localhost:3000/api/client/v1/notifications/mark-read', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ notificationIds: 'not-an-array' }),
      }),
      {}
    );
    if (badMarkRes.status !== 400) {
      throw new Error(`Expected 400 for invalid notificationIds, got ${badMarkRes.status}`);
    }
    console.log('[PASS] Invalid notificationIds payload returns 400 Bad Request');

    console.log('\n======================================================================');
    console.log('ALL ADVERSARIAL STRESS & BOUNDARY TESTS PASSED WITH 0 DEFECTS!');
    console.log('======================================================================\n');
  } finally {
    // Cleanup
    console.log('Cleaning up stress test data...');
    if (stressTokens.length > 0) {
      await prisma.deviceToken.deleteMany({ where: { token: { in: stressTokens } } });
    }
    await prisma.deviceToken.deleteMany({ where: { memberId: member.id } });
    await prisma.notification.deleteMany({ where: { memberId: member.id } });
    await prisma.member.delete({ where: { id: member.id } });
    console.log('Stress cleanup complete.');
    await prisma.$disconnect();
  }
}

runStress()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Stress test failed:', err);
    process.exit(1);
  });
