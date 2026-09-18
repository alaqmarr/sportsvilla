import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { Expo } from 'expo-server-sdk';
import { prisma } from '../src/lib/prisma';
import {
  sendPushNotification,
  sendPushNotificationToMember,
  sendBookingConfirmedPush
} from '../src/lib/notifications';

// Route handlers
import {
  POST as postDeviceToken,
  DELETE as deleteDeviceToken
} from '../src/app/api/client/v1/notifications/device-token/route';
import { GET as getNotifications } from '../src/app/api/client/v1/notifications/route';
import { PATCH as patchRead } from '../src/app/api/client/v1/notifications/[id]/read/route';
import { POST as postMarkRead } from '../src/app/api/client/v1/notifications/mark-read/route';

interface ForensicCheck {
  id: string;
  category: string;
  name: string;
  status: 'PASS' | 'FAIL';
  evidence: string;
  rawDetails?: any;
}

const checkResults: ForensicCheck[] = [];

function recordCheck(
  id: string,
  category: string,
  name: string,
  status: 'PASS' | 'FAIL',
  evidence: string,
  rawDetails?: any
) {
  checkResults.push({ id, category, name, status, evidence, rawDetails });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`[${icon} ${status}] ${id}: ${name} -- ${evidence}`);
}

async function runForensicAudit() {
  console.log('========================================================================');
  console.log('🔍 STARTING INDEPENDENT FORENSIC INTEGRITY AUDIT: MILESTONE R2 (GEN 13)');
  console.log('Target: Backend Notification Service & APIs (sportsvilla)');
  console.log('========================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('FATAL: NEXTAUTH_SECRET is required to execute authenticated audit tests');
  }

  // ===========================================================================
  // PHASE 1: DEPENDENCY & PACKAGE INTEGRITY
  // ===========================================================================
  console.log('>>> [PHASE 1] Checking Dependency & Package Integrity...');

  // 1.1 package.json dependency declaration
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const hasExpoSdkInPkg = !!pkg.dependencies?.['expo-server-sdk'];
  const expoVersionInPkg = pkg.dependencies?.['expo-server-sdk'];

  if (hasExpoSdkInPkg) {
    recordCheck(
      'CHK-DEP-01',
      'Dependency Integrity',
      'expo-server-sdk declaration in package.json',
      'PASS',
      `Found expo-server-sdk (${expoVersionInPkg}) in dependencies`
    );
  } else {
    recordCheck(
      'CHK-DEP-01',
      'Dependency Integrity',
      'expo-server-sdk declaration in package.json',
      'FAIL',
      'expo-server-sdk missing from package.json dependencies'
    );
  }

  // 1.2 node_modules authenticity
  const nodeModulesExpoPkgPath = path.join(rootDir, 'node_modules', 'expo-server-sdk', 'package.json');
  const expoInstalled = fs.existsSync(nodeModulesExpoPkgPath);
  let installedExpoVer = '';
  if (expoInstalled) {
    const installedPkg = JSON.parse(fs.readFileSync(nodeModulesExpoPkgPath, 'utf8'));
    installedExpoVer = installedPkg.version;
  }

  if (expoInstalled && installedExpoVer) {
    recordCheck(
      'CHK-DEP-02',
      'Dependency Integrity',
      'expo-server-sdk presence in node_modules',
      'PASS',
      `Authentically installed in node_modules at version ${installedExpoVer}`
    );
  } else {
    recordCheck(
      'CHK-DEP-02',
      'Dependency Integrity',
      'expo-server-sdk presence in node_modules',
      'FAIL',
      'expo-server-sdk not found in node_modules'
    );
  }

  // 1.3 Expo SDK Functional Validation
  const validTokenExample = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
  const invalidTokenExample = 'malformed_token_123';
  const isPushTokenValid = Expo.isExpoPushToken(validTokenExample);
  const isInvalidRejected = !Expo.isExpoPushToken(invalidTokenExample);
  const expoInstance = new Expo();
  const chunks = expoInstance.chunkPushNotifications([{ to: validTokenExample, body: 'test' }]);

  if (isPushTokenValid && isInvalidRejected && chunks.length === 1) {
    recordCheck(
      'CHK-DEP-03',
      'Dependency Integrity',
      'Expo SDK runtime class and methods execution',
      'PASS',
      'Expo.isExpoPushToken and chunkPushNotifications function correctly'
    );
  } else {
    recordCheck(
      'CHK-DEP-03',
      'Dependency Integrity',
      'Expo SDK runtime class and methods execution',
      'FAIL',
      `Validation error: validToken=${isPushTokenValid}, invalidRejected=${isInvalidRejected}`
    );
  }

  // ===========================================================================
  // PHASE 2: STATIC SOURCE CODE FORENSICS & FACADE DETECTION
  // ===========================================================================
  console.log('\n>>> [PHASE 2] Static Source Code Forensics & Facade Detection...');

  const notifServicePath = path.join(rootDir, 'src', 'lib', 'notifications.ts');
  const notifServiceContent = fs.readFileSync(notifServicePath, 'utf8');

  // Check 2.1: Facade / dummy returns in notifications.ts
  const hasDummyNotifReturn = /return\s+\[\]\s*;/.test(notifServiceContent) && notifServiceContent.includes('mock');
  const hasRealChunking = notifServiceContent.includes('expo.chunkPushNotifications');
  const hasRealSending = notifServiceContent.includes('expo.sendPushNotificationsAsync');
  const hasRealDbPruning = notifServiceContent.includes('prisma.deviceToken.deleteMany');
  const hasRealDbCreate = notifServiceContent.includes('prisma.notification.create');

  if (hasRealChunking && hasRealSending && hasRealDbPruning && hasRealDbCreate && !hasDummyNotifReturn) {
    recordCheck(
      'CHK-SRC-01',
      'Source Code Forensics',
      'src/lib/notifications.ts authentic implementation',
      'PASS',
      'Real Expo chunking, async sending, DB persistence and pruning logic detected (no facades)'
    );
  } else {
    recordCheck(
      'CHK-SRC-01',
      'Source Code Forensics',
      'src/lib/notifications.ts authentic implementation',
      'FAIL',
      `Facade flags: chunking=${hasRealChunking}, sending=${hasRealSending}, pruning=${hasRealDbPruning}, dbCreate=${hasRealDbCreate}`
    );
  }

  // Check 2.2: Route handler files exist and contain authentic logic
  const routePaths = [
    'src/app/api/client/v1/notifications/device-token/route.ts',
    'src/app/api/client/v1/notifications/route.ts',
    'src/app/api/client/v1/notifications/[id]/read/route.ts',
    'src/app/api/client/v1/notifications/mark-read/route.ts'
  ];

  let allRoutesExist = true;
  for (const rPath of routePaths) {
    const fullPath = path.join(rootDir, rPath);
    if (!fs.existsSync(fullPath)) {
      allRoutesExist = false;
      break;
    }
  }

  if (allRoutesExist) {
    recordCheck(
      'CHK-SRC-02',
      'Source Code Forensics',
      'Notification API route file structure',
      'PASS',
      'All 4 required API route handler files exist at expected paths'
    );
  } else {
    recordCheck(
      'CHK-SRC-02',
      'Source Code Forensics',
      'Notification API route file structure',
      'FAIL',
      'One or more route files are missing'
    );
  }

  // ===========================================================================
  // PHASE 3: DATABASE & SERVICE RUNTIME BEHAVIORAL VERIFICATION
  // ===========================================================================
  console.log('\n>>> [PHASE 3] Database & Service Runtime Behavioral Verification...');

  // Setup test members
  const testMobileAuditorA = '8888000001';
  const testMobileAuditorB = '8888000002';

  // Cleanup past audit data if any
  const existingAuditMembers = await prisma.member.findMany({
    where: { mobile: { in: [testMobileAuditorA, testMobileAuditorB] } }
  });
  if (existingAuditMembers.length > 0) {
    const ids = existingAuditMembers.map(m => m.id);
    await prisma.deviceToken.deleteMany({ where: { memberId: { in: ids } } });
    await prisma.notification.deleteMany({ where: { memberId: { in: ids } } });
    await prisma.member.deleteMany({ where: { id: { in: ids } } });
  }

  const memberA = await prisma.member.create({
    data: {
      name: 'Forensic Auditor Member A',
      mobile: testMobileAuditorA,
      email: 'auditor_a@sportsvilla.local'
    }
  });

  const memberB = await prisma.member.create({
    data: {
      name: 'Forensic Auditor Member B',
      mobile: testMobileAuditorB,
      email: 'auditor_b@sportsvilla.local'
    }
  });

  const tokenA = jwt.sign(
    { memberId: memberA.id, uid: memberA.mobile, email: memberA.email },
    secret
  );
  const tokenB = jwt.sign(
    { memberId: memberB.id, uid: memberB.mobile, email: memberB.email },
    secret
  );

  const authHeadersA = {
    Authorization: `Bearer ${tokenA}`,
    'Content-Type': 'application/json'
  };
  const authHeadersB = {
    Authorization: `Bearer ${tokenB}`,
    'Content-Type': 'application/json'
  };

  try {
    // 3.1 sendPushNotification token pruning behavior
    const badSyntaxToken = 'forensic_bad_token_syntax';
    const validSyntaxToken = 'ExponentPushToken[ForensicValidToken12345]';

    await prisma.deviceToken.create({
      data: {
        memberId: memberA.id,
        token: badSyntaxToken,
        platform: 'android'
      }
    });
    await prisma.deviceToken.create({
      data: {
        memberId: memberA.id,
        token: validSyntaxToken,
        platform: 'android'
      }
    });

    const pushResult = await sendPushNotification(
      [badSyntaxToken, validSyntaxToken],
      'Forensic Test',
      'Forensic Body'
    );

    const badTokenInDb = await prisma.deviceToken.findUnique({
      where: { token: badSyntaxToken }
    });

    if (pushResult.success && badTokenInDb === null) {
      recordCheck(
        'CHK-BEH-01',
        'Service Behavioral Verification',
        'sendPushNotification automatic malformed token pruning',
        'PASS',
        'Malformed token was filtered and pruned from prisma.deviceToken'
      );
    } else {
      recordCheck(
        'CHK-BEH-01',
        'Service Behavioral Verification',
        'sendPushNotification automatic malformed token pruning',
        'FAIL',
        `Bad token still in DB: ${!!badTokenInDb}`
      );
    }

    // 3.2 sendPushNotificationToMember with saveToDb = true & false
    const memberPushSaved = await sendPushNotificationToMember(
      memberA.id,
      'Test DB Notification',
      'Test DB Notification Body',
      { code: 123 },
      true
    );

    const memberPushUnsaved = await sendPushNotificationToMember(
      memberA.id,
      'Test Unsaved Push',
      'Test Unsaved Push Body',
      { code: 456 },
      false
    );

    const savedRecord = memberPushSaved.notification
      ? await prisma.notification.findUnique({ where: { id: memberPushSaved.notification.id } })
      : null;

    if (savedRecord && savedRecord.isRead === false && memberPushUnsaved.notification === null) {
      recordCheck(
        'CHK-BEH-02',
        'Service Behavioral Verification',
        'sendPushNotificationToMember database persistence flag',
        'PASS',
        'saveToDb=true writes in-app Notification record; saveToDb=false skips DB creation'
      );
    } else {
      recordCheck(
        'CHK-BEH-02',
        'Service Behavioral Verification',
        'sendPushNotificationToMember database persistence flag',
        'FAIL',
        `savedRecord in DB=${!!savedRecord}, unsavedNotificationObj=${memberPushUnsaved.notification}`
      );
    }

    // 3.3 sendBookingConfirmedPush event helper
    await sendBookingConfirmedPush({
      id: 'test_bk_forensic_1',
      memberId: memberA.id,
      turf: { name: 'Pitch Alpha' },
      sport: { name: 'Football' },
      startTime: new Date('2026-10-01T10:00:00Z'),
      endTime: new Date('2026-10-01T11:00:00Z')
    });

    const bookingPushRecord = await prisma.notification.findFirst({
      where: { memberId: memberA.id, title: 'Booking Confirmed! 🎾' }
    });

    if (
      bookingPushRecord &&
      bookingPushRecord.body.includes('Football') &&
      bookingPushRecord.body.includes('Pitch Alpha')
    ) {
      recordCheck(
        'CHK-BEH-03',
        'Service Behavioral Verification',
        'sendBookingConfirmedPush formatting and dispatch',
        'PASS',
        `Created notification: "${bookingPushRecord.title}" -> "${bookingPushRecord.body}"`
      );
    } else {
      recordCheck(
        'CHK-BEH-03',
        'Service Behavioral Verification',
        'sendBookingConfirmedPush formatting and dispatch',
        'FAIL',
        `Booking notification missing or malformed: ${JSON.stringify(bookingPushRecord)}`
      );
    }

    // ===========================================================================
    // PHASE 4: API AUTHENTICATION & INPUT VALIDATION GUARDS
    // ===========================================================================
    console.log('\n>>> [PHASE 4] API Authentication & Input Validation Guards...');

    // 4.1 Unauthenticated requests to all 4 endpoints
    const unauthGet = await getNotifications(new Request('http://localhost/api/client/v1/notifications'), {});
    const unauthPatch = await patchRead(
      new Request('http://localhost/api/client/v1/notifications/dummy/read', { method: 'PATCH' }),
      { params: Promise.resolve({ id: 'dummy' }) }
    );
    const unauthPostMark = await postMarkRead(
      new Request('http://localhost/api/client/v1/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      }),
      {}
    );
    const unauthPostToken = await postDeviceToken(
      new Request('http://localhost/api/client/v1/notifications/device-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'ExponentPushToken[123]' })
      }),
      {}
    );

    const allUnauthBlocked =
      unauthGet.status === 401 &&
      unauthPatch.status === 401 &&
      unauthPostMark.status === 401 &&
      unauthPostToken.status === 401;

    if (allUnauthBlocked) {
      recordCheck(
        'CHK-SEC-01',
        'Security & Route Guards',
        'Unauthenticated access rejected with HTTP 401 across all routes',
        'PASS',
        'GET, PATCH, POST mark-read, and POST device-token all enforce authentication'
      );
    } else {
      recordCheck(
        'CHK-SEC-01',
        'Security & Route Guards',
        'Unauthenticated access rejected with HTTP 401 across all routes',
        'FAIL',
        `Statuses: GET=${unauthGet.status}, PATCH=${unauthPatch.status}, POST-mark=${unauthPostMark.status}, POST-token=${unauthPostToken.status}`
      );
    }

    // 4.2 Input validation guards
    const invalidTokenRes = await postDeviceToken(
      new Request('http://localhost/api/client/v1/notifications/device-token', {
        method: 'POST',
        headers: authHeadersA,
        body: JSON.stringify({ token: 'not-an-expo-token' })
      }),
      {}
    );

    const emptyMarkReadRes = await postMarkRead(
      new Request('http://localhost/api/client/v1/notifications/mark-read', {
        method: 'POST',
        headers: authHeadersA,
        body: JSON.stringify({})
      }),
      {}
    );

    const notFoundPatchRes = await patchRead(
      new Request('http://localhost/api/client/v1/notifications/cuid_does_not_exist/read', {
        method: 'PATCH',
        headers: authHeadersA
      }),
      { params: Promise.resolve({ id: 'cuid_does_not_exist' }) }
    );

    const inputValidationPassed =
      invalidTokenRes.status === 400 &&
      emptyMarkReadRes.status === 400 &&
      notFoundPatchRes.status === 404;

    if (inputValidationPassed) {
      recordCheck(
        'CHK-SEC-02',
        'Security & Route Guards',
        'Input validation bounds and error codes (400, 404)',
        'PASS',
        'Invalid token rejected (400), empty mark-read rejected (400), not found returned (404)'
      );
    } else {
      recordCheck(
        'CHK-SEC-02',
        'Security & Route Guards',
        'Input validation bounds and error codes (400, 404)',
        'FAIL',
        `Statuses: invalidToken=${invalidTokenRes.status}, emptyMark=${emptyMarkReadRes.status}, notFound=${notFoundPatchRes.status}`
      );
    }

    // ===========================================================================
    // PHASE 5: IDOR DEFENSE & MULTI-TENANT ISOLATION
    // ===========================================================================
    console.log('\n>>> [PHASE 5] IDOR Defense & Multi-Tenant Isolation Verification...');

    // Create a private notification for Member B
    const notifMemberB = await prisma.notification.create({
      data: {
        memberId: memberB.id,
        title: 'Secret Notification Member B',
        body: 'Confidential message',
        isRead: false
      }
    });

    // Attack 1: Member A attempts to mark Member B's notification read via PATCH /[id]/read
    const idorPatchRes = await patchRead(
      new Request(`http://localhost/api/client/v1/notifications/${notifMemberB.id}/read`, {
        method: 'PATCH',
        headers: authHeadersA
      }),
      { params: Promise.resolve({ id: notifMemberB.id }) }
    );

    const notifMemberBAfterAttack1 = await prisma.notification.findUnique({
      where: { id: notifMemberB.id }
    });

    const attack1Blocked = idorPatchRes.status === 403 && notifMemberBAfterAttack1?.isRead === false;

    if (attack1Blocked) {
      recordCheck(
        'CHK-SEC-03',
        'Security & Route Guards',
        'IDOR Attack 1 (PATCH /[id]/read cross-account modification)',
        'PASS',
        'HTTP 403 Forbidden returned and victim notification remained unread'
      );
    } else {
      recordCheck(
        'CHK-SEC-03',
        'Security & Route Guards',
        'IDOR Attack 1 (PATCH /[id]/read cross-account modification)',
        'FAIL',
        `Status: ${idorPatchRes.status}, isRead: ${notifMemberBAfterAttack1?.isRead}`
      );
    }

    // Attack 2: Member A attempts to batch mark Member B's notification read via POST /mark-read
    const idorPostMarkRes = await postMarkRead(
      new Request('http://localhost/api/client/v1/notifications/mark-read', {
        method: 'POST',
        headers: authHeadersA,
        body: JSON.stringify({ notificationIds: [notifMemberB.id] })
      }),
      {}
    );
    const idorPostMarkJson = await idorPostMarkRes.json();

    const notifMemberBAfterAttack2 = await prisma.notification.findUnique({
      where: { id: notifMemberB.id }
    });

    const attack2Blocked =
      idorPostMarkRes.status === 200 &&
      idorPostMarkJson.markedCount === 0 &&
      notifMemberBAfterAttack2?.isRead === false;

    if (attack2Blocked) {
      recordCheck(
        'CHK-SEC-04',
        'Security & Route Guards',
        'IDOR Attack 2 (POST /mark-read targeting victim notificationIds)',
        'PASS',
        'markedCount=0 and victim notification remained unread'
      );
    } else {
      recordCheck(
        'CHK-SEC-04',
        'Security & Route Guards',
        'IDOR Attack 2 (POST /mark-read targeting victim notificationIds)',
        'FAIL',
        `markedCount: ${idorPostMarkJson.markedCount}, isRead: ${notifMemberBAfterAttack2?.isRead}`
      );
    }

    // Attack 3: Member A attempts to DELETE Member B's device token
    const tokenB_device = 'ExponentPushToken[MemberB_AuditorToken_12345]';
    await prisma.deviceToken.create({
      data: {
        memberId: memberB.id,
        token: tokenB_device,
        platform: 'ios'
      }
    });

    const idorDeleteTokenRes = await deleteDeviceToken(
      new Request('http://localhost/api/client/v1/notifications/device-token', {
        method: 'DELETE',
        headers: authHeadersA,
        body: JSON.stringify({ token: tokenB_device })
      }),
      {}
    );

    const tokenBStillExists = await prisma.deviceToken.findUnique({
      where: { token: tokenB_device }
    });

    const attack3Blocked = tokenBStillExists?.memberId === memberB.id;

    if (attack3Blocked) {
      recordCheck(
        'CHK-SEC-05',
        'Security & Route Guards',
        'IDOR Attack 3 (DELETE /device-token cross-account deletion)',
        'PASS',
        'Member A was unable to delete Member B token; record preserved in DB'
      );
    } else {
      recordCheck(
        'CHK-SEC-05',
        'Security & Route Guards',
        'IDOR Attack 3 (DELETE /device-token cross-account deletion)',
        'FAIL',
        'Victim device token was deleted or corrupted'
      );
    }

    // ===========================================================================
    // PHASE 6: PAGINATION, BADGE UNREAD COUNT & STATE TRANSITIONS
    // ===========================================================================
    console.log('\n>>> [PHASE 6] Pagination, Unread Counts & State Transitions...');

    // Query Member A's notifications
    const getResA = await getNotifications(
      new Request('http://localhost/api/client/v1/notifications?take=10&skip=0', {
        method: 'GET',
        headers: authHeadersA
      }),
      {}
    );
    const getJsonA = await getResA.json();

    const countA = getJsonA.unreadCount;
    const itemsA = getJsonA.notifications;

    // Verify all items belong to Member A
    const allBelongToA = itemsA.every((n: any) => n.memberId === memberA.id);

    if (getResA.status === 200 && allBelongToA && countA > 0) {
      recordCheck(
        'CHK-PAG-01',
        'State & Pagination Integrity',
        'GET /notifications tenant boundary and unread count',
        'PASS',
        `Returned ${itemsA.length} notifications, all strictly scoped to memberId=${memberA.id}, unreadCount=${countA}`
      );
    } else {
      recordCheck(
        'CHK-PAG-01',
        'State & Pagination Integrity',
        'GET /notifications tenant boundary and unread count',
        'FAIL',
        `allBelongToA=${allBelongToA}, unreadCount=${countA}`
      );
    }

    // Bulk mark-read for Member A with all: true
    const bulkAllResA = await postMarkRead(
      new Request('http://localhost/api/client/v1/notifications/mark-read', {
        method: 'POST',
        headers: authHeadersA,
        body: JSON.stringify({ all: true })
      }),
      {}
    );
    const bulkAllJsonA = await bulkAllResA.json();

    const getResA_afterBulk = await getNotifications(
      new Request('http://localhost/api/client/v1/notifications', {
        method: 'GET',
        headers: authHeadersA
      }),
      {}
    );
    const getJsonA_afterBulk = await getResA_afterBulk.json();

    const notifMemberB_afterA_Bulk = await prisma.notification.findUnique({
      where: { id: notifMemberB.id }
    });

    const bulkAllPassed =
      bulkAllResA.status === 200 &&
      bulkAllJsonA.markedCount > 0 &&
      getJsonA_afterBulk.unreadCount === 0 &&
      notifMemberB_afterA_Bulk?.isRead === false;

    if (bulkAllPassed) {
      recordCheck(
        'CHK-PAG-02',
        'State & Pagination Integrity',
        'Bulk mark-read { all: true } updates unread count to 0 without affecting Member B',
        'PASS',
        `Member A unreadCount transitioned to 0; Member B unread state intact`
      );
    } else {
      recordCheck(
        'CHK-PAG-02',
        'State & Pagination Integrity',
        'Bulk mark-read { all: true } updates unread count to 0 without affecting Member B',
        'FAIL',
        `Member A unread: ${getJsonA_afterBulk.unreadCount}, Member B isRead: ${notifMemberB_afterA_Bulk?.isRead}`
      );
    }

  } finally {
    // Teardown audit test members
    console.log('\n>>> Cleaning up forensic audit test records...');
    const auditIds = [memberA.id, memberB.id];
    await prisma.deviceToken.deleteMany({ where: { memberId: { in: auditIds } } });
    await prisma.notification.deleteMany({ where: { memberId: { in: auditIds } } });
    await prisma.member.deleteMany({ where: { id: { in: auditIds } } });
    console.log('>>> Teardown complete.\n');
  }

  // ===========================================================================
  // AUDIT SUMMARY
  // ===========================================================================
  console.log('========================================================================');
  console.log('📋 FORENSIC AUDIT SUMMARY');
  console.log('========================================================================');
  const totalChecks = checkResults.length;
  const passedChecks = checkResults.filter(c => c.status === 'PASS').length;
  const failedChecks = totalChecks - passedChecks;

  console.log(`Total Forensic Checks : ${totalChecks}`);
  console.log(`Checks Passed         : ${passedChecks}`);
  console.log(`Checks Failed         : ${failedChecks}`);

  if (failedChecks > 0) {
    console.error('\n🚨 FORENSIC INTEGRITY VIOLATION DETECTED:');
    checkResults.filter(c => c.status === 'FAIL').forEach(c => {
      console.error(`- [${c.id}] ${c.name}: ${c.evidence}`);
    });
    process.exit(1);
  } else {
    console.log('\n🛡️ VERDICT: ALL FORENSIC INTEGRITY CHECKS PASSED -- CLEAN 🛡️');
    process.exit(0);
  }
}

runForensicAudit().catch(err => {
  console.error('Forensic test runner fatal error:', err);
  process.exit(1);
});
