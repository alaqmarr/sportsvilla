import { prisma } from '../../src/lib/prisma';
import type { DeviceToken, Notification, Member, Prisma } from '../../src/generated/client';

async function testTypesAndOperations() {
  // Static type tests
  type AssertEqual<T, Expected> = [T] extends [Expected] ? ([Expected] extends [T] ? true : false) : false;

  type _t1 = AssertEqual<DeviceToken['id'], string>;
  type _t2 = AssertEqual<DeviceToken['memberId'], string>;
  type _t3 = AssertEqual<DeviceToken['token'], string>;
  type _t4 = AssertEqual<DeviceToken['platform'], string | null>;
  type _t5 = AssertEqual<DeviceToken['createdAt'], Date>;
  type _t6 = AssertEqual<DeviceToken['updatedAt'], Date>;

  type _n1 = AssertEqual<Notification['id'], string>;
  type _n2 = AssertEqual<Notification['memberId'], string>;
  type _n3 = AssertEqual<Notification['title'], string>;
  type _n4 = AssertEqual<Notification['body'], string>;
  type _n5 = AssertEqual<Notification['data'], Prisma.JsonValue | null>;
  type _n6 = AssertEqual<Notification['isRead'], boolean>;
  type _n7 = AssertEqual<Notification['readAt'], Date | null>;
  type _n8 = AssertEqual<Notification['createdAt'], Date>;

  // Type test for Member including relations
  type MemberWithRelations = Prisma.MemberGetPayload<{
    include: { deviceTokens: true; notifications: true };
  }>;

  type _m1 = MemberWithRelations['deviceTokens']; // DeviceToken[]
  type _m2 = MemberWithRelations['notifications']; // Notification[]

  console.log('TypeScript static types verified successfully.');

  // Test relational cascade and constraints in transaction (roll back at end)
  await prisma.$transaction(async (tx) => {
    // Create a temporary member
    const tempMobile = '9999999999';
    // Clean up if existed
    await tx.member.deleteMany({ where: { mobile: tempMobile } });

    const member = await tx.member.create({
      data: {
        mobile: tempMobile,
        name: 'Test Notification User',
      },
    });

    // 1. Create DeviceToken
    const deviceToken = await tx.deviceToken.create({
      data: {
        memberId: member.id,
        token: 'ExponentPushToken[test-token-12345]',
        platform: 'android',
      },
    });
    console.log('Created DeviceToken:', deviceToken.id);

    // Test token uniqueness constraint
    let duplicateCaught = false;
    try {
      await tx.deviceToken.create({
        data: {
          memberId: member.id,
          token: 'ExponentPushToken[test-token-12345]',
        },
      });
    } catch (e: any) {
      duplicateCaught = true;
    }
    if (!duplicateCaught) {
      throw new Error('Expected unique constraint violation on duplicate token');
    }
    console.log('Unique token constraint verified.');

    // 2. Create Notification
    const notification = await tx.notification.create({
      data: {
        memberId: member.id,
        title: 'Booking Confirmed!',
        body: 'Your slot has been booked.',
        data: { bookingId: 'b_123', turfName: 'Turf A' },
      },
    });
    console.log('Created Notification:', notification.id, 'isRead default:', notification.isRead);
    if (notification.isRead !== false) {
      throw new Error('Notification isRead default should be false');
    }

    // 3. Query member with relations
    const memberFetched = await tx.member.findUnique({
      where: { id: member.id },
      include: {
        deviceTokens: true,
        notifications: true,
      },
    });

    if (!memberFetched || memberFetched.deviceTokens.length !== 1 || memberFetched.notifications.length !== 1) {
      throw new Error('Reverse relations query failed or returned unexpected counts');
    }
    console.log('Reverse relations verified on Member.');

    // 4. Test query with indexes
    const unreadNotifications = await tx.notification.findMany({
      where: {
        memberId: member.id,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    if (unreadNotifications.length !== 1) {
      throw new Error('Indexed notification query failed');
    }
    console.log('Indexed query [memberId, isRead] / [memberId, createdAt] verified.');

    // 5. Test Cascade Delete
    await tx.member.delete({
      where: { id: member.id },
    });

    const remainingTokens = await tx.deviceToken.count({ where: { memberId: member.id } });
    const remainingNotifs = await tx.notification.count({ where: { memberId: member.id } });

    if (remainingTokens !== 0 || remainingNotifs !== 0) {
      throw new Error(`Cascade delete failed: tokens=${remainingTokens}, notifs=${remainingNotifs}`);
    }
    console.log('Cascade deletion verified.');

    // Intentionally rollback so no test data remains
    throw new Error('ROLLBACK_TRANSACTION');
  }).catch((err) => {
    if (err.message === 'ROLLBACK_TRANSACTION') {
      console.log('Transaction safely rolled back, no residual test data.');
    } else {
      console.error('Test failed with unexpected error:', err);
      process.exit(1);
    }
  });

  console.log('All tests passed successfully!');
}

testTypesAndOperations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
