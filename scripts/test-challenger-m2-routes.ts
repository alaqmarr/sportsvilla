import { prisma } from '../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { POST as postDeviceToken, DELETE as deleteDeviceToken } from '../src/app/api/client/v1/notifications/device-token/route';
import { GET as getNotifications } from '../src/app/api/client/v1/notifications/route';
import { PATCH as patchRead } from '../src/app/api/client/v1/notifications/[id]/read/route';
import { POST as postMarkRead } from '../src/app/api/client/v1/notifications/mark-read/route';
import { sendPushNotification, sendPushNotificationToMember } from '../src/lib/notifications';

interface TestStep {
  name: string;
  fn: () => Promise<void>;
}

const passedSteps: string[] = [];
const failedSteps: { name: string; error: string }[] = [];

async function runStep(step: TestStep) {
  try {
    await step.fn();
    passedSteps.push(step.name);
    console.log(`[PASS] ${step.name}`);
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    failedSteps.push({ name: step.name, error: errorMsg });
    console.error(`[FAIL] ${step.name}: ${errorMsg}`);
    throw err;
  }
}

async function main() {
  console.log('======================================================================');
  console.log('EMPIRICAL CHALLENGER TEST SUITE: MILESTONE R2 NOTIFICATIONS & APIS');
  console.log('======================================================================\n');

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined in environment');
  }

  const timestamp = Date.now();
  const testMobileA = `9911${timestamp.toString().slice(-6)}`;
  const testMobileB = `9922${timestamp.toString().slice(-6)}`;

  let memberAId = '';
  let memberBId = '';
  let tokenA = '';
  let tokenB = '';

  const mockPushToken1 = `ExponentPushToken[mock_challenger_test_${timestamp}_1]`;
  const mockPushToken2 = `ExponentPushToken[mock_challenger_test_${timestamp}_2]`;
  const mockPushToken3 = `ExponentPushToken[mock_challenger_test_${timestamp}_3]`;

  try {
    // ------------------------------------------------------------------
    // STEP 0: Setup Test Members and Auth Tokens
    // ------------------------------------------------------------------
    await runStep({
      name: '0. Setup test members and generate valid JWTs',
      fn: async () => {
        const memberA = await prisma.member.create({
          data: {
            name: 'Challenger Test User A',
            mobile: testMobileA,
            email: `challenger_a_${timestamp}@sportsvilla.test`,
            walletBalance: 100,
            loyaltyPoints: 0,
          },
        });
        memberAId = memberA.id;

        const memberB = await prisma.member.create({
          data: {
            name: 'Challenger Test User B',
            mobile: testMobileB,
            email: `challenger_b_${timestamp}@sportsvilla.test`,
            walletBalance: 200,
            loyaltyPoints: 0,
          },
        });
        memberBId = memberB.id;

        tokenA = jwt.sign({ memberId: memberA.id, uid: memberA.mobile }, secret);
        tokenB = jwt.sign({ memberId: memberB.id, uid: memberB.mobile }, secret);

        if (!tokenA || !tokenB) throw new Error('JWT generation failed');
      },
    });

    // ------------------------------------------------------------------
    // STEP 1: Unauthenticated Calls Return 401
    // ------------------------------------------------------------------
    await runStep({
      name: '1. Unauthenticated calls return HTTP 401 Unauthorized',
      fn: async () => {
        // 1a. POST device-token without auth
        const postRes = await postDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: mockPushToken1, platform: 'android' }),
          }),
          {}
        );
        if (postRes.status !== 401) {
          throw new Error(`Expected 401 for unauth POST device-token, got ${postRes.status}`);
        }

        // 1b. GET notifications without auth
        const getRes = await getNotifications(
          new Request('http://localhost:3000/api/client/v1/notifications', {
            method: 'GET',
          }),
          {}
        );
        if (getRes.status !== 401) {
          throw new Error(`Expected 401 for unauth GET notifications, got ${getRes.status}`);
        }

        // 1c. DELETE device-token without auth
        const deleteRes = await deleteDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: mockPushToken1 }),
          }),
          {}
        );
        if (deleteRes.status !== 401) {
          throw new Error(`Expected 401 for unauth DELETE device-token, got ${deleteRes.status}`);
        }

        // 1d. Invalid / tampered Bearer token
        const tamperedRes = await postDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer invalid.tampered.token',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: mockPushToken1, platform: 'android' }),
          }),
          {}
        );
        if (tamperedRes.status !== 401) {
          throw new Error(`Expected 401 for tampered JWT, got ${tamperedRes.status}`);
        }
      },
    });

    // ------------------------------------------------------------------
    // STEP 2: Input Validation (Malformed / Non-Expo Tokens)
    // ------------------------------------------------------------------
    await runStep({
      name: '2. Input validation: reject invalid token formats with 400',
      fn: async () => {
        // Missing token
        const emptyRes = await postDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenA}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ platform: 'android' }),
          }),
          {}
        );
        if (emptyRes.status !== 400) {
          throw new Error(`Expected 400 for missing token, got ${emptyRes.status}`);
        }

        // Invalid token format (not ExponentPushToken)
        const invalidRes = await postDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenA}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: 'not-an-expo-token-12345', platform: 'android' }),
          }),
          {}
        );
        if (invalidRes.status !== 400) {
          throw new Error(`Expected 400 for invalid token format, got ${invalidRes.status}`);
        }
      },
    });

    // ------------------------------------------------------------------
    // STEP 3: Device Token Registration (POST)
    // ------------------------------------------------------------------
    await runStep({
      name: '3. Device token registration (POST with mock ExponentPushToken)',
      fn: async () => {
        const res = await postDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenA}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: mockPushToken1, platform: 'android' }),
          }),
          {}
        );

        if (res.status !== 200) {
          throw new Error(`Registration failed with status ${res.status}`);
        }

        const data = await res.json();
        if (!data.success || data.token !== mockPushToken1) {
          throw new Error(`Unexpected registration response: ${JSON.stringify(data)}`);
        }

        // Verify in Database
        const dbRecord = await prisma.deviceToken.findUnique({
          where: { token: mockPushToken1 },
        });

        if (!dbRecord) {
          throw new Error('DeviceToken not found in database after registration');
        }
        if (dbRecord.memberId !== memberAId) {
          throw new Error(`Expected memberId ${memberAId}, got ${dbRecord.memberId}`);
        }
        if (dbRecord.platform !== 'android') {
          throw new Error(`Expected platform android, got ${dbRecord.platform}`);
        }
      },
    });

    // ------------------------------------------------------------------
    // STEP 4: Idempotent Upsert with Updated Platform
    // ------------------------------------------------------------------
    await runStep({
      name: '4. Idempotent upsert with updated platform',
      fn: async () => {
        // Register same token with platform 'ios'
        const res = await postDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenA}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: mockPushToken1, platform: 'ios' }),
          }),
          {}
        );

        if (res.status !== 200) {
          throw new Error(`Upsert failed with status ${res.status}`);
        }

        const data = await res.json();
        if (!data.success) {
          throw new Error(`Unexpected upsert response: ${JSON.stringify(data)}`);
        }

        // Verify exactly 1 record exists in DB and platform is updated
        const records = await prisma.deviceToken.findMany({
          where: { token: mockPushToken1 },
        });

        if (records.length !== 1) {
          throw new Error(`Expected exactly 1 device token record, found ${records.length}`);
        }
        if (records[0].platform !== 'ios') {
          throw new Error(`Expected updated platform ios, got ${records[0].platform}`);
        }
        if (records[0].memberId !== memberAId) {
          throw new Error(`Expected memberId ${memberAId}, got ${records[0].memberId}`);
        }
      },
    });

    // ------------------------------------------------------------------
    // STEP 5: Token Reassignment Across Members (Device Handover)
    // ------------------------------------------------------------------
    await runStep({
      name: '5. Token reassignment: Member B registers same token',
      fn: async () => {
        const res = await postDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenB}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: mockPushToken1, platform: 'ios' }),
          }),
          {}
        );

        if (res.status !== 200) {
          throw new Error(`Reassignment failed with status ${res.status}`);
        }

        const records = await prisma.deviceToken.findMany({
          where: { token: mockPushToken1 },
        });

        if (records.length !== 1) {
          throw new Error(`Expected 1 record after reassignment, found ${records.length}`);
        }
        if (records[0].memberId !== memberBId) {
          throw new Error(`Token should now belong to Member B (${memberBId}), but belongs to ${records[0].memberId}`);
        }

        // Reassign back to Member A for subsequent tests
        await postDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenA}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: mockPushToken1, platform: 'android' }),
          }),
          {}
        );
      },
    });

    // ------------------------------------------------------------------
    // STEP 6: Fetching Notifications & unreadCount Accuracy
    // ------------------------------------------------------------------
    let notifA1Id = '';
    let notifA2Id = '';
    let notifA3Id = '';
    let notifBId = '';

    await runStep({
      name: '6. Fetching notifications returns accurate count and unreadCount',
      fn: async () => {
        // Create 3 notifications for Member A (2 unread, 1 read)
        const notif1 = await prisma.notification.create({
          data: {
            memberId: memberAId,
            title: 'Welcome to SportsVilla',
            body: 'Your account is active.',
            isRead: false,
          },
        });
        notifA1Id = notif1.id;

        const notif2 = await prisma.notification.create({
          data: {
            memberId: memberAId,
            title: 'Court Booking Confirmed',
            body: 'Turf A reserved for 6:00 PM.',
            isRead: false,
          },
        });
        notifA2Id = notif2.id;

        const notif3 = await prisma.notification.create({
          data: {
            memberId: memberAId,
            title: 'Special Offer',
            body: 'Flat 20% off weekend bookings.',
            isRead: true,
            readAt: new Date(),
          },
        });
        notifA3Id = notif3.id;

        // Create 1 unread notification for Member B (to verify isolation)
        const notifB = await prisma.notification.create({
          data: {
            memberId: memberBId,
            title: 'Member B Notification',
            body: 'Private notice for B.',
            isRead: false,
          },
        });
        notifBId = notifB.id;

        // Fetch notifications for Member A
        const getRes = await getNotifications(
          new Request('http://localhost:3000/api/client/v1/notifications', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${tokenA}` },
          }),
          {}
        );

        if (getRes.status !== 200) {
          throw new Error(`GET notifications returned status ${getRes.status}`);
        }

        const data = await getRes.json();
        if (!data.success) {
          throw new Error(`GET notifications returned success: false`);
        }

        // Verify count of Member A notifications
        if (data.notifications.length !== 3) {
          throw new Error(`Expected 3 notifications for Member A, got ${data.notifications.length}`);
        }

        // Verify unreadCount is exactly 2
        if (data.unreadCount !== 2) {
          throw new Error(`Expected unreadCount = 2, got ${data.unreadCount}`);
        }

        // Verify data isolation: none of Member B's notifications should be present
        const containsMemberB = data.notifications.some((n: any) => n.id === notifBId);
        if (containsMemberB) {
          throw new Error('Data leak! Member A received Member B notification');
        }

        // Test Pagination: take=2, skip=0
        const page1Res = await getNotifications(
          new Request('http://localhost:3000/api/client/v1/notifications?take=2&skip=0', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${tokenA}` },
          }),
          {}
        );
        const page1Data = await page1Res.json();
        if (page1Data.notifications.length !== 2) {
          throw new Error(`Pagination take=2 failed: expected 2, got ${page1Data.notifications.length}`);
        }
        if (page1Data.unreadCount !== 2) {
          throw new Error(`Pagination unreadCount mismatch: expected 2, got ${page1Data.unreadCount}`);
        }

        // Test Pagination: page=2, take=2
        const page2Res = await getNotifications(
          new Request('http://localhost:3000/api/client/v1/notifications?page=2&take=2', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${tokenA}` },
          }),
          {}
        );
        const page2Data = await page2Res.json();
        if (page2Data.notifications.length !== 1) {
          throw new Error(`Pagination page=2 failed: expected 1, got ${page2Data.notifications.length}`);
        }
      },
    });

    // ------------------------------------------------------------------
    // STEP 7: Single Notification Mark-Read & IDOR Guard
    // ------------------------------------------------------------------
    await runStep({
      name: '7. Single notification mark-as-read (PATCH) & IDOR protection',
      fn: async () => {
        // 7a. Legitimate mark as read by owner
        const patchRes = await patchRead(
          new Request(`http://localhost:3000/api/client/v1/notifications/${notifA1Id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${tokenA}` },
          }),
          { params: Promise.resolve({ id: notifA1Id }) }
        );

        if (patchRes.status !== 200) {
          throw new Error(`PATCH read returned status ${patchRes.status}`);
        }
        const patchData = await patchRes.json();
        if (!patchData.success) {
          throw new Error('PATCH read failed');
        }

        // Verify in DB
        const updated = await prisma.notification.findUnique({ where: { id: notifA1Id } });
        if (!updated?.isRead || !updated.readAt) {
          throw new Error('Notification was not updated to isRead: true in DB');
        }

        // Verify unreadCount updated
        const verifyCountRes = await getNotifications(
          new Request('http://localhost:3000/api/client/v1/notifications', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${tokenA}` },
          }),
          {}
        );
        const verifyData = await verifyCountRes.json();
        if (verifyData.unreadCount !== 1) {
          throw new Error(`Expected updated unreadCount = 1, got ${verifyData.unreadCount}`);
        }

        // 7b. IDOR Attack: Member A tries to mark Member B's notification
        const idorRes = await patchRead(
          new Request(`http://localhost:3000/api/client/v1/notifications/${notifBId}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${tokenA}` },
          }),
          { params: Promise.resolve({ id: notifBId }) }
        );

        if (idorRes.status !== 403) {
          throw new Error(`Expected 403 Forbidden for IDOR attempt, got ${idorRes.status}`);
        }

        // Verify Member B notification was NOT touched
        const checkB = await prisma.notification.findUnique({ where: { id: notifBId } });
        if (checkB?.isRead !== false) {
          throw new Error('VULNERABILITY: IDOR allowed Member A to mark Member B notification as read!');
        }
      },
    });

    // ------------------------------------------------------------------
    // STEP 8: Bulk Mark-Read & IDOR Scoping
    // ------------------------------------------------------------------
    await runStep({
      name: '8. Bulk mark-as-read (POST mark-read) with IDOR prevention',
      fn: async () => {
        // 8a. Member A tries to bulk mark Member B's notification
        const idorBulkRes = await postMarkRead(
          new Request('http://localhost:3000/api/client/v1/notifications/mark-read', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenA}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notificationIds: [notifBId] }),
          }),
          {}
        );
        const idorBulkData = await idorBulkRes.json();
        if (idorBulkData.markedCount !== 0) {
          throw new Error(`IDOR bulk leak: marked ${idorBulkData.markedCount} of Member B notifications`);
        }

        // 8b. Member A marks all unread
        const markAllRes = await postMarkRead(
          new Request('http://localhost:3000/api/client/v1/notifications/mark-read', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenA}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ all: true }),
          }),
          {}
        );
        const markAllData = await markAllRes.json();
        if (markAllData.markedCount !== 1) {
          throw new Error(`Expected markedCount = 1, got ${markAllData.markedCount}`);
        }

        // Verify unreadCount is now 0 for Member A
        const zeroUnreadRes = await getNotifications(
          new Request('http://localhost:3000/api/client/v1/notifications', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${tokenA}` },
          }),
          {}
        );
        const zeroData = await zeroUnreadRes.json();
        if (zeroData.unreadCount !== 0) {
          throw new Error(`Expected unreadCount = 0, got ${zeroData.unreadCount}`);
        }
      },
    });

    // ------------------------------------------------------------------
    // STEP 9: Device Token Deregistration (DELETE)
    // ------------------------------------------------------------------
    await runStep({
      name: '9. Device token deregistration (DELETE /notifications/device-token)',
      fn: async () => {
        // Register a dedicated token for deletion test
        await postDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenA}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: mockPushToken2, platform: 'ios' }),
          }),
          {}
        );

        // Verify token exists in DB
        const existsBefore = await prisma.deviceToken.findUnique({
          where: { token: mockPushToken2 },
        });
        if (!existsBefore) throw new Error('Setup token not found in DB');

        // Delete token as Member A
        const delRes = await deleteDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${tokenA}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: mockPushToken2 }),
          }),
          {}
        );

        if (delRes.status !== 200) {
          throw new Error(`DELETE returned status ${delRes.status}`);
        }
        const delData = await delRes.json();
        if (!delData.success) {
          throw new Error('DELETE returned success: false');
        }

        // Verify token is removed from database
        const existsAfter = await prisma.deviceToken.findUnique({
          where: { token: mockPushToken2 },
        });
        if (existsAfter !== null) {
          throw new Error('Device token was NOT deleted from database');
        }

        // Idempotent delete: calling DELETE again on non-existent token should return 200 without crashing
        const secondDelRes = await deleteDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${tokenA}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: mockPushToken2 }),
          }),
          {}
        );
        if (secondDelRes.status !== 200) {
          throw new Error(`Idempotent second DELETE returned status ${secondDelRes.status}`);
        }

        // Cross-member deletion isolation: Member A cannot delete Member B's token
        await postDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenB}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: mockPushToken3, platform: 'android' }),
          }),
          {}
        );

        // Member A attempts to delete Member B's token
        await deleteDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${tokenA}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: mockPushToken3 }),
          }),
          {}
        );

        // Verify Member B's token still exists in DB
        const bTokenStillExists = await prisma.deviceToken.findUnique({
          where: { token: mockPushToken3 },
        });
        if (!bTokenStillExists) {
          throw new Error('SECURITY VULNERABILITY: Member A was able to delete Member B device token!');
        }

        // Now Member B deregisters their own token
        await deleteDeviceToken(
          new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${tokenB}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: mockPushToken3 }),
          }),
          {}
        );
      },
    });

    // ------------------------------------------------------------------
    // STEP 10: Push Service Helper & Database Sync Verification
    // ------------------------------------------------------------------
    await runStep({
      name: '10. Push service helper (sendPushNotificationToMember with saveToDb)',
      fn: async () => {
        const pushRes = await sendPushNotificationToMember(
          memberAId,
          'Test Push Notification',
          'Testing database sync and push dispatch',
          { type: 'TEST_EVENT', testId: 'emp_123' },
          true
        );

        if (!pushRes.success) {
          throw new Error('sendPushNotificationToMember returned success: false');
        }
        if (!pushRes.notification || !pushRes.notification.id) {
          throw new Error('Expected notification record in DB, got null');
        }

        // Verify DB notification
        const dbNotif = await prisma.notification.findUnique({
          where: { id: pushRes.notification.id },
        });
        if (!dbNotif || dbNotif.title !== 'Test Push Notification') {
          throw new Error('Notification in DB did not match test payload');
        }

        // Clean up this test notification
        await prisma.notification.delete({ where: { id: dbNotif.id } });
      },
    });

    console.log('\n======================================================================');
    console.log(`ALL ${passedSteps.length} TEST STEPS PASSED SUCCESSFULLY!`);
    console.log('======================================================================\n');
  } catch (err) {
    console.error('\n=== TEST SUITE RUN ENCOUNTERED AN ERROR ===');
    console.error(err);
    throw err;
  } finally {
    // ------------------------------------------------------------------
    // CLEANUP: Clean up test data completely
    // ------------------------------------------------------------------
    console.log('Cleaning up test data...');
    try {
      const testTokens = [mockPushToken1, mockPushToken2, mockPushToken3];
      await prisma.deviceToken.deleteMany({
        where: {
          OR: [
            { token: { in: testTokens } },
            { memberId: { in: [memberAId, memberBId].filter(Boolean) } },
          ],
        },
      });

      if (memberAId || memberBId) {
        const memberIds = [memberAId, memberBId].filter(Boolean);
        await prisma.notification.deleteMany({
          where: { memberId: { in: memberIds } },
        });
        await prisma.member.deleteMany({
          where: { id: { in: memberIds } },
        });
      }

      // Verify no dangling test tokens exist
      const remainingTokens = await prisma.deviceToken.count({
        where: { token: { in: testTokens } },
      });
      if (remainingTokens > 0) {
        console.warn(`WARNING: ${remainingTokens} test tokens remained after cleanup`);
      } else {
        console.log('Cleanup verified: zero test records remain in database.');
      }
    } catch (cleanErr) {
      console.error('Error during test cleanup:', cleanErr);
    } finally {
      await prisma.$disconnect();
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
