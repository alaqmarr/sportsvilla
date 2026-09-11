import { prisma } from '../src/lib/prisma';
import { NfcPaymentService } from '../src/services/NfcPaymentService';
import { Mutex } from '../src/lib/mutex';
import { randomUUID } from 'crypto';

async function runM3Tests() {
  console.log('--- Starting Milestone 3 (M3: Ubiquitous Payment Integration) Verification Test Suite ---');

  const testId = randomUUID().slice(0, 8);
  const validCardUid = `A1B2C3D4${testId.toUpperCase().slice(0, 4)}`;
  const blockedCardUid = `E5F6A7B8${testId.toUpperCase().slice(0, 4)}`;
  const lowBalanceCardUid = `C9D0E1F2${testId.toUpperCase().slice(0, 4)}`;

  let testMemberId: string | null = null;
  let testLowBalMemberId: string | null = null;
  let testSportId: string | null = null;
  let testTurfId: string | null = null;
  let testBookingId: string | null = null;

  try {
    // 0. Setup test fixtures: Member, Sport, Turf, Booking
    console.log('[Setup] Creating test member...');
    // Member with 25000 paise (₹250.00)
    const member = await prisma.member.create({
      data: {
        name: `M3 Test Member ${testId}`,
        mobile: `999${testId.slice(0, 7)}`,
        email: `m3_test_${testId}@example.com`,
        walletBalance: 25000,
      },
    });
    testMemberId = member.id;

    // Active Card linked to member
    await prisma.nfcCard.create({
      data: {
        cardUid: validCardUid,
        memberId: member.id,
        status: 'ACTIVE',
      },
    });

    // Blocked Card linked to member
    await prisma.nfcCard.create({
      data: {
        cardUid: blockedCardUid,
        memberId: member.id,
        status: 'BLOCKED',
      },
    });

    // Low Balance Member (2000 paise = ₹20.00) and Card
    const lowBalMember = await prisma.member.create({
      data: {
        name: `Low Bal Member ${testId}`,
        mobile: `888${testId.slice(0, 7)}`,
        email: `lowbal_${testId}@example.com`,
        walletBalance: 2000,
      },
    });
    testLowBalMemberId = lowBalMember.id;

    await prisma.nfcCard.create({
      data: {
        cardUid: lowBalanceCardUid,
        memberId: lowBalMember.id,
        status: 'ACTIVE',
      },
    });

    // Sport & Turf for booking test
    let sport = await prisma.sport.findFirst();
    if (!sport) {
      sport = await prisma.sport.create({
        data: {
          name: `Sport Test ${testId}`,
          description: 'Test sport for M3',
        },
      });
      testSportId = sport.id;
    }

    const turf = await prisma.turf.create({
      data: {
        name: `Turf Test ${testId}`,
        bookingPrice: 100,
        bookingDurationMinutes: 60,
      },
    });
    testTurfId = turf.id;

    const now = new Date();
    const end = new Date(now.getTime() + 3600000);
    const booking = await prisma.booking.create({
      data: {
        memberId: member.id,
        sportId: sport.id,
        turfId: turf.id,
        startTime: now,
        endTime: end,
        price: 100,
        advancePaid: 0,
        amountDue: 100,
        paymentStatus: 'PENDING',
        status: 'CONFIRMED',
      },
    });
    testBookingId = booking.id;

    console.log('[Setup] Test fixtures created successfully.');

    // --- TEST 1: Unregistered Card Rejection ---
    console.log('\n[Test 1] Testing Unregistered Card Rejection...');
    const unregResult = await NfcPaymentService.processPayment({
      cardUid: 'UNKNOWN_CARD_9999',
      amount: 50,
    });
    if (unregResult.success !== false || unregResult.code !== 'CARD_NOT_FOUND') {
      throw new Error(`Test 1 Failed: Expected CARD_NOT_FOUND, got ${JSON.stringify(unregResult)}`);
    }
    const failedTx1 = await prisma.nfcTransaction.findUnique({
      where: { id: unregResult.transactionId },
    });
    if (!failedTx1 || failedTx1.status !== 'FAILED') {
      throw new Error('Test 1 Failed: Expected FAILED NfcTransaction record in audit log');
    }
    console.log('✅ Test 1 Passed: Unregistered card rejected with CARD_NOT_FOUND & audit log recorded.');

    // --- TEST 2: Blocked Card Rejection ---
    console.log('\n[Test 2] Testing Blocked Card Rejection...');
    const blockedResult = await NfcPaymentService.processPayment({
      cardUid: blockedCardUid,
      amount: 50,
    });
    if (blockedResult.success !== false || blockedResult.code !== 'CARD_BLOCKED') {
      throw new Error(`Test 2 Failed: Expected CARD_BLOCKED, got ${JSON.stringify(blockedResult)}`);
    }
    const failedTx2 = await prisma.nfcTransaction.findUnique({
      where: { id: blockedResult.transactionId },
    });
    if (!failedTx2 || failedTx2.status !== 'FAILED') {
      throw new Error('Test 2 Failed: Expected FAILED NfcTransaction for blocked card');
    }
    console.log('✅ Test 2 Passed: Blocked card rejected with CARD_BLOCKED & audit log recorded.');

    // --- TEST 3: Insufficient Funds Rejection ---
    console.log('\n[Test 3] Testing Insufficient Funds Rejection...');
    const lowBalResult = await NfcPaymentService.processPayment({
      cardUid: lowBalanceCardUid,
      amount: 50, // requires ₹50.00 = 5000 paise, wallet only has 2000 paise
    });
    if (lowBalResult.success !== false || lowBalResult.code !== 'INSUFFICIENT_FUNDS') {
      throw new Error(`Test 3 Failed: Expected INSUFFICIENT_FUNDS, got ${JSON.stringify(lowBalResult)}`);
    }
    const lowBalMemberAfter = await prisma.member.findUnique({
      where: { id: lowBalMember.id },
    });
    if (lowBalMemberAfter?.walletBalance !== 2000) {
      throw new Error(`Test 3 Failed: Wallet balance modified unexpectedly: ${lowBalMemberAfter?.walletBalance}`);
    }
    const failedTx3 = await prisma.nfcTransaction.findUnique({
      where: { id: lowBalResult.transactionId },
    });
    if (!failedTx3 || failedTx3.status !== 'FAILED') {
      throw new Error('Test 3 Failed: Expected FAILED NfcTransaction for insufficient funds');
    }
    console.log('✅ Test 3 Passed: Insufficient balance rejected cleanly with wallet untouched.');

    // --- TEST 4: Successful Booking Payment with Atomic Deductions ---
    console.log('\n[Test 4] Testing Successful Booking Payment with Full Reconciliation...');
    const payResult = await NfcPaymentService.processPayment({
      cardUid: validCardUid.toLowerCase(), // test normalization
      amount: 100, // ₹100 = 10000 paise
      bookingId: testBookingId,
    });

    if (!payResult.success) {
      throw new Error(`Test 4 Failed: Payment failed: ${payResult.error} (${payResult.code})`);
    }
    if (payResult.deductedAmount !== 100 || payResult.remainingBalance !== 150) {
      throw new Error(`Test 4 Failed: Deducted or remaining balance calculation mismatch: ${JSON.stringify(payResult)}`);
    }

    // Verify DB state
    const memberAfter = await prisma.member.findUnique({ where: { id: testMemberId } });
    if (memberAfter?.walletBalance !== 15000) {
      throw new Error(`Test 4 Failed: Expected 15000 paise remaining, got ${memberAfter?.walletBalance}`);
    }

    const walletTx = await prisma.walletTransaction.findFirst({
      where: { memberId: testMemberId, type: 'DEBIT' },
      orderBy: { createdAt: 'desc' },
    });
    if (!walletTx || walletTx.amount !== 10000 || walletTx.type !== 'DEBIT') {
      throw new Error(`Test 4 Failed: WalletTransaction debit record mismatch: ${JSON.stringify(walletTx)}`);
    }

    const paymentRecord = await prisma.payment.findFirst({
      where: { bookingId: testBookingId },
    });
    if (!paymentRecord || paymentRecord.amount !== 100 || paymentRecord.method !== 'SPORTSVILLA_CARD') {
      throw new Error(`Test 4 Failed: Payment record mismatch: ${JSON.stringify(paymentRecord)}`);
    }

    const updatedBooking = await prisma.booking.findUnique({
      where: { id: testBookingId },
      include: { tickets: true },
    });
    if (!updatedBooking || updatedBooking.paymentStatus !== 'PAID' || updatedBooking.status !== 'CONFIRMED' || updatedBooking.amountDue !== 0 || updatedBooking.advancePaid !== 100) {
      throw new Error(`Test 4 Failed: Booking status not updated correctly: ${JSON.stringify(updatedBooking)}`);
    }
    if (updatedBooking.tickets.length === 0) {
      throw new Error('Test 4 Failed: Expected Ticket to be generated for confirmed booking');
    }

    const nfcTx = await prisma.nfcTransaction.findUnique({
      where: { id: payResult.transactionId },
    });
    if (!nfcTx || nfcTx.amount !== 100 || nfcTx.bookingId !== testBookingId || nfcTx.status !== 'SUCCESS') {
      throw new Error(`Test 4 Failed: Success NfcTransaction mismatch: ${JSON.stringify(nfcTx)}`);
    }

    const cardAfter = await prisma.nfcCard.findUnique({ where: { cardUid: validCardUid } });
    if (!cardAfter?.lastUsedAt) {
      throw new Error('Test 4 Failed: nfcCard.lastUsedAt was not updated');
    }
    console.log('✅ Test 4 Passed: Booking payment successfully completed with atomic ledger, booking update, and ticket creation.');

    // --- TEST 5: Standalone POS Payment (without bookingId) ---
    console.log('\n[Test 5] Testing Standalone POS Payment...');
    const posResult = await NfcPaymentService.processPayment({
      cardUid: validCardUid,
      amount: 30, // ₹30 = 3000 paise, remaining was ₹150, should become ₹120
    });
    if (!posResult.success || posResult.remainingBalance !== 120) {
      throw new Error(`Test 5 Failed: POS payment failed: ${JSON.stringify(posResult)}`);
    }
    const memberAfterPos = await prisma.member.findUnique({ where: { id: testMemberId } });
    if (memberAfterPos?.walletBalance !== 12000) {
      throw new Error(`Test 5 Failed: Member wallet expected 12000 paise, got ${memberAfterPos?.walletBalance}`);
    }
    console.log('✅ Test 5 Passed: Standalone POS payment deducted ₹30 (3000 paise) cleanly.');

    // --- TEST 6: Concurrency / Mutex Locking Integrity ---
    console.log('\n[Test 6] Testing Concurrency Serialization...');
    const normalizedUid = validCardUid.toUpperCase();
    const lockKey = `nfc:pay:${normalizedUid}`;
    const acquired = await Mutex.acquire(lockKey, 500);
    if (!acquired) {
      throw new Error('Test 6 Failed: Could not acquire initial mutex lock');
    }

    // While lock is held, attempting another payment with 0 timeout should wait/serialize
    const concurrentPayPromise = NfcPaymentService.processPayment({
      cardUid: validCardUid,
      amount: 10,
    });

    // Release lock after 300ms so concurrent pay can proceed smoothly
    setTimeout(() => {
      Mutex.release(lockKey);
    }, 300);

    const concurrentResult = await concurrentPayPromise;
    if (!concurrentResult.success) {
      throw new Error(`Test 6 Failed: Serialized payment did not succeed after lock release: ${JSON.stringify(concurrentResult)}`);
    }
    console.log('✅ Test 6 Passed: Mutex serialization handled concurrent execution without race conditions.');

    console.log('\n========================================================================');
    console.log('🎉 ALL 6 MILESTONE 3 TESTS PASSED PERFECTLY!');
    console.log('========================================================================');
  } finally {
    // Teardown fixtures
    console.log('\n[Teardown] Cleaning up test fixtures...');
    try {
      if (testBookingId) {
        await prisma.ticket.deleteMany({ where: { bookingId: testBookingId } });
        await prisma.payment.deleteMany({ where: { bookingId: testBookingId } });
        await prisma.booking.deleteMany({ where: { id: testBookingId } });
      }
      if (testTurfId) {
        await prisma.turf.deleteMany({ where: { id: testTurfId } });
      }
      if (testSportId) {
        await prisma.sport.deleteMany({ where: { id: testSportId } });
      }
      await prisma.nfcTransaction.deleteMany({
        where: {
          cardUid: {
            in: [validCardUid, blockedCardUid, lowBalanceCardUid, 'UNKNOWN_CARD_9999'],
          },
        },
      });
      await prisma.nfcCard.deleteMany({
        where: {
          cardUid: {
            in: [validCardUid, blockedCardUid, lowBalanceCardUid],
          },
        },
      });
      const memberIds = [testMemberId, testLowBalMemberId].filter(Boolean) as string[];
      if (memberIds.length > 0) {
        await prisma.walletTransaction.deleteMany({
          where: {
            memberId: { in: memberIds },
          },
        });
        await prisma.member.deleteMany({
          where: {
            id: { in: memberIds },
          },
        });
      }
      console.log('[Teardown] Cleaned up all test fixtures.');
    } catch (cleanupErr) {
      console.error('[Teardown Error]', cleanupErr);
    }
  }
}

runM3Tests()
  .catch((err) => {
    console.error('❌ M3 Test Suite Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
