import { prisma } from '../src/lib/prisma';

interface TestResult {
  suite: string;
  step: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function runStep(suite: string, step: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ suite, step, passed: true });
    console.log(`  [PASS] ${step}`);
  } catch (err: any) {
    results.push({ suite, step, passed: false, error: err?.message || String(err) });
    console.error(`  [FAIL] ${step}:`, err?.message || err);
    throw err;
  }
}

async function runSuite1() {
  console.log('\n--- SUITE 1: BASE REQUIREMENTS EMPIRICAL VERIFICATION ---');
  const testMobile = `9999${Date.now().toString().slice(-6)}`;
  const testTokenValue = `ExponentPushToken[base_${Date.now()}_alpha]`;
  const duplicateTokenValue = testTokenValue;
  const secondTokenValue = `ExponentPushToken[base_${Date.now()}_beta]`;
  let memberId = '';
  let notificationId = '';
  let deviceTokenId = '';

  try {
    // 1. Create a test Member record
    await runStep('Suite 1', 'Step 1.1: Create test Member record', async () => {
      const member = await prisma.member.create({
        data: {
          name: 'Empirical Test Member',
          mobile: testMobile,
          email: `test_${Date.now()}@sportsvilla.test`,
        },
      });
      memberId = member.id;
      if (!member.id) throw new Error('Member ID missing');
      console.log(`    -> Member created: ${member.id}`);
    });

    // 2. Create a DeviceToken linked to that member
    await runStep('Suite 1', 'Step 1.2: Create DeviceToken linked to Member', async () => {
      const dt = await prisma.deviceToken.create({
        data: {
          memberId,
          token: testTokenValue,
          platform: 'android',
        },
      });
      deviceTokenId = dt.id;
      if (dt.memberId !== memberId || dt.token !== testTokenValue) throw new Error('DeviceToken mismatch');
      console.log(`    -> DeviceToken created: ${dt.id}`);
    });

    // 3. Verify duplicate tokens rejected (unique constraint)
    await runStep('Suite 1', 'Step 1.3: Reject duplicate tokens (unique constraint on token)', async () => {
      let caught = false;
      try {
        await prisma.deviceToken.create({
          data: {
            memberId,
            token: duplicateTokenValue,
            platform: 'ios',
          },
        });
      } catch (err: any) {
        if (err.code === 'P2002' || /unique constraint/i.test(err.message)) {
          caught = true;
          console.log(`    -> Caught expected unique violation: ${err.code || err.message}`);
        } else {
          throw err;
        }
      }
      if (!caught) throw new Error('Duplicate token was unexpectedly allowed');
    });

    // 4. Verify upsert works on DeviceToken
    await runStep('Suite 1', 'Step 1.4: Verify upsert on DeviceToken', async () => {
      // Upsert update existing token
      const updated = await prisma.deviceToken.upsert({
        where: { token: testTokenValue },
        update: { platform: 'ios' },
        create: { memberId, token: testTokenValue, platform: 'ios' },
      });
      if (updated.id !== deviceTokenId || updated.platform !== 'ios') throw new Error('Upsert update failed');

      // Upsert insert new token
      const created = await prisma.deviceToken.upsert({
        where: { token: secondTokenValue },
        update: { platform: 'android' },
        create: { memberId, token: secondTokenValue, platform: 'android' },
      });
      if (created.token !== secondTokenValue) throw new Error('Upsert create failed');
      console.log(`    -> Upsert update on ${updated.id}, Upsert create on ${created.id}`);
    });

    // 5. Create Notification with rich JSON data and default isRead: false
    await runStep('Suite 1', 'Step 1.5: Create Notification with rich JSON data and default isRead: false', async () => {
      const richData = {
        bookingId: 'book_emp_001',
        type: 'BOOKING_CONFIRMED',
        turfName: 'Padel Arena 1',
        amount: 1200,
        nested: { tags: ['tournament', 'finals'], priority: 'HIGH' },
      };

      const notif = await prisma.notification.create({
        data: {
          memberId,
          title: 'Booking Confirmed',
          body: 'Your court has been successfully reserved.',
          data: richData,
        },
      });
      notificationId = notif.id;

      if (notif.isRead !== false) throw new Error(`Default isRead should be false, got: ${notif.isRead}`);
      if (notif.readAt !== null) throw new Error(`Default readAt should be null, got: ${notif.readAt}`);
      const dataParsed = typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data;
      if (dataParsed?.bookingId !== 'book_emp_001') throw new Error('Rich JSON data verification failed');
      console.log(`    -> Notification created: ${notif.id} (isRead: ${notif.isRead}, readAt: ${notif.readAt})`);
    });

    // 6. Update Notification to isRead: true and set readAt
    await runStep('Suite 1', 'Step 1.6: Update Notification to isRead: true and set readAt', async () => {
      const timestamp = new Date();
      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: timestamp,
        },
      });
      if (updated.isRead !== true) throw new Error('isRead was not updated to true');
      if (!updated.readAt) throw new Error('readAt was not set');
      console.log(`    -> Notification updated: ${updated.id} (isRead: ${updated.isRead}, readAt: ${updated.readAt.toISOString()})`);
    });

    // 7. Verify reverse relations from Member
    await runStep('Suite 1', 'Step 1.7: Query Member reverse relations (deviceTokens & notifications)', async () => {
      const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: { deviceTokens: true, notifications: true },
      });
      if (!member) throw new Error('Member not found');
      if (member.deviceTokens.length !== 2) throw new Error(`Expected 2 tokens, got ${member.deviceTokens.length}`);
      if (member.notifications.length !== 1) throw new Error(`Expected 1 notif, got ${member.notifications.length}`);
      console.log(`    -> Member relations confirmed (tokens: ${member.deviceTokens.length}, notifs: ${member.notifications.length})`);
    });

    // 8. Test Cascade Delete: delete Member and verify DeviceToken and Notification records are deleted
    await runStep('Suite 1', 'Step 1.8: Cascade Delete on Member deletion', async () => {
      await prisma.member.delete({ where: { id: memberId } });
      const memberCheck = await prisma.member.findUnique({ where: { id: memberId } });
      if (memberCheck !== null) throw new Error('Member deletion failed');

      const dtRemaining = await prisma.deviceToken.count({ where: { memberId } });
      const notifRemaining = await prisma.notification.count({ where: { memberId } });
      if (dtRemaining !== 0 || notifRemaining !== 0) {
        throw new Error(`Cascade failed: remaining tokens=${dtRemaining}, notifs=${notifRemaining}`);
      }
      console.log(`    -> Cascade verified: Member deleted, remaining tokens: ${dtRemaining}, remaining notifs: ${notifRemaining}`);
    });
  } catch (err) {
    if (memberId) {
      await prisma.member.deleteMany({ where: { id: memberId } }).catch(() => {});
      await prisma.deviceToken.deleteMany({ where: { memberId } }).catch(() => {});
      await prisma.notification.deleteMany({ where: { memberId } }).catch(() => {});
    }
    throw err;
  }
}

async function runSuite2() {
  console.log('\n--- SUITE 2: ADVANCED ADVERSARIAL STRESS TESTING ---');
  const testMobile1 = `9999${Date.now().toString().slice(-6)}`;
  const testMobile2 = `8888${Date.now().toString().slice(-6)}`;
  const tokenShared = `ExponentPushToken[shared_${Date.now()}]`;
  let member1Id = '';
  let member2Id = '';

  try {
    // 2.1 Multi-user setup
    await runStep('Suite 2', 'Step 2.1: Create dual test members for cross-account testing', async () => {
      const m1 = await prisma.member.create({
        data: { name: 'User One', mobile: testMobile1 },
      });
      const m2 = await prisma.member.create({
        data: { name: 'User Two', mobile: testMobile2 },
      });
      member1Id = m1.id;
      member2Id = m2.id;
      console.log(`    -> Created members: ${member1Id} and ${member2Id}`);
    });

    // 2.2 Reassignment across members via upsert (same device changing active user)
    await runStep('Suite 2', 'Step 2.2: Reassign device token across members via upsert', async () => {
      const dt1 = await prisma.deviceToken.upsert({
        where: { token: tokenShared },
        update: { memberId: member1Id },
        create: { memberId: member1Id, token: tokenShared, platform: 'ios' },
      });
      if (dt1.memberId !== member1Id) throw new Error('Token initially failed to bind to User One');

      const dt2 = await prisma.deviceToken.upsert({
        where: { token: tokenShared },
        update: { memberId: member2Id },
        create: { memberId: member2Id, token: tokenShared, platform: 'ios' },
      });
      if (dt2.memberId !== member2Id || dt2.id !== dt1.id) throw new Error('Token re-assignment failed');

      const m1Count = await prisma.deviceToken.count({ where: { memberId: member1Id } });
      const m2Count = await prisma.deviceToken.count({ where: { memberId: member2Id } });
      if (m1Count !== 0 || m2Count !== 1) throw new Error('Device token ownership transfer failed');
      console.log(`    -> Token reassigned from User One to User Two cleanly`);
    });

    // 2.3 Foreign Key constraints on orphaned records
    await runStep('Suite 2', 'Step 2.3: Enforce foreign key constraints against orphaned inserts', async () => {
      const nonExistentMember = 'invalid_member_cuid_999999';
      let dtBlocked = false;
      try {
        await prisma.deviceToken.create({
          data: { memberId: nonExistentMember, token: `ExponentPushToken[orphan_${Date.now()}]` },
        });
      } catch (err: any) {
        dtBlocked = true;
      }
      if (!dtBlocked) throw new Error('Orphaned DeviceToken was permitted');

      let notifBlocked = false;
      try {
        await prisma.notification.create({
          data: { memberId: nonExistentMember, title: 'Orphan', body: 'Orphan body' },
        });
      } catch (err: any) {
        notifBlocked = true;
      }
      if (!notifBlocked) throw new Error('Orphaned Notification was permitted');
      console.log(`    -> Foreign key constraints strictly prevented orphaned inserts`);
    });

    // 2.4 High-volume notification batch and compound index query verification
    await runStep('Suite 2', 'Step 2.4: Batch notification inbox queries & indexing', async () => {
      const notificationsData = Array.from({ length: 10 }).map((_, i) => ({
        memberId: member2Id,
        title: `Alert ${i + 1}`,
        body: `Batch notification body ${i + 1}`,
        isRead: i < 3, // 3 read, 7 unread
        readAt: i < 3 ? new Date() : null,
        data: { batchIndex: i + 1, level: 'INFO' },
      }));

      for (const item of notificationsData) {
        await prisma.notification.create({ data: item });
      }

      // Query unread count
      const unreadCount = await prisma.notification.count({
        where: { memberId: member2Id, isRead: false },
      });
      if (unreadCount !== 7) throw new Error(`Expected 7 unread, got ${unreadCount}`);

      // Query paginated inbox ordered by createdAt desc
      const feed = await prisma.notification.findMany({
        where: { memberId: member2Id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
      if (feed.length !== 5) throw new Error(`Expected 5 items in feed page, got ${feed.length}`);

      // Bulk mark as read
      const markResult = await prisma.notification.updateMany({
        where: { memberId: member2Id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      if (markResult.count !== 7) throw new Error(`Expected 7 updated to read, got ${markResult.count}`);
      console.log(`    -> Batch insertion, unread query, pagination, and bulk update all validated`);
    });

    // 2.5 Cascade isolation: Deleting User Two does NOT impact User One
    await runStep('Suite 2', 'Step 2.5: Cascade Isolation across multiple members', async () => {
      // Give User One a token and a notification
      await prisma.deviceToken.create({
        data: { memberId: member1Id, token: `ExponentPushToken[u1_${Date.now()}]` },
      });
      await prisma.notification.create({
        data: { memberId: member1Id, title: 'U1 Notice', body: 'U1 Body' },
      });

      // Delete User Two
      await prisma.member.delete({ where: { id: member2Id } });

      // Verify User Two cascade
      const m2Tokens = await prisma.deviceToken.count({ where: { memberId: member2Id } });
      const m2Notifs = await prisma.notification.count({ where: { memberId: member2Id } });
      if (m2Tokens !== 0 || m2Notifs !== 0) throw new Error('User Two cascade incomplete');

      // Verify User One isolation
      const m1Tokens = await prisma.deviceToken.count({ where: { memberId: member1Id } });
      const m1Notifs = await prisma.notification.count({ where: { memberId: member1Id } });
      if (m1Tokens !== 1 || m1Notifs !== 1) throw new Error('User One affected by User Two deletion');
      console.log(`    -> Cascade isolation confirmed: User Two wiped, User One intact`);

      // Cleanup User One
      await prisma.member.delete({ where: { id: member1Id } });
      const m1FinalTokens = await prisma.deviceToken.count({ where: { memberId: member1Id } });
      const m1FinalNotifs = await prisma.notification.count({ where: { memberId: member1Id } });
      if (m1FinalTokens !== 0 || m1FinalNotifs !== 0) throw new Error('User One final cascade failed');
      console.log(`    -> User One wiped cleanly with cascade`);
    });
  } catch (err) {
    if (member1Id) await prisma.member.deleteMany({ where: { id: member1Id } }).catch(() => {});
    if (member2Id) await prisma.member.deleteMany({ where: { id: member2Id } }).catch(() => {});
    throw err;
  }
}

async function main() {
  console.log('===============================================================');
  console.log('  MILESTONE R1: EMPIRICAL CHALLENGER VERIFICATION & STRESS TEST ');
  console.log('===============================================================');

  try {
    await runSuite1();
    await runSuite2();

    console.log('\n===============================================================');
    console.log(`  VERDICT: 13 / 13 TESTS PASSED (100% SUCCESS RATE)`);
    console.log('  ALL CONSTRAINTS, CASCADES, AND OPERATIONS FULLY VERIFIED');
    console.log('===============================================================\n');
  } catch (err) {
    console.error('\n*** TEST SUITE ENCOUNTERED UNHANDLED FAILURE ***\n', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
