import jwt from 'jsonwebtoken';
import { prisma } from '../src/lib/prisma';
import {
  sendPushNotification,
  sendPushNotificationToMember,
  sendBookingConfirmedPush
} from '../src/lib/notifications';

// Route Handlers
import { GET as getNotifications } from '../src/app/api/client/v1/notifications/route';
import { PATCH as patchNotificationRead } from '../src/app/api/client/v1/notifications/[id]/read/route';
import { POST as postMarkRead } from '../src/app/api/client/v1/notifications/mark-read/route';
import { POST as postDeviceToken, DELETE as deleteDeviceToken } from '../src/app/api/client/v1/notifications/device-token/route';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function recordTest(name: string, passed: boolean, details?: string) {
  results.push({ name, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${mark}: ${name}${details ? ` -> ${details}` : ''}`);
}

async function runEmpiricalSuite() {
  console.log('================================================================');
  console.log('🚀 STARTING EMPIRICAL TEST SUITE: CHALLENGER 2 (GENERATION 13)');
  console.log('Target: Security, IDOR Protection, Edge Cases & Data Integrity');
  console.log('================================================================\n');

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('FATAL: NEXTAUTH_SECRET is not configured in .env');
  }

  // Pre-cleanup any previous test artifacts
  const testMobiles = ['9999000001', '9999000002'];
  const existingMembers = await prisma.member.findMany({
    where: { mobile: { in: testMobiles } }
  });
  if (existingMembers.length > 0) {
    const existingIds = existingMembers.map(m => m.id);
    await prisma.deviceToken.deleteMany({ where: { memberId: { in: existingIds } } });
    await prisma.notification.deleteMany({ where: { memberId: { in: existingIds } } });
    await prisma.member.deleteMany({ where: { id: { in: existingIds } } });
  }

  let memberA: any = null;
  let memberB: any = null;
  let tokenA = '';
  let tokenB = '';

  try {
    // -------------------------------------------------------------------------
    // Setup Test Members & Tokens
    // -------------------------------------------------------------------------
    memberA = await prisma.member.create({
      data: {
        name: 'Challenger Test Member A',
        mobile: '9999000001',
        email: 'challenger_a@test.local'
      }
    });

    memberB = await prisma.member.create({
      data: {
        name: 'Challenger Test Member B',
        mobile: '9999000002',
        email: 'challenger_b@test.local'
      }
    });

    tokenA = jwt.sign(
      { memberId: memberA.id, uid: memberA.mobile, email: memberA.email },
      secret
    );
    tokenB = jwt.sign(
      { memberId: memberB.id, uid: memberB.mobile, email: memberB.email },
      secret
    );

    const headersA = {
      Authorization: `Bearer ${tokenA}`,
      'Content-Type': 'application/json'
    };
    const headersB = {
      Authorization: `Bearer ${tokenB}`,
      'Content-Type': 'application/json'
    };

    console.log(`[Setup] Member A created: ${memberA.id} (${memberA.mobile})`);
    console.log(`[Setup] Member B created: ${memberB.id} (${memberB.mobile})\n`);

    // -------------------------------------------------------------------------
    // TEST 1: IDOR Attack 1 - Member A attempts to PATCH Member B's notification
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: IDOR Attack 1 on PATCH /api/client/v1/notifications/[id]/read ---');
    const notifB1 = await prisma.notification.create({
      data: {
        memberId: memberB.id,
        title: 'Confidential Notification for Member B',
        body: 'Booking code #B999',
        isRead: false
      }
    });

    const patchReqAOnB = new Request(
      `http://localhost:3000/api/client/v1/notifications/${notifB1.id}/read`,
      {
        method: 'PATCH',
        headers: headersA
      }
    );

    const patchResAOnB = await patchNotificationRead(patchReqAOnB, {
      params: Promise.resolve({ id: notifB1.id })
    });

    const patchStatusAOnB = patchResAOnB.status;
    const patchJsonAOnB = await patchResAOnB.json();

    const notifB1InDb = await prisma.notification.findUnique({
      where: { id: notifB1.id }
    });

    const isIdor1Blocked =
      patchStatusAOnB === 403 &&
      notifB1InDb?.isRead === false &&
      notifB1InDb?.readAt === null;

    recordTest(
      'IDOR Attack 1: Member A PATCH Member B notification rejected with 403 and stays unread',
      isIdor1Blocked,
      `Status: ${patchStatusAOnB}, isRead in DB: ${notifB1InDb?.isRead}, Error: "${patchJsonAOnB.error}"`
    );

    // -------------------------------------------------------------------------
    // TEST 2: IDOR Attack 2 - Member A attempts POST /mark-read with Member B's IDs
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: IDOR Attack 2 on POST /api/client/v1/notifications/mark-read ---');
    const notifB2 = await prisma.notification.create({
      data: {
        memberId: memberB.id,
        title: 'Second Notification for Member B',
        body: 'Reminder for tomorrow',
        isRead: false
      }
    });

    const postMarkReadReqAOnB = new Request(
      'http://localhost:3000/api/client/v1/notifications/mark-read',
      {
        method: 'POST',
        headers: headersA,
        body: JSON.stringify({
          notificationIds: [notifB1.id, notifB2.id]
        })
      }
    );

    const postMarkReadResAOnB = await postMarkRead(postMarkReadReqAOnB, {});
    const postMarkReadJsonAOnB = await postMarkReadResAOnB.json();

    const notifB1AfterAttack2 = await prisma.notification.findUnique({
      where: { id: notifB1.id }
    });
    const notifB2AfterAttack2 = await prisma.notification.findUnique({
      where: { id: notifB2.id }
    });

    const isIdor2Blocked =
      postMarkReadResAOnB.status === 200 &&
      postMarkReadJsonAOnB.markedCount === 0 &&
      notifB1AfterAttack2?.isRead === false &&
      notifB2AfterAttack2?.isRead === false;

    recordTest(
      'IDOR Attack 2: Member A batch mark-read targeting Member B IDs markedCount=0 & B remains unread',
      isIdor2Blocked,
      `Status: ${postMarkReadResAOnB.status}, markedCount: ${postMarkReadJsonAOnB.markedCount}, B1 isRead: ${notifB1AfterAttack2?.isRead}, B2 isRead: ${notifB2AfterAttack2?.isRead}`
    );

    // -------------------------------------------------------------------------
    // TEST 3: Mixed IDOR in POST /mark-read
    // Member A supplies [A1, B1]. Only A1 should be marked; B1 remains untouched.
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Mixed IDs in POST /mark-read (Attacker + Victim IDs) ---');
    const notifA1 = await prisma.notification.create({
      data: {
        memberId: memberA.id,
        title: 'Notification for Member A',
        body: 'A1 test body',
        isRead: false
      }
    });

    const mixedMarkReq = new Request(
      'http://localhost:3000/api/client/v1/notifications/mark-read',
      {
        method: 'POST',
        headers: headersA,
        body: JSON.stringify({
          notificationIds: [notifA1.id, notifB1.id]
        })
      }
    );

    const mixedMarkRes = await postMarkRead(mixedMarkReq, {});
    const mixedMarkJson = await mixedMarkRes.json();

    const notifA1AfterMixed = await prisma.notification.findUnique({
      where: { id: notifA1.id }
    });
    const notifB1AfterMixed = await prisma.notification.findUnique({
      where: { id: notifB1.id }
    });

    const isMixedIdorSafe =
      mixedMarkRes.status === 200 &&
      mixedMarkJson.markedCount === 1 &&
      notifA1AfterMixed?.isRead === true &&
      notifA1AfterMixed?.readAt !== null &&
      notifB1AfterMixed?.isRead === false &&
      notifB1AfterMixed?.readAt === null;

    recordTest(
      'Mixed IDOR Guard: Member A marks [A1, B1] -> only A1 marked, markedCount=1, B1 unaffected',
      isMixedIdorSafe,
      `markedCount: ${mixedMarkJson.markedCount}, A1 isRead: ${notifA1AfterMixed?.isRead}, B1 isRead: ${notifB1AfterMixed?.isRead}`
    );

    // -------------------------------------------------------------------------
    // TEST 4: Unread Count Accuracy & Decrement on Single Read
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Unread Count Accuracy on GET /notifications ---');
    // Create 3 unread notifications for Member A
    const [notifA2, notifA3, notifA4] = await Promise.all([
      prisma.notification.create({
        data: { memberId: memberA.id, title: 'Notice A2', body: 'Body 2', isRead: false }
      }),
      prisma.notification.create({
        data: { memberId: memberA.id, title: 'Notice A3', body: 'Body 3', isRead: false }
      }),
      prisma.notification.create({
        data: { memberId: memberA.id, title: 'Notice A4', body: 'Body 4', isRead: false }
      })
    ]);

    // Initial check: Member A should have 3 unread (A1 was marked read in TEST 3)
    const getReqA_initial = new Request('http://localhost:3000/api/client/v1/notifications', {
      method: 'GET',
      headers: headersA
    });
    const getResA_initial = await getNotifications(getReqA_initial, {});
    const getJsonA_initial = await getResA_initial.json();

    const countMatches3 = getJsonA_initial.unreadCount === 3;

    // Now mark notifA2 as read via PATCH
    const patchA2Req = new Request(
      `http://localhost:3000/api/client/v1/notifications/${notifA2.id}/read`,
      {
        method: 'PATCH',
        headers: headersA
      }
    );
    const patchA2Res = await patchNotificationRead(patchA2Req, {
      params: Promise.resolve({ id: notifA2.id })
    });
    const patchA2Json = await patchA2Res.json();

    // Verify unread count decremented to 2
    const getReqA_afterPatch = new Request('http://localhost:3000/api/client/v1/notifications', {
      method: 'GET',
      headers: headersA
    });
    const getResA_afterPatch = await getNotifications(getReqA_afterPatch, {});
    const getJsonA_afterPatch = await getResA_afterPatch.json();

    const countMatches2 = getJsonA_afterPatch.unreadCount === 2;

    // Also verify Member B unread count is strictly isolated (should be 2: notifB1 and notifB2)
    const getReqB = new Request('http://localhost:3000/api/client/v1/notifications', {
      method: 'GET',
      headers: headersB
    });
    const getResB = await getNotifications(getReqB, {});
    const getJsonB = await getResB.json();
    const countBMatches2 = getJsonB.unreadCount === 2;

    const unreadCountAccuracyPassed =
      countMatches3 && patchA2Json.success && countMatches2 && countBMatches2;

    recordTest(
      'Unread Count Accuracy: Decrements from 3 to 2 on single read, Member B count remains 2',
      unreadCountAccuracyPassed,
      `Initial: ${getJsonA_initial.unreadCount}, After mark-one: ${getJsonA_afterPatch.unreadCount}, Member B count: ${getJsonB.unreadCount}`
    );

    // -------------------------------------------------------------------------
    // TEST 5: Bulk mark-read with { all: true } & Cross-Account Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Bulk mark-read ({ all: true }) with Cross-Account Isolation ---');
    const bulkAllReqA = new Request(
      'http://localhost:3000/api/client/v1/notifications/mark-read',
      {
        method: 'POST',
        headers: headersA,
        body: JSON.stringify({ all: true })
      }
    );
    const bulkAllResA = await postMarkRead(bulkAllReqA, {});
    const bulkAllJsonA = await bulkAllResA.json();

    // Verify Member A unread count is now 0
    const getReqA_postBulk = new Request('http://localhost:3000/api/client/v1/notifications', {
      method: 'GET',
      headers: headersA
    });
    const getResA_postBulk = await getNotifications(getReqA_postBulk, {});
    const getJsonA_postBulk = await getResA_postBulk.json();

    // Verify Member B notifications are STILL unread
    const getReqB_postBulk = new Request('http://localhost:3000/api/client/v1/notifications', {
      method: 'GET',
      headers: headersB
    });
    const getResB_postBulk = await getNotifications(getReqB_postBulk, {});
    const getJsonB_postBulk = await getResB_postBulk.json();

    const bulkAllPassed =
      bulkAllResA.status === 200 &&
      bulkAllJsonA.markedCount === 2 && // A3 and A4 were marked
      getJsonA_postBulk.unreadCount === 0 &&
      getJsonB_postBulk.unreadCount === 2;

    recordTest(
      'Bulk Mark-Read: { all: true } clears all Member A unread (markedCount=2) while Member B unread remains intact',
      bulkAllPassed,
      `Marked count: ${bulkAllJsonA.markedCount}, Member A unread: ${getJsonA_postBulk.unreadCount}, Member B unread: ${getJsonB_postBulk.unreadCount}`
    );

    // -------------------------------------------------------------------------
    // TEST 6A: Malformed Token Auto-Pruning in sendPushNotification
    // Verify invalid token formats are pruned from database while valid tokens in DB are untouched
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6A: Malformed Token Auto-Pruning in sendPushNotification ---');
    const badToken1 = 'bad_token_syntax_xyz';
    const badToken2 = 'ExponentPushToken_MissingBrackets';
    const retainedToken = 'ExponentPushToken[RetainedValidTokenFormat123]';

    // Insert these tokens into prisma.deviceToken
    await prisma.deviceToken.createMany({
      data: [
        { memberId: memberA.id, token: badToken1, platform: 'android' },
        { memberId: memberA.id, token: badToken2, platform: 'ios' },
        { memberId: memberA.id, token: retainedToken, platform: 'android' }
      ]
    });

    const beforePruneCount = await prisma.deviceToken.count({
      where: { memberId: memberA.id }
    });

    // Call sendPushNotification with the malformed tokens
    const pushResultMalformed = await sendPushNotification(
      [badToken1, badToken2],
      'Pruning Test Title',
      'Pruning Test Body'
    );

    // Query DB to inspect remaining tokens
    const tokensAfterMalformedPrune = await prisma.deviceToken.findMany({
      where: { memberId: memberA.id }
    });

    const bad1Deleted = !tokensAfterMalformedPrune.some(t => t.token === badToken1);
    const bad2Deleted = !tokensAfterMalformedPrune.some(t => t.token === badToken2);
    const retainedStillPresent = tokensAfterMalformedPrune.some(t => t.token === retainedToken);

    const pruningPassed =
      beforePruneCount === 3 &&
      bad1Deleted &&
      bad2Deleted &&
      retainedStillPresent &&
      pushResultMalformed.success === true;

    recordTest(
      'Malformed Token Auto-Pruning: Invalid token formats pruned from database while un-targeted valid tokens remain',
      pruningPassed,
      `Tokens before: ${beforePruneCount}, after: ${tokensAfterMalformedPrune.length}, bad1 purged: ${bad1Deleted}, bad2 purged: ${bad2Deleted}, retained token intact: ${retainedStillPresent}`
    );

    // -------------------------------------------------------------------------
    // TEST 6B: Unregistered Token Auto-Pruning via Expo Ticket (DeviceNotRegistered)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6B: Unregistered Token Auto-Pruning via Expo Ticket ---');
    // Call sendPushNotification with retainedToken which has valid syntax but is not a live Expo device
    await sendPushNotification(
      [retainedToken],
      'Unregistered Test Title',
      'Unregistered Test Body'
    );

    const tokenAfterExpoPrune = await prisma.deviceToken.findUnique({
      where: { token: retainedToken }
    });
    const unregisteredTokenPruned = tokenAfterExpoPrune === null;

    recordTest(
      'Unregistered Token Auto-Pruning: Expo DeviceNotRegistered error ticket auto-prunes unregistered device token',
      unregisteredTokenPruned,
      `Token was automatically pruned by ticket handler: ${unregisteredTokenPruned}`
    );

    // -------------------------------------------------------------------------
    // TEST 7: Device Token Registration Format Guard
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: Device Token Registration Format Guard ---');
    const regInvalidReq = new Request(
      'http://localhost:3000/api/client/v1/notifications/device-token',
      {
        method: 'POST',
        headers: headersA,
        body: JSON.stringify({
          token: 'invalid_raw_token_value',
          platform: 'android'
        })
      }
    );
    const regInvalidRes = await postDeviceToken(regInvalidReq, {});
    const regInvalidJson = await regInvalidRes.json();

    const regValidToken = 'ExponentPushToken[TestValidTokenReg123456789]';
    const regValidReq = new Request(
      'http://localhost:3000/api/client/v1/notifications/device-token',
      {
        method: 'POST',
        headers: headersA,
        body: JSON.stringify({
          token: regValidToken,
          platform: 'android'
        })
      }
    );
    const regValidRes = await postDeviceToken(regValidReq, {});
    const regValidJson = await regValidRes.json();

    const registeredInDb = await prisma.deviceToken.findUnique({
      where: { token: regValidToken }
    });

    const regValidationPassed =
      regInvalidRes.status === 400 &&
      regValidRes.status === 200 &&
      regValidJson.success === true &&
      registeredInDb?.memberId === memberA.id;

    recordTest(
      'Device Token POST Guard: Rejects invalid Expo token format with 400; accepts valid token with 200',
      regValidationPassed,
      `Invalid status: ${regInvalidRes.status} ("${regInvalidJson.error}"), Valid status: ${regValidRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 8: Device Token Deregistration IDOR Protection
    // Member A attempts to deregister Member B's device token
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Device Token Deregistration IDOR Protection ---');
    const tokenB_device = 'ExponentPushToken[MemberB_PrivateDeviceToken_999]';
    await prisma.deviceToken.create({
      data: {
        memberId: memberB.id,
        token: tokenB_device,
        platform: 'ios'
      }
    });

    // Member A attempts DELETE with Member B's token
    const deleteReqAOnB = new Request(
      'http://localhost:3000/api/client/v1/notifications/device-token',
      {
        method: 'DELETE',
        headers: headersA,
        body: JSON.stringify({ token: tokenB_device })
      }
    );
    const deleteResAOnB = await deleteDeviceToken(deleteReqAOnB, {});
    const deleteJsonAOnB = await deleteResAOnB.json();

    // Verify token still exists in DB belonging to Member B
    const tokenBStillExists = await prisma.deviceToken.findUnique({
      where: { token: tokenB_device }
    });

    // Member B deregisters their own token
    const deleteReqB = new Request(
      'http://localhost:3000/api/client/v1/notifications/device-token',
      {
        method: 'DELETE',
        headers: headersB,
        body: JSON.stringify({ token: tokenB_device })
      }
    );
    await deleteDeviceToken(deleteReqB, {});
    const tokenBNowDeleted = !(await prisma.deviceToken.findUnique({
      where: { token: tokenB_device }
    }));

    const deviceTokenIdorPassed =
      tokenBStillExists?.memberId === memberB.id && tokenBNowDeleted;

    recordTest(
      'Device Token DELETE IDOR Guard: Member A cannot delete Member B device token; Member B can',
      deviceTokenIdorPassed,
      `Token survived Member A attack: ${!!tokenBStillExists}, Token removed by Member B: ${tokenBNowDeleted}`
    );

    // -------------------------------------------------------------------------
    // TEST 9: Unauthenticated Access Rejection (All Routes)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 9: Unauthenticated Route Guards (HTTP 401 Rejections) ---');
    const unauthGetRes = await getNotifications(
      new Request('http://localhost:3000/api/client/v1/notifications'),
      {}
    );
    const unauthPatchRes = await patchNotificationRead(
      new Request('http://localhost:3000/api/client/v1/notifications/any_id/read', {
        method: 'PATCH'
      }),
      { params: Promise.resolve({ id: 'any_id' }) }
    );
    const unauthPostMarkRes = await postMarkRead(
      new Request('http://localhost:3000/api/client/v1/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      }),
      {}
    );
    const unauthPostDeviceRes = await postDeviceToken(
      new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'ExponentPushToken[123]' })
      }),
      {}
    );
    const unauthDeleteDeviceRes = await deleteDeviceToken(
      new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'ExponentPushToken[123]' })
      }),
      {}
    );

    const allUnauth401 =
      unauthGetRes.status === 401 &&
      unauthPatchRes.status === 401 &&
      unauthPostMarkRes.status === 401 &&
      unauthPostDeviceRes.status === 401 &&
      unauthDeleteDeviceRes.status === 401;

    recordTest(
      'Unauthenticated Access: All routes return HTTP 401 Unauthorized when missing credentials',
      allUnauth401,
      `GET: ${unauthGetRes.status}, PATCH: ${unauthPatchRes.status}, POST mark-read: ${unauthPostMarkRes.status}, POST dev-token: ${unauthPostDeviceRes.status}, DELETE dev-token: ${unauthDeleteDeviceRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 10: Non-Existent ID & Invalid Input Edge Cases
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 10: Edge Cases (404 Not Found & 400 Bad Request) ---');
    // Non-existent ID on PATCH
    const notFoundPatchRes = await patchNotificationRead(
      new Request('http://localhost:3000/api/client/v1/notifications/non_existent_cuid_123/read', {
        method: 'PATCH',
        headers: headersA
      }),
      { params: Promise.resolve({ id: 'non_existent_cuid_123' }) }
    );
    const notFoundJson = await notFoundPatchRes.json();

    // Empty body on POST /mark-read
    const badMarkReq = new Request('http://localhost:3000/api/client/v1/notifications/mark-read', {
      method: 'POST',
      headers: headersA,
      body: JSON.stringify({})
    });
    const badMarkRes = await postMarkRead(badMarkReq, {});
    const badMarkJson = await badMarkRes.json();

    const edgeCasesPassed =
      notFoundPatchRes.status === 404 &&
      notFoundJson.error === 'Notification not found' &&
      badMarkRes.status === 400 &&
      badMarkJson.error.includes('Must provide either all: true or a non-empty notificationIds array');

    recordTest(
      'Input Validation Edge Cases: Non-existent ID returns 404; empty POST /mark-read returns 400',
      edgeCasesPassed,
      `404 status: ${notFoundPatchRes.status}, 400 status: ${badMarkRes.status}`
    );

    // -------------------------------------------------------------------------
    // TEST 11: Pagination & Take Clamping on GET /notifications
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 11: Pagination & Take Clamping on GET /notifications ---');
    // Member A currently has 4 notifications in DB (A1, A2, A3, A4)
    const paginationReq1 = new Request('http://localhost:3000/api/client/v1/notifications?take=2&skip=0', {
      method: 'GET',
      headers: headersA
    });
    const paginationRes1 = await getNotifications(paginationReq1, {});
    const paginationJson1 = await paginationRes1.json();

    const paginationReq2 = new Request('http://localhost:3000/api/client/v1/notifications?take=2&skip=2', {
      method: 'GET',
      headers: headersA
    });
    const paginationRes2 = await getNotifications(paginationReq2, {});
    const paginationJson2 = await paginationRes2.json();

    // Take clamping to 100 max
    const paginationReqMax = new Request('http://localhost:3000/api/client/v1/notifications?take=999', {
      method: 'GET',
      headers: headersA
    });
    const paginationResMax = await getNotifications(paginationReqMax, {});
    const paginationJsonMax = await paginationResMax.json();

    const paginationPassed =
      paginationJson1.notifications.length === 2 &&
      paginationJson2.notifications.length === 2 &&
      paginationJson1.notifications[0].id !== paginationJson2.notifications[0].id &&
      paginationJsonMax.notifications.length === 4;

    recordTest(
      'Pagination & Offset: Proper chunking (skip/take) without leaking duplicate or corrupt data',
      paginationPassed,
      `Page 1 count: ${paginationJson1.notifications.length}, Page 2 count: ${paginationJson2.notifications.length}`
    );

    // -------------------------------------------------------------------------
    // TEST 12: Device Token Upsert Idempotency & Reassignment
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 12: Device Token Upsert Idempotency & Reassignment ---');
    const sharedToken = 'ExponentPushToken[SharedDeviceTokenReassignTest123]';

    // Member A registers sharedToken
    await postDeviceToken(
      new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
        method: 'POST',
        headers: headersA,
        body: JSON.stringify({ token: sharedToken, platform: 'android' })
      }),
      {}
    );

    // Member A re-registers same token (idempotency check)
    const dupRes = await postDeviceToken(
      new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
        method: 'POST',
        headers: headersA,
        body: JSON.stringify({ token: sharedToken, platform: 'android' })
      }),
      {}
    );
    const dupJson = await dupRes.json();

    // Member B logs into same device and registers sharedToken
    const reassignRes = await postDeviceToken(
      new Request('http://localhost:3000/api/client/v1/notifications/device-token', {
        method: 'POST',
        headers: headersB,
        body: JSON.stringify({ token: sharedToken, platform: 'android' })
      }),
      {}
    );
    const reassignJson = await reassignRes.json();

    // Check DB: token should now belong to Member B, count of this token is strictly 1
    const tokenRecord = await prisma.deviceToken.findUnique({
      where: { token: sharedToken }
    });
    const totalTokenInstances = await prisma.deviceToken.count({
      where: { token: sharedToken }
    });

    const upsertIdempotencyPassed =
      dupJson.success === true &&
      reassignJson.success === true &&
      tokenRecord?.memberId === memberB.id &&
      totalTokenInstances === 1;

    recordTest(
      'Device Token Upsert Idempotency: Re-registering does not duplicate; device switch updates memberId cleanly',
      upsertIdempotencyPassed,
      `Owner memberId: ${tokenRecord?.memberId}, Instance count: ${totalTokenInstances}`
    );

    // -------------------------------------------------------------------------
    // TEST 13: sendPushNotificationToMember with Zero Registered Devices
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 13: sendPushNotificationToMember with Zero Registered Devices ---');
    // Ensure Member A has 0 tokens right now
    await prisma.deviceToken.deleteMany({ where: { memberId: memberA.id } });

    const zeroDevicePush = await sendPushNotificationToMember(
      memberA.id,
      'Title For Zero Devices',
      'Body For Zero Devices',
      { type: 'TEST' },
      true
    );

    const zeroDeviceNotifInDb = await prisma.notification.findUnique({
      where: { id: zeroDevicePush.notification.id }
    });

    const zeroDevicePassed =
      zeroDevicePush.success === true &&
      zeroDevicePush.deliveredCount === 0 &&
      zeroDeviceNotifInDb !== null &&
      zeroDeviceNotifInDb.memberId === memberA.id &&
      zeroDeviceNotifInDb.isRead === false;

    recordTest(
      'Zero-Device Push Graceful Fallback: Creates in-app DB notification without failing push dispatch',
      zeroDevicePassed,
      `Delivered count: ${zeroDevicePush.deliveredCount}, Notif created in DB: ${!!zeroDeviceNotifInDb}`
    );

    // -------------------------------------------------------------------------
    // TEST 14: sendBookingConfirmedPush Helper Resilience
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 14: sendBookingConfirmedPush Helper Resilience ---');
    let helperSuccess = false;
    try {
      await sendBookingConfirmedPush({
        id: 'mock_booking_id_123',
        memberId: memberA.id,
        turf: null,
        sport: null,
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000)
      });
      helperSuccess = true;
    } catch (err) {
      helperSuccess = false;
    }

    const bookingPushInDb = await prisma.notification.findFirst({
      where: { memberId: memberA.id, title: 'Booking Confirmed! 🎾' }
    });

    const bookingPushPassed =
      helperSuccess &&
      bookingPushInDb !== null &&
      bookingPushInDb.body.includes('Sports Court') &&
      bookingPushInDb.body.includes('Session');

    recordTest(
      'sendBookingConfirmedPush Resilience: Successfully formats dates and handles null turf/sport fallbacks',
      bookingPushPassed,
      `Notif title: "${bookingPushInDb?.title}", body: "${bookingPushInDb?.body}"`
    );

    // -------------------------------------------------------------------------
    // TEST 15: Empty/No Unread Notifications Bulk Mark-Read
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 15: Zero-Unread Bulk Mark-Read ---');
    // First clear all Member A unread notifications
    await prisma.notification.updateMany({
      where: { memberId: memberA.id },
      data: { isRead: true, readAt: new Date() }
    });

    const zeroUnreadBulkReq = new Request(
      'http://localhost:3000/api/client/v1/notifications/mark-read',
      {
        method: 'POST',
        headers: headersA,
        body: JSON.stringify({ all: true })
      }
    );
    const zeroUnreadBulkRes = await postMarkRead(zeroUnreadBulkReq, {});
    const zeroUnreadBulkJson = await zeroUnreadBulkRes.json();

    const zeroUnreadPassed =
      zeroUnreadBulkRes.status === 200 &&
      zeroUnreadBulkJson.success === true &&
      zeroUnreadBulkJson.markedCount === 0;

    recordTest(
      'Zero-Unread Bulk Mark-Read: Calling mark-read { all: true } with 0 unread returns markedCount=0 cleanly',
      zeroUnreadPassed,
      `Status: ${zeroUnreadBulkRes.status}, markedCount: ${zeroUnreadBulkJson.markedCount}`
    );

    // -------------------------------------------------------------------------
    // TEST 16: Malformed / SQL-Injection ID Injection Attack Handling
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 16: SQL Injection / Malformed ID Injection Attack ---');
    const sqliId = "' OR '1'='1' --";
    const sqliPatchRes = await patchNotificationRead(
      new Request(
        `http://localhost:3000/api/client/v1/notifications/${encodeURIComponent(sqliId)}/read`,
        {
          method: 'PATCH',
          headers: headersA
        }
      ),
      { params: Promise.resolve({ id: sqliId }) }
    );
    const sqliPatchJson = await sqliPatchRes.json();

    const sqliPassed =
      sqliPatchRes.status === 404 &&
      sqliPatchJson.error === 'Notification not found';

    recordTest(
      'SQL Injection / Malformed ID Guard: Parameterized queries prevent bypass and return 404 cleanly',
      sqliPassed,
      `Status: ${sqliPatchRes.status}, Error: "${sqliPatchJson.error}"`
    );

  } finally {
    // -------------------------------------------------------------------------
    // Clean up test data
    // -------------------------------------------------------------------------
    console.log('\n--- CLEANING UP TEST DATA ---');
    if (memberA && memberB) {
      const memberIds = [memberA.id, memberB.id];
      const deletedTokens = await prisma.deviceToken.deleteMany({
        where: { memberId: { in: memberIds } }
      });
      const deletedNotifs = await prisma.notification.deleteMany({
        where: { memberId: { in: memberIds } }
      });
      const deletedMembers = await prisma.member.deleteMany({
        where: { id: { in: memberIds } }
      });

      console.log(`[Cleanup] Deleted ${deletedTokens.count} device tokens.`);
      console.log(`[Cleanup] Deleted ${deletedNotifs.count} notifications.`);
      console.log(`[Cleanup] Deleted ${deletedMembers.count} members.`);

      const remainingCheck = await prisma.member.count({
        where: { id: { in: memberIds } }
      });
      const cleanupClean = remainingCheck === 0;
      recordTest(
        'Teardown & Cleanup: Zero orphan test records remaining in database',
        cleanupClean,
        `Remaining test members in DB: ${remainingCheck}`
      );
    }
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('📊 EMPIRICAL TEST SUITE RESULTS SUMMARY');
  console.log('================================================================');
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`Total Tests : ${total}`);
  console.log(`Passed      : ${passedCount}`);
  console.log(`Failed      : ${failedCount}`);

  if (failedCount > 0) {
    console.error('\n❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => console.error(`  - ${r.name}: ${r.details}`));
    process.exit(1);
  } else {
    console.log('\n✨ ALL EMPIRICAL CHALLENGER TESTS PASSED SUCCESSFULLY! ✨');
    process.exit(0);
  }
}

runEmpiricalSuite().catch(err => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
