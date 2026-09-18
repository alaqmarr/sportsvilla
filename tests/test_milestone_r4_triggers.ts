import { prisma } from '@/lib/prisma';
import { 
  sendMembershipPush, 
  sendWalletTransactionPush, 
  sendBookingConfirmedPush 
} from '@/lib/notifications';
import { WalletService } from '@/services/WalletService';

async function runTests() {
  console.log('=== Milestone R4 Event Triggers Verification Suite ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Create temporary test member
  const testMobile = `999${Math.floor(1000000 + Math.random() * 9000000)}`;
  const member = await prisma.member.create({
    data: {
      mobile: testMobile,
      name: 'R4 Trigger Test User',
      walletBalance: 100000, // 1000 INR
    }
  });

  try {
    // Test 1: sendMembershipPush with default actionType ('ASSIGNED')
    console.log('\n--- Test 1: sendMembershipPush (Default: ASSIGNED) ---');
    await sendMembershipPush(member.id, 'Gold Tier');
    const notif1 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(!!notif1, 'Notification record created in DB');
    assert(notif1?.title === 'Membership Activated! 🏆', `Title matches spec: "${notif1?.title}"`);
    assert(
      notif1?.body === 'Your Gold Tier membership has been assigned. Enjoy your member perks!',
      `Body matches ASSIGNED spec: "${notif1?.body}"`
    );
    const data1 = notif1?.data as any;
    assert(data1?.screen === 'memberships', `Data screen is "memberships": "${data1?.screen}"`);
    assert(data1?.type === 'MEMBERSHIP_ACTIVE', `Data type is "MEMBERSHIP_ACTIVE": "${data1?.type}"`);

    // Test 2: sendMembershipPush with PURCHASED
    console.log('\n--- Test 2: sendMembershipPush (PURCHASED) ---');
    await sendMembershipPush(member.id, 'Platinum Annual', 'PURCHASED');
    const notif2 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(
      notif2?.body === 'Your Platinum Annual membership has been purchased. Enjoy your member perks!',
      `Body matches PURCHASED spec: "${notif2?.body}"`
    );

    // Test 3: sendWalletTransactionPush (CREDIT)
    console.log('\n--- Test 3: sendWalletTransactionPush (CREDIT) ---');
    await sendWalletTransactionPush(member.id, 250.75, 'CREDIT', 'Bonus top-up');
    const notif3 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(notif3?.title === 'Wallet Credited 💳', `Title matches CREDIT spec: "${notif3?.title}"`);
    assert(
      notif3?.body === '₹251 has been added to your wallet. (Bonus top-up)',
      `Body rounded amount and added to: "${notif3?.body}"`
    );
    const data3 = notif3?.data as any;
    assert(data3?.screen === 'wallet', `Data screen is "wallet": "${data3?.screen}"`);
    assert(data3?.type === 'WALLET_TRANSACTION', `Data type is "WALLET_TRANSACTION": "${data3?.type}"`);
    assert(data3?.amount === 250.75, `Data amount matches input: ${data3?.amount}`);
    assert(data3?.transactionType === 'CREDIT', `Data transactionType is "CREDIT": "${data3?.transactionType}"`);

    // Test 4: sendWalletTransactionPush (DEBIT without description)
    console.log('\n--- Test 4: sendWalletTransactionPush (DEBIT without description) ---');
    await sendWalletTransactionPush(member.id, 100, 'DEBIT');
    const notif4 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(notif4?.title === 'Wallet Debited 💳', `Title matches DEBIT spec: "${notif4?.title}"`);
    assert(
      notif4?.body === '₹100 has been deducted from your wallet.',
      `Body deducted from: "${notif4?.body}"`
    );
    const data4 = notif4?.data as any;
    assert(data4?.transactionType === 'DEBIT', `Data transactionType is "DEBIT": "${data4?.transactionType}"`);

    // Test 5: sendBookingConfirmedPush
    console.log('\n--- Test 5: sendBookingConfirmedPush ---');
    const start = new Date('2026-10-15T10:00:00.000Z');
    const end = new Date('2026-10-15T11:00:00.000Z');
    await sendBookingConfirmedPush({
      id: 'test-booking-123',
      memberId: member.id,
      turf: { name: 'Court A' },
      sport: { name: 'Badminton' },
      startTime: start,
      endTime: end
    });
    const notif5 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(notif5?.title === 'Booking Confirmed! 🎾', `Title matches booking confirmed spec: "${notif5?.title}"`);
    const data5 = notif5?.data as any;
    assert(data5?.screen === 'bookings', `Data screen is "bookings": "${data5?.screen}"`);
    assert(data5?.type === 'BOOKING_CONFIRMED', `Data type is "BOOKING_CONFIRMED": "${data5?.type}"`);
    assert(data5?.bookingId === 'test-booking-123', `Data bookingId matches: "${data5?.bookingId}"`);

    // Test 6: WalletService integration with push notifications
    console.log('\n--- Test 6: WalletService integration ---');
    const creditSuccess = await WalletService.creditBalance(member.id, 50, 'Credit test');
    assert(creditSuccess, 'WalletService.creditBalance succeeded');
    await new Promise(resolve => setTimeout(resolve, 300));
    const notif6 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(notif6?.title === 'Wallet Credited 💳', `WalletService credit triggered push: "${notif6?.title}"`);

    const deductSuccess = await WalletService.deductBalance(member.id, 30, 'Debit test');
    assert(deductSuccess, 'WalletService.deductBalance succeeded');
    await new Promise(resolve => setTimeout(resolve, 300));
    const notif7 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(notif7?.title === 'Wallet Debited 💳', `WalletService debit triggered push: "${notif7?.title}"`);

    // Test 7: Error handling / non-throwing safety
    console.log('\n--- Test 7: Error resilience / Never throw ---');
    let didThrow = false;
    try {
      // Pass null/empty values to simulate errors
      await sendMembershipPush('non-existent-member-id', 'Test Plan');
      await sendWalletTransactionPush('non-existent-member-id', 50, 'CREDIT');
      await sendBookingConfirmedPush({
        id: 'fake-id',
        memberId: 'non-existent-member-id',
        turf: null,
        sport: null,
        startTime: 'invalid-date',
        endTime: 'invalid-date'
      });
    } catch (e) {
      didThrow = true;
    }
    assert(!didThrow, 'Push utility functions NEVER throw unhandled errors to callers');

  } finally {
    // Cleanup test data
    await prisma.notification.deleteMany({ where: { memberId: member.id } });
    await prisma.walletTransaction.deleteMany({ where: { memberId: member.id } });
    await prisma.member.delete({ where: { id: member.id } });
  }

  console.log(`\n=== Verification Results: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
