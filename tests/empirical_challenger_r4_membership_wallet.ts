import { prisma } from '@/lib/prisma';
import { 
  sendMembershipPush, 
  sendWalletTransactionPush,
  sendPushNotification
} from '@/lib/notifications';
import { WalletService } from '@/services/WalletService';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, failureDetails?: string) {
  if (condition) {
    console.log(`  [PASS] ${name}`);
    results.push({ name, passed: true });
  } else {
    console.error(`  [FAIL] ${name}${failureDetails ? ` - Details: ${failureDetails}` : ''}`);
    results.push({ name, passed: false, error: failureDetails || 'Assertion failed' });
  }
}

async function runEmpiricalTests() {
  console.log('================================================================');
  console.log('  CHALLENGER 2: EMPIRICAL TEST SUITE - MILESTONE R4');
  console.log('  Target: Membership & Wallet Transaction Push Triggers');
  console.log('================================================================\n');

  // Create isolated test member
  const testMobile = `987${Math.floor(1000000 + Math.random() * 9000000)}`;
  const member = await prisma.member.create({
    data: {
      mobile: testMobile,
      name: 'Empirical Challenger R4 Member',
      walletBalance: 50000, // 500 INR
    }
  });
  console.log(`Created test member: ${member.id} (${member.mobile})`);

  try {
    // ================================================================
    // 1. MEMBERSHIP NOTIFICATION TRIGGER TESTS
    // ================================================================
    console.log('\n--- SUITE 1: sendMembershipPush ---');

    // 1.1: ASSIGNED explicitly passed
    console.log('Scenario 1.1: Explicit actionType = ASSIGNED');
    await sendMembershipPush(member.id, 'Gold Annual Plan', 'ASSIGNED');
    const mNotif1 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(!!mNotif1, '1.1 Notification record created in DB for ASSIGNED');
    assert(mNotif1?.title === 'Membership Activated! 🏆', '1.1 Title exactly matches "Membership Activated! 🏆"', mNotif1?.title);
    assert(
      mNotif1?.body === 'Your Gold Annual Plan membership has been assigned. Enjoy your member perks!',
      '1.1 Body matches assigned template with planName',
      mNotif1?.body
    );
    const mData1 = mNotif1?.data as any;
    assert(mData1?.screen === 'memberships', '1.1 Data screen is "memberships"', mData1?.screen);
    assert(mData1?.type === 'MEMBERSHIP_ACTIVE', '1.1 Data type is "MEMBERSHIP_ACTIVE"', mData1?.type);
    assert(mNotif1?.isRead === false, '1.1 isRead initialized to false');

    // 1.2: Default actionType (omitted 3rd param -> default ASSIGNED)
    console.log('Scenario 1.2: Default actionType (omitted)');
    await sendMembershipPush(member.id, 'Silver Tier');
    const mNotif2 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(
      mNotif2?.body === 'Your Silver Tier membership has been assigned. Enjoy your member perks!',
      '1.2 Default actionType falls back to ASSIGNED wording',
      mNotif2?.body
    );
    assert(mNotif2?.title === 'Membership Activated! 🏆', '1.2 Default actionType title matches');

    // 1.3: PURCHASED explicitly passed
    console.log('Scenario 1.3: Explicit actionType = PURCHASED');
    await sendMembershipPush(member.id, 'Platinum Elite', 'PURCHASED');
    const mNotif3 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(
      mNotif3?.body === 'Your Platinum Elite membership has been purchased. Enjoy your member perks!',
      '1.3 Body matches purchased template with planName',
      mNotif3?.body
    );
    const mData3 = mNotif3?.data as any;
    assert(mData3?.screen === 'memberships', '1.3 Data screen is "memberships" for PURCHASED');
    assert(mData3?.type === 'MEMBERSHIP_ACTIVE', '1.3 Data type is "MEMBERSHIP_ACTIVE" for PURCHASED');

    // 1.4: Special plan names (special chars, parentheses, unicode)
    console.log('Scenario 1.4: Special characters in planName');
    const specialPlan = 'VIP 3-Month Plan (Badminton & Tennis) #1';
    await sendMembershipPush(member.id, specialPlan, 'PURCHASED');
    const mNotif4 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(
      mNotif4?.body === `Your ${specialPlan} membership has been purchased. Enjoy your member perks!`,
      '1.4 Special characters and punctuation preserved in body',
      mNotif4?.body
    );

    // ================================================================
    // 2. WALLET TRANSACTION NOTIFICATION TRIGGER TESTS
    // ================================================================
    console.log('\n--- SUITE 2: sendWalletTransactionPush ---');

    // 2.1: CREDIT with description
    console.log('Scenario 2.1: CREDIT with description');
    await sendWalletTransactionPush(member.id, 500, 'CREDIT', 'Cash deposit at reception');
    const wNotif1 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(!!wNotif1, '2.1 Notification record created in DB for CREDIT');
    assert(wNotif1?.title === 'Wallet Credited 💳', '2.1 Title matches "Wallet Credited 💳"', wNotif1?.title);
    assert(
      wNotif1?.body === '₹500 has been added to your wallet. (Cash deposit at reception)',
      '2.1 Body matches credit template with description',
      wNotif1?.body
    );
    const wData1 = wNotif1?.data as any;
    assert(wData1?.screen === 'wallet', '2.1 Data screen is "wallet"', wData1?.screen);
    assert(wData1?.type === 'WALLET_TRANSACTION', '2.1 Data type is "WALLET_TRANSACTION"', wData1?.type);
    assert(wData1?.amount === 500, '2.1 Data amount is 500', `${wData1?.amount}`);
    assert(wData1?.transactionType === 'CREDIT', '2.1 Data transactionType is "CREDIT"', wData1?.transactionType);

    // 2.2: CREDIT without description (undefined)
    console.log('Scenario 2.2: CREDIT without description');
    await sendWalletTransactionPush(member.id, 100, 'CREDIT');
    const wNotif2 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(
      wNotif2?.body === '₹100 has been added to your wallet.',
      '2.2 Body has no trailing space or empty parens when description is omitted',
      wNotif2?.body
    );

    // 2.3: CREDIT amount rounding stress tests
    console.log('Scenario 2.3: CREDIT amount rounding');
    // Round down test: 250.49 -> 250
    await sendWalletTransactionPush(member.id, 250.49, 'CREDIT', 'Round down test');
    const wNotif3a = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(
      wNotif3a?.body === '₹250 has been added to your wallet. (Round down test)',
      '2.3a Body rounds 250.49 down to ₹250',
      wNotif3a?.body
    );
    assert((wNotif3a?.data as any)?.amount === 250.49, '2.3a Data payload preserves exact floating amount 250.49');

    // Round up test: 250.50 -> 251
    await sendWalletTransactionPush(member.id, 250.50, 'CREDIT', 'Round up test');
    const wNotif3b = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(
      wNotif3b?.body === '₹251 has been added to your wallet. (Round up test)',
      '2.3b Body rounds 250.50 up to ₹251',
      wNotif3b?.body
    );

    // 99.99 test -> 100
    await sendWalletTransactionPush(member.id, 99.99, 'CREDIT');
    const wNotif3c = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(
      wNotif3c?.body === '₹100 has been added to your wallet.',
      '2.3c Body rounds 99.99 to ₹100',
      wNotif3c?.body
    );

    // 2.4: DEBIT with description
    console.log('Scenario 2.4: DEBIT with description');
    await sendWalletTransactionPush(member.id, 350, 'DEBIT', 'Badminton Court 1 Booking');
    const wNotif4 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(wNotif4?.title === 'Wallet Debited 💳', '2.4 Title matches "Wallet Debited 💳"', wNotif4?.title);
    assert(
      wNotif4?.body === '₹350 has been deducted from your wallet. (Badminton Court 1 Booking)',
      '2.4 Body matches debit template with description',
      wNotif4?.body
    );
    const wData4 = wNotif4?.data as any;
    assert(wData4?.screen === 'wallet', '2.4 Data screen is "wallet"', wData4?.screen);
    assert(wData4?.type === 'WALLET_TRANSACTION', '2.4 Data type is "WALLET_TRANSACTION"', wData4?.type);
    assert(wData4?.amount === 350, '2.4 Data amount is 350', `${wData4?.amount}`);
    assert(wData4?.transactionType === 'DEBIT', '2.4 Data transactionType is "DEBIT"', wData4?.transactionType);

    // 2.5: DEBIT without description
    console.log('Scenario 2.5: DEBIT without description');
    await sendWalletTransactionPush(member.id, 75, 'DEBIT');
    const wNotif5 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(
      wNotif5?.body === '₹75 has been deducted from your wallet.',
      '2.5 Body matches debit template without description',
      wNotif5?.body
    );

    // 2.6: DEBIT rounding check (49.20 -> 49)
    console.log('Scenario 2.6: DEBIT rounding');
    await sendWalletTransactionPush(member.id, 49.20, 'DEBIT');
    const wNotif6 = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(
      wNotif6?.body === '₹49 has been deducted from your wallet.',
      '2.6 Body rounds 49.20 to ₹49',
      wNotif6?.body
    );

    // ================================================================
    // 3. DEVICE TOKEN RESOLUTION & TOKEN PRUNING TESTS
    // ================================================================
    console.log('\n--- SUITE 3: DeviceToken Lifecycle & Pruning ---');

    // Create an invalid device token in DB to test automatic pruning
    const invalidTokenStr = 'INVALID_EXPO_TOKEN_SAMPLE_XYZ';
    await prisma.deviceToken.create({
      data: {
        memberId: member.id,
        token: invalidTokenStr,
        platform: 'android'
      }
    });
    console.log(`Created invalid token in DB: ${invalidTokenStr}`);

    // Trigger push notification - it should detect invalid token and prune it
    await sendMembershipPush(member.id, 'Prune Verification Tier');
    
    // Check if token was pruned from DeviceToken table
    const tokenRecord = await prisma.deviceToken.findUnique({
      where: { token: invalidTokenStr }
    });
    assert(tokenRecord === null, '3.1 Invalid device token is automatically pruned from database');

    // ================================================================
    // 4. ERROR RESILIENCE & ADVERSARIAL STRESS-TESTING (NEVER THROW)
    // ================================================================
    console.log('\n--- SUITE 4: Error Resilience & Never Throw Contract ---');

    // 4.1: Non-existent member ID (DB foreign key failure)
    let threwNonExistentMember = false;
    try {
      await sendMembershipPush('non-existent-member-uuid-99999', 'Ghost Plan');
      await sendWalletTransactionPush('non-existent-member-uuid-99999', 500, 'CREDIT');
      await sendWalletTransactionPush('non-existent-member-uuid-99999', 100, 'DEBIT');
    } catch (e) {
      threwNonExistentMember = true;
    }
    assert(!threwNonExistentMember, '4.1 Calling push functions with non-existent memberId never throws');

    // 4.2: Boundary / Unusual argument inputs
    let threwBoundaryValues = false;
    try {
      // 0 amount
      await sendWalletTransactionPush(member.id, 0, 'CREDIT', 'Zero credit');
      // Negative amount
      await sendWalletTransactionPush(member.id, -50, 'DEBIT', 'Negative debit');
      // NaN amount
      await sendWalletTransactionPush(member.id, NaN, 'CREDIT');
      // Empty strings
      await sendMembershipPush(member.id, '', 'ASSIGNED');
      await sendWalletTransactionPush(member.id, 10, 'CREDIT', '');
      // Undefined-like cast inputs
      await sendMembershipPush(null as any, 'Null Member Plan');
      await sendWalletTransactionPush(undefined as any, 10, 'DEBIT');
    } catch (e) {
      threwBoundaryValues = true;
    }
    assert(!threwBoundaryValues, '4.2 Calling push functions with boundary/malformed values never throws');

    // 4.3: Direct sendPushNotification with null / empty / malformed tokens
    let directPushSafe = false;
    try {
      const res1 = await sendPushNotification([], 'Empty Title', 'Empty Body');
      assert(res1.success && res1.deliveredCount === 0, '4.3a sendPushNotification([]) returns success with 0 delivered');

      const res2 = await sendPushNotification(['not-a-token'], 'Bad Token', 'Bad Body');
      assert(res2.success && res2.deliveredCount === 0, '4.3b sendPushNotification with bad tokens returns success with 0 delivered');

      directPushSafe = true;
    } catch (e) {
      directPushSafe = false;
    }
    assert(directPushSafe, '4.3 Direct sendPushNotification calls never throw on invalid input');

    // 4.4: High-concurrency burst test (20 simultaneous calls)
    console.log('Scenario 4.4: Concurrency burst (20 parallel calls)');
    let concurrencySucceeded = false;
    try {
      const promises = Array.from({ length: 20 }, (_, idx) => {
        if (idx % 2 === 0) {
          return sendMembershipPush(member.id, `Concurrent Plan ${idx}`, idx % 4 === 0 ? 'PURCHASED' : 'ASSIGNED');
        } else {
          return sendWalletTransactionPush(member.id, 10 + idx, idx % 4 === 1 ? 'CREDIT' : 'DEBIT', `Batch ${idx}`);
        }
      });
      await Promise.all(promises);
      concurrencySucceeded = true;
    } catch (e) {
      concurrencySucceeded = false;
    }
    assert(concurrencySucceeded, '4.4 Concurrent burst of 20 push calls resolved cleanly without deadlocks or errors');

    // ================================================================
    // 5. SERVICE INTEGRATION TESTS (WalletService)
    // ================================================================
    console.log('\n--- SUITE 5: Service Integration (WalletService) ---');

    const prevNotifCount = await prisma.notification.count({ where: { memberId: member.id } });

    // WalletService.creditBalance
    const creditRes = await WalletService.creditBalance(member.id, 150, 'Empirical service credit test');
    assert(creditRes === true, '5.1 WalletService.creditBalance succeeded');
    // Allow async microtick for DB write
    await new Promise(r => setTimeout(r, 200));

    const latestCreditNotif = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(
      latestCreditNotif?.title === 'Wallet Credited 💳',
      '5.2 WalletService.creditBalance triggered push notification with "Wallet Credited 💳"',
      latestCreditNotif?.title
    );
    assert(
      latestCreditNotif?.body === '₹150 has been added to your wallet. (Empirical service credit test)',
      '5.2 WalletService credit notification body matches',
      latestCreditNotif?.body
    );

    // WalletService.deductBalance
    const debitRes = await WalletService.deductBalance(member.id, 50, 'Empirical service debit test');
    assert(debitRes === true, '5.3 WalletService.deductBalance succeeded');
    await new Promise(r => setTimeout(r, 200));

    const latestDebitNotif = await prisma.notification.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' }
    });
    assert(
      latestDebitNotif?.title === 'Wallet Debited 💳',
      '5.4 WalletService.deductBalance triggered push notification with "Wallet Debited 💳"',
      latestDebitNotif?.title
    );
    assert(
      latestDebitNotif?.body === '₹50 has been deducted from your wallet. (Empirical service debit test)',
      '5.4 WalletService debit notification body matches',
      latestDebitNotif?.body
    );

  } finally {
    // Cleanup test data
    console.log('\n--- Cleaning up test artifacts ---');
    await prisma.notification.deleteMany({ where: { memberId: member.id } });
    await prisma.deviceToken.deleteMany({ where: { memberId: member.id } });
    await prisma.walletTransaction.deleteMany({ where: { memberId: member.id } });
    await prisma.member.delete({ where: { id: member.id } });
    console.log(`Cleaned up member ${member.id}`);
  }

  // Summary
  console.log('\n================================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`  VERIFICATION RESULTS: ${passedCount} PASSED, ${failedCount} FAILED, TOTAL: ${results.length}`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    console.error(`Empirical verification failed with ${failedCount} failures.`);
    process.exit(1);
  } else {
    console.log('All empirical assertions passed successfully! Output verified.');
  }
}

runEmpiricalTests().catch(err => {
  console.error('Fatal unhandled error during empirical testing:', err);
  process.exit(1);
});
