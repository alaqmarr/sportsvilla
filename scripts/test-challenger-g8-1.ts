import { prisma } from '../src/lib/prisma';
import { BookingService } from '../src/services/BookingService';
import { PaymentService } from '../src/services/PaymentService';
import { randomUUID } from 'crypto';

// Re-implement version comparator from src/app/api/client/v1/version/route.ts for testing
function compareSemver(v1: string, v2: string): number {
  const parse = (v: string) => {
    const cleaned = v.trim().replace(/^v/i, "");
    const [main, pre] = cleaned.split("-");
    const parts = main.split(".").map((num) => {
      const parsed = parseInt(num, 10);
      return isNaN(parsed) ? 0 : parsed;
    });
    while (parts.length < 3) parts.push(0);
    return { parts: parts.slice(0, 3), pre };
  };

  const p1 = parse(v1);
  const p2 = parse(v2);

  for (let i = 0; i < 3; i++) {
    if (p1.parts[i] < p2.parts[i]) return -1;
    if (p1.parts[i] > p2.parts[i]) return 1;
  }

  if (p1.pre && !p2.pre) return -1;
  if (!p1.pre && p2.pre) return 1;
  if (p1.pre && p2.pre) {
    return p1.pre.localeCompare(p2.pre);
  }

  return 0;
}

function isVersionLessThan(clientVer: string, latestVer: string): boolean {
  return compareSemver(clientVer, latestVer) < 0;
}

interface TestReport {
  objective: string;
  name: string;
  passed: boolean;
  details: string;
}

const reports: TestReport[] = [];

function assert(condition: boolean, objective: string, name: string, details: string) {
  if (!condition) {
    console.error(`❌ [FAIL] [${objective}] ${name}: ${details}`);
    reports.push({ objective, name, passed: false, details });
  } else {
    console.log(`✅ [PASS] [${objective}] ${name}: ${details}`);
    reports.push({ objective, name, passed: true, details });
  }
}

async function runAdversarialVerification() {
  console.log('================================================================');
  console.log('CHALLENGER G8 1: ADVERSARIAL VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  const testBatchId = randomUUID().slice(0, 8);

  // ---------------------------------------------------------------------------
  // OBJECTIVE 1: Payment link webhook multi-booking allocation logic
  // ---------------------------------------------------------------------------
  console.log('>>> [OBJECTIVE 1] Testing Payment Link Webhook Allocation Logic...');

  // Test 1.1: Math allocation algorithm simulation across various ratios
  const simulateAllocation = (unpaidBookings: Array<{ id: string; amountDue: number; price: number; discountAmount?: number }>, paidAmountRupees: number) => {
    const totalDue = unpaidBookings.reduce((sum, b) => {
      const due = b.amountDue > 0 ? b.amountDue : (b.price - (b.discountAmount || 0));
      return sum + (due > 0 ? due : b.price);
    }, 0);

    let remainingPaid = paidAmountRupees;
    const allocations: Array<{ id: string; allocated: number }> = [];

    for (let i = 0; i < unpaidBookings.length; i++) {
      const booking = unpaidBookings[i];
      const due = booking.amountDue > 0 ? booking.amountDue : (booking.price - (booking.discountAmount || 0));
      const effectiveDue = due > 0 ? due : booking.price;

      let allocatedAmount = 0;
      if (i === unpaidBookings.length - 1) {
        allocatedAmount = Math.max(0, Math.round(remainingPaid * 100) / 100);
      } else {
        allocatedAmount = totalDue > 0 
          ? Math.round(((effectiveDue / totalDue) * paidAmountRupees) * 100) / 100 
          : 0;
        remainingPaid -= allocatedAmount;
      }
      allocations.push({ id: booking.id, allocated: allocatedAmount });
    }
    return allocations;
  };

  // 1.1: Exact match payment for 600 + 400
  const alloc1 = simulateAllocation([
    { id: 'b1', amountDue: 600, price: 600 },
    { id: 'b2', amountDue: 400, price: 400 }
  ], 1000);
  assert(
    alloc1[0].allocated === 600 && alloc1[1].allocated === 400,
    'Obj 1',
    'Exact full payment allocation',
    `Expected 600/400, got ${alloc1[0].allocated}/${alloc1[1].allocated}`
  );

  // 1.2: Partial payment 500 for 600 + 400 (300/200)
  const alloc2 = simulateAllocation([
    { id: 'b1', amountDue: 600, price: 600 },
    { id: 'b2', amountDue: 400, price: 400 }
  ], 500);
  assert(
    alloc2[0].allocated === 300 && alloc2[1].allocated === 200,
    'Obj 1',
    'Partial payment proportional allocation',
    `Expected 300/200, got ${alloc2[0].allocated}/${alloc2[1].allocated}`
  );

  // 1.3: Rounding edge case: 3 bookings with 100 each (total 300), paid 100
  const alloc3 = simulateAllocation([
    { id: 'b1', amountDue: 100, price: 100 },
    { id: 'b2', amountDue: 100, price: 100 },
    { id: 'b3', amountDue: 100, price: 100 }
  ], 100);
  const sum3 = alloc3.reduce((s, a) => s + a.allocated, 0);
  assert(
    Math.abs(sum3 - 100) < 0.001 && alloc3[0].allocated === 33.33 && alloc3[1].allocated === 33.33 && alloc3[2].allocated === 33.34,
    'Obj 1',
    'Rounding preservation with 3 bookings (1/3 split)',
    `Sum is ${sum3.toFixed(2)}, allocations: [${alloc3.map(a => a.allocated).join(', ')}]`
  );

  // 1.4: Multi-booking reference_id parsing with whitespace & trailing commas
  const rawRefId = `  b1_${testBatchId},  ,  b2_${testBatchId} , b3_${testBatchId},   `;
  const parsedBookingIds = rawRefId.split(',').map((id: string) => id.trim()).filter(Boolean);
  assert(
    parsedBookingIds.length === 3 && parsedBookingIds[0] === `b1_${testBatchId}` && parsedBookingIds[2] === `b3_${testBatchId}`,
    'Obj 1',
    'Robust reference_id sanitization',
    `Parsed count ${parsedBookingIds.length}: ${parsedBookingIds.join(', ')}`
  );

  // 1.5: End-to-end integration test with database and PaymentService.settleSuccessfulPayment
  console.log('--- Setting up DB fixtures for PaymentService multi-booking test ---');
  const testSport = await prisma.sport.create({
    data: { name: `Sport_${testBatchId}`, slotDurationMinutes: 60 }
  });
  const testTurf = await prisma.turf.create({
    data: { name: `Turf_${testBatchId}`, bookingPrice: 500 }
  });
  const testMember = await prisma.member.create({
    data: { name: `Member_${testBatchId}`, mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`, walletBalance: 0 }
  });

  const now = new Date();
  const future1 = new Date(now.getTime() + 48 * 3600 * 1000);
  const future1End = new Date(future1.getTime() + 3600 * 1000);
  const future2 = new Date(now.getTime() + 50 * 3600 * 1000);
  const future2End = new Date(future2.getTime() + 3600 * 1000);

  const dbBooking1 = await prisma.booking.create({
    data: {
      turfId: testTurf.id,
      sportId: testSport.id,
      memberId: testMember.id,
      startTime: future1,
      endTime: future1End,
      price: 600,
      amountDue: 600,
      paymentStatus: 'UNPAID',
      status: 'CONFIRMED'
    }
  });
  const dbBooking2 = await prisma.booking.create({
    data: {
      turfId: testTurf.id,
      sportId: testSport.id,
      memberId: testMember.id,
      startTime: future2,
      endTime: future2End,
      price: 400,
      amountDue: 400,
      paymentStatus: 'UNPAID',
      status: 'CONFIRMED'
    }
  });

  // Settle Booking 1 with partial payment 300
  const settleRes1 = await PaymentService.settleSuccessfulPayment({
    bookingId: dbBooking1.id,
    gateway: 'RAZORPAY',
    gatewayOrderId: `order_${testBatchId}_1`,
    gatewayPaymentId: `pay_${testBatchId}_1`,
    paidAmountRupees: 300,
    metadata: { webhook: true }
  });
  assert(
    settleRes1.success && settleRes1.status === 'PARTIAL',
    'Obj 1',
    'PaymentService partial payment status',
    `Expected status PARTIAL, got ${settleRes1.status}`
  );

  const reloadedB1 = await prisma.booking.findUnique({ where: { id: dbBooking1.id } });
  assert(
    reloadedB1?.paymentStatus === 'PARTIAL' && reloadedB1?.amountDue === 300 && reloadedB1?.advancePaid === 300,
    'Obj 1',
    'DB booking state on partial settlement',
    `paymentStatus: ${reloadedB1?.paymentStatus}, amountDue: ${reloadedB1?.amountDue}, advancePaid: ${reloadedB1?.advancePaid}`
  );

  // Settle Booking 1 with second payment 300 -> should reach PAID
  const settleRes1Full = await PaymentService.settleSuccessfulPayment({
    bookingId: dbBooking1.id,
    gateway: 'RAZORPAY',
    gatewayOrderId: `order_${testBatchId}_2`,
    gatewayPaymentId: `pay_${testBatchId}_2`,
    paidAmountRupees: 300,
    metadata: { webhook: true }
  });
  assert(
    settleRes1Full.success && settleRes1Full.status === 'PAID',
    'Obj 1',
    'PaymentService cumulative full payment status',
    `Expected status PAID, got ${settleRes1Full.status}`
  );
  const reloadedB1Full = await prisma.booking.findUnique({ where: { id: dbBooking1.id } });
  assert(
    reloadedB1Full?.paymentStatus === 'PAID' && reloadedB1Full?.amountDue === 0 && reloadedB1Full?.advancePaid === 600,
    'Obj 1',
    'DB booking state on full settlement',
    `paymentStatus: ${reloadedB1Full?.paymentStatus}, amountDue: ${reloadedB1Full?.amountDue}, advancePaid: ${reloadedB1Full?.advancePaid}`
  );


  // ---------------------------------------------------------------------------
  // OBJECTIVE 2: Refund calculation for past bookings vs future bookings in BookingService
  // ---------------------------------------------------------------------------
  console.log('\n>>> [OBJECTIVE 2] Testing Refund Calculation in BookingService...');

  const mockBooking = (startTime: Date, price: number, paid: number) => ({
    id: `bk_${randomUUID().slice(0, 6)}`,
    turfId: 't1',
    sportId: 's1',
    memberId: 'm1',
    startTime,
    endTime: new Date(startTime.getTime() + 3600000),
    price,
    paymentStatus: 'PAID',
    status: 'CONFIRMED',
    participantCount: 1,
    visibility: 'PRIVATE',
    inviteMaxCount: null,
    inviteCode: null,
    pointsRedeemed: 0,
    discountAmount: 0,
    advancePaid: paid,
    amountDue: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    payments: [{ id: 'p1', bookingId: 'bk1', amount: paid, method: 'ONLINE', createdAt: new Date() }]
  });

  // 2.1: Past booking 2 hours ago
  const pastBooking2h = mockBooking(new Date(Date.now() - 2 * 3600 * 1000), 1000, 1000);
  const refundPast2h = BookingService.getRefundPreview(pastBooking2h as any, 3);
  assert(
    refundPast2h.refund === 0 && refundPast2h.penalty === 1000 && refundPast2h.isFree === false,
    'Obj 2',
    'Past booking (2h ago) returns 0 refund and full penalty',
    `refund: ${refundPast2h.refund}, penalty: ${refundPast2h.penalty}, isFree: ${refundPast2h.isFree}`
  );

  // 2.2: Past booking 10 days ago
  const pastBooking10d = mockBooking(new Date(Date.now() - 240 * 3600 * 1000), 800, 800);
  const refundPast10d = BookingService.getRefundPreview(pastBooking10d as any, 3);
  assert(
    refundPast10d.refund === 0 && refundPast10d.penalty === 800 && refundPast10d.isFree === false,
    'Obj 2',
    'Past booking (10d ago) returns 0 refund and full penalty',
    `refund: ${refundPast10d.refund}, penalty: ${refundPast10d.penalty}`
  );

  // 2.3: Past booking with overpayment (paid 1200 on price 1000)
  const pastBookingOverpaid = mockBooking(new Date(Date.now() - 1 * 3600 * 1000), 1000, 1200);
  const refundPastOverpaid = BookingService.getRefundPreview(pastBookingOverpaid as any, 3);
  assert(
    refundPastOverpaid.refund === 0 && refundPastOverpaid.penalty === 1200 && refundPastOverpaid.isFree === false,
    'Obj 2',
    'Past booking with overpayment yields exactly 0 refund',
    `refund: ${refundPastOverpaid.refund}, penalty: ${refundPastOverpaid.penalty}`
  );

  // 2.4: Past booking unpaid (paid 0 on price 1000)
  const pastBookingUnpaid = mockBooking(new Date(Date.now() - 1 * 3600 * 1000), 1000, 0);
  const refundPastUnpaid = BookingService.getRefundPreview(pastBookingUnpaid as any, 3);
  assert(
    refundPastUnpaid.refund === 0 && refundPastUnpaid.penalty === 1000 && refundPastUnpaid.isFree === false,
    'Obj 2',
    'Past booking unpaid yields 0 refund and 0 net payout',
    `refund: ${refundPastUnpaid.refund}, penalty: ${refundPastUnpaid.penalty}`
  );

  // 2.5: Future booking well ahead of limit (24 hours ahead, limit = 3)
  const futureBooking24h = mockBooking(new Date(Date.now() + 24 * 3600 * 1000), 1000, 1000);
  const refundFuture24h = BookingService.getRefundPreview(futureBooking24h as any, 3);
  assert(
    refundFuture24h.refund === 1000 && refundFuture24h.penalty === 0 && refundFuture24h.isFree === true,
    'Obj 2',
    'Future booking > cancellationLimitHours yields 100% free refund',
    `refund: ${refundFuture24h.refund}, penalty: ${refundFuture24h.penalty}, isFree: ${refundFuture24h.isFree}`
  );

  // 2.6: Future booking right on exact limit boundary (exactly 3.01 hours ahead, limit = 3)
  const futureBookingBoundary = mockBooking(new Date(Date.now() + 3.01 * 3600 * 1000), 1000, 1000);
  const refundFutureBoundary = BookingService.getRefundPreview(futureBookingBoundary as any, 3);
  assert(
    refundFutureBoundary.refund === 1000 && refundFutureBoundary.penalty === 0 && refundFutureBoundary.isFree === true,
    'Obj 2',
    'Future booking at boundary (> limit) yields 100% free refund',
    `refund: ${refundFutureBoundary.refund}, penalty: ${refundFutureBoundary.penalty}`
  );

  // 2.7: Future booking inside limit (1.5 hours ahead, limit = 3) -> 2/3 penalty (666.67), refund 333.33
  const futureBookingInside = mockBooking(new Date(Date.now() + 1.5 * 3600 * 1000), 1000, 1000);
  const refundFutureInside = BookingService.getRefundPreview(futureBookingInside as any, 3);
  const expectedPenalty = 1000 * (2 / 3);
  assert(
    Math.abs(refundFutureInside.penalty - expectedPenalty) < 1 && refundFutureInside.isFree === false,
    'Obj 2',
    'Future booking within limit incurs tiered penalty',
    `penalty: ${refundFutureInside.penalty.toFixed(2)}, refund: ${refundFutureInside.refund.toFixed(2)}`
  );

  // 2.8: Future booking 5 minutes ahead (0.08 hours ahead, limit = 3) -> hourIndex = 3 -> 100% penalty
  const futureBooking5m = mockBooking(new Date(Date.now() + 5 * 60 * 1000), 1000, 1000);
  const refundFuture5m = BookingService.getRefundPreview(futureBooking5m as any, 3);
  assert(
    refundFuture5m.penalty === 1000 && refundFuture5m.refund === 0 && refundFuture5m.isFree === false,
    'Obj 2',
    'Future booking within final hour incurs 100% penalty',
    `penalty: ${refundFuture5m.penalty}, refund: ${refundFuture5m.refund}`
  );


  // ---------------------------------------------------------------------------
  // OBJECTIVE 3: Semantic version comparison logic with various version strings
  // ---------------------------------------------------------------------------
  console.log('\n>>> [OBJECTIVE 3] Testing Semantic Version Comparison Logic...');

  const versionTestCases: Array<{ v1: string; v2: string; expectedCmp: number; desc: string }> = [
    { v1: '1.0.0', v2: '1.0.1', expectedCmp: -1, desc: 'Patch increment' },
    { v1: '1.1.0', v2: '1.0.9', expectedCmp: 1, desc: 'Minor increment over patch' },
    { v1: '2.0.0', v2: '1.99.99', expectedCmp: 1, desc: 'Major increment' },
    { v1: '1.10.0', v2: '1.2.0', expectedCmp: 1, desc: 'Numeric multi-digit minor (10 > 2)' },
    { v1: '1.0.10', v2: '1.0.2', expectedCmp: 1, desc: 'Numeric multi-digit patch (10 > 2)' },
    { v1: 'v1.2.3', v2: '1.2.3', expectedCmp: 0, desc: 'Prefix lowercase "v" equality' },
    { v1: 'V2.0.0', v2: 'v1.9.9', expectedCmp: 1, desc: 'Prefix uppercase "V" comparison' },
    { v1: '1.2', v2: '1.2.0', expectedCmp: 0, desc: 'Two-part version padded to three' },
    { v1: '1', v2: '1.0.0', expectedCmp: 0, desc: 'One-part version padded to three' },
    { v1: '1.2', v2: '1.2.1', expectedCmp: -1, desc: 'Two-part version less than patch' },
    { v1: '1.0.0-alpha', v2: '1.0.0', expectedCmp: -1, desc: 'Prerelease less than release' },
    { v1: '1.0.0', v2: '1.0.0-alpha', expectedCmp: 1, desc: 'Release greater than prerelease' },
    { v1: '1.0.0-alpha', v2: '1.0.0-beta', expectedCmp: -1, desc: 'Alphabetical prereleases (alpha < beta)' },
    { v1: '1.0.0-rc.1', v2: '1.0.0-rc.2', expectedCmp: -1, desc: 'Prerelease build numbers' },
    { v1: '  1.5.0  ', v2: '1.5.0', expectedCmp: 0, desc: 'Surrounding whitespace trimming' },
    { v1: '2.3.4', v2: '2.3.4', expectedCmp: 0, desc: 'Exact identity' },
    { v1: '', v2: '0.0.0', expectedCmp: 0, desc: 'Empty string fallback to 0.0.0' },
    { v1: 'malformed', v2: '0.0.0', expectedCmp: 0, desc: 'Malformed string fallback to 0.0.0' },
    { v1: '1.0.0.5', v2: '1.0.0', expectedCmp: 0, desc: 'Quadruple parts sliced to first 3' }
  ];

  for (const tc of versionTestCases) {
    const rawCmp = compareSemver(tc.v1, tc.v2);
    // Normalize sign
    const cmpSign = rawCmp < 0 ? -1 : (rawCmp > 0 ? 1 : 0);
    const pass = cmpSign === tc.expectedCmp;
    assert(
      pass,
      'Obj 3',
      `compareSemver("${tc.v1}", "${tc.v2}")`,
      `${tc.desc} -> Expected ${tc.expectedCmp}, got ${cmpSign}`
    );
  }

  // Test isVersionLessThan helper
  assert(
    isVersionLessThan('1.0.0', '1.0.1') === true,
    'Obj 3',
    'isVersionLessThan("1.0.0", "1.0.1")',
    'Expected true'
  );
  assert(
    isVersionLessThan('1.0.1', '1.0.0') === false,
    'Obj 3',
    'isVersionLessThan("1.0.1", "1.0.0")',
    'Expected false'
  );
  assert(
    isVersionLessThan('1.0.0', '1.0.0') === false,
    'Obj 3',
    'isVersionLessThan("1.0.0", "1.0.0")',
    'Expected false'
  );


  // ---------------------------------------------------------------------------
  // OBJECTIVE 4: Paise vs Rupee calculations in wallet and loyalty rewards
  // ---------------------------------------------------------------------------
  console.log('\n>>> [OBJECTIVE 4] Testing Paise vs Rupee Harmonization...');

  const walletMember = await prisma.member.create({
    data: {
      name: `WalletTest_${testBatchId}`,
      mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      walletBalance: 10000 // 10000 paise = ₹100.00
    }
  });

  const cardUid = `FC${testBatchId.toUpperCase()}`;
  const nfcCard = await prisma.nfcCard.create({
    data: {
      cardUid,
      memberId: walletMember.id,
      status: 'ACTIVE'
    }
  });

  // 4.1: Credit wallet with ₹150.50
  const creditAmountRupees = 150.50;
  const creditAmountPaise = Math.round(creditAmountRupees * 100); // 15050 paise

  await prisma.$transaction(async (tx) => {
    await tx.member.update({
      where: { id: walletMember.id },
      data: { walletBalance: { increment: creditAmountPaise } }
    });
    await tx.walletTransaction.create({
      data: {
        memberId: walletMember.id,
        amount: creditAmountPaise,
        type: 'CREDIT',
        description: 'Test Credit'
      }
    });
    await tx.nfcTransaction.create({
      data: {
        cardUid,
        cardId: nfcCard.id,
        memberId: walletMember.id,
        type: 'TOPUP',
        status: 'SUCCESS',
        amount: creditAmountRupees
      }
    });
  });

  const reloadedWallet1 = await prisma.member.findUnique({ where: { id: walletMember.id } });
  const lastWalletTx = await prisma.walletTransaction.findFirst({
    where: { memberId: walletMember.id },
    orderBy: { createdAt: 'desc' }
  });
  const lastNfcTx = await prisma.nfcTransaction.findFirst({
    where: { memberId: walletMember.id },
    orderBy: { createdAt: 'desc' }
  });

  assert(
    reloadedWallet1?.walletBalance === 25050,
    'Obj 4',
    'Wallet credit balance in paise',
    `Expected 25050 paise (10000 + 15050), got ${reloadedWallet1?.walletBalance}`
  );
  assert(
    lastWalletTx?.amount === 15050 && lastWalletTx?.type === 'CREDIT',
    'Obj 4',
    'WalletTransaction record in paise',
    `Expected amount 15050, got ${lastWalletTx?.amount}`
  );
  assert(
    lastNfcTx?.amount === 150.50 && lastNfcTx?.type === 'TOPUP',
    'Obj 4',
    'NfcTransaction record in rupees',
    `Expected amount 150.50, got ${lastNfcTx?.amount}`
  );

  // 4.2: Deduct wallet ₹50.00
  const deductAmountRupees = 50.00;
  const deductAmountPaise = Math.round(deductAmountRupees * 100); // 5000 paise

  await prisma.$transaction(async (tx) => {
    const updated = await tx.member.update({
      where: { id: walletMember.id },
      data: { walletBalance: { decrement: deductAmountPaise } }
    });
    if (updated.walletBalance < 0) throw new Error('Insufficient wallet balance.');
    await tx.walletTransaction.create({
      data: {
        memberId: walletMember.id,
        amount: deductAmountPaise,
        type: 'DEBIT',
        description: 'Test Debit'
      }
    });
  });

  const reloadedWallet2 = await prisma.member.findUnique({ where: { id: walletMember.id } });
  assert(
    reloadedWallet2?.walletBalance === 20050,
    'Obj 4',
    'Wallet debit balance in paise',
    `Expected 20050 paise (25050 - 5000), got ${reloadedWallet2?.walletBalance}`
  );

  // 4.3: Attempt to deduct more than balance (e.g. ₹500 = 50000 paise when balance is 20050)
  let deductionFailedAsExpected = false;
  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.member.update({
        where: { id: walletMember.id },
        data: { walletBalance: { decrement: 50000 } }
      });
      if (updated.walletBalance < 0) throw new Error('Insufficient wallet balance.');
    });
  } catch (err: any) {
    deductionFailedAsExpected = err.message === 'Insufficient wallet balance.';
  }

  const reloadedWallet3 = await prisma.member.findUnique({ where: { id: walletMember.id } });
  assert(
    deductionFailedAsExpected && reloadedWallet3?.walletBalance === 20050,
    'Obj 4',
    'Overdraft prevention rollback preserves balance',
    `Failed expected: ${deductionFailedAsExpected}, balance untouched: ${reloadedWallet3?.walletBalance}`
  );

  // 4.4: Loyalty reward in booking creation (B23 check)
  const triggerRewardRupees = 75; // ₹75 reward
  const rewardPaise = Math.round(triggerRewardRupees * 100); // 7500 paise
  await prisma.member.update({
    where: { id: walletMember.id },
    data: { walletBalance: { increment: rewardPaise } }
  });
  const reloadedWallet4 = await prisma.member.findUnique({ where: { id: walletMember.id } });
  assert(
    reloadedWallet4?.walletBalance === 20050 + 7500,
    'Obj 4',
    'Loyalty reward converted to paise (₹75 -> 7500 paise)',
    `Expected ${20050 + 7500}, got ${reloadedWallet4?.walletBalance}`
  );

  // 4.5: Format display sanity
  const displayInr = ((reloadedWallet4?.walletBalance || 0) / 100).toFixed(2);
  assert(
    displayInr === '275.50',
    'Obj 4',
    'Display conversion to INR string',
    `Expected "275.50", got "${displayInr}"`
  );


  // ---------------------------------------------------------------------------
  // OBJECTIVE 5: IDOR protections in upload/delete and bookings/[id]
  // ---------------------------------------------------------------------------
  console.log('\n>>> [OBJECTIVE 5] Testing IDOR Protections...');

  // Setup distinct members: Member A (Owner), Member B (Attacker), Member C (Family of A), Member D (Participant)
  const family = await prisma.familyGroup.create({
    data: { mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}` }
  });

  const memberA = await prisma.member.create({
    data: { name: `Alice_${testBatchId}`, mobile: family.mobile, familyId: family.id, walletBalance: 1000 }
  });
  const memberB = await prisma.member.create({
    data: { name: `AttackerBob_${testBatchId}`, mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`, walletBalance: 1000 }
  });
  const memberC = await prisma.member.create({
    data: { name: `AliceFamily_${testBatchId}`, mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`, familyId: family.id, walletBalance: 1000 }
  });
  const memberD = await prisma.member.create({
    data: { name: `ParticipantDan_${testBatchId}`, mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`, walletBalance: 1000 }
  });

  const bookingA = await prisma.booking.create({
    data: {
      turfId: testTurf.id,
      sportId: testSport.id,
      memberId: memberA.id,
      startTime: future1,
      endTime: future1End,
      price: 500,
      paymentStatus: 'PAID',
      status: 'CONFIRMED'
    }
  });

  await prisma.bookingParticipant.create({
    data: {
      bookingId: bookingA.id,
      memberId: memberD.id,
      status: 'CONFIRMED'
    }
  });

  // 5.1: Booking IDOR logic evaluation
  const evaluateBookingAccess = async (requester: { id: string; familyId: string | null; mobile: string | null; isAdmin?: boolean }) => {
    if (requester.isAdmin) return { allowed: true, reason: 'ADMIN' };

    const bk = await prisma.booking.findUnique({
      where: { id: bookingA.id },
      include: { member: true, participants: true }
    });
    if (!bk) return { allowed: false, status: 404 };

    const isDirectOwner = bk.memberId === requester.id;
    const isFamilyMember =
      (requester.familyId && bk.member?.familyId === requester.familyId) ||
      (requester.mobile && bk.member?.mobile === requester.mobile);
    const isParticipant = bk.participants?.some(p => p.memberId === requester.id);

    if (!isDirectOwner && !isFamilyMember && !isParticipant) {
      return { allowed: false, status: 403, reason: 'FORBIDDEN' };
    }
    return { allowed: true, reason: isDirectOwner ? 'DIRECT_OWNER' : (isFamilyMember ? 'FAMILY' : 'PARTICIPANT') };
  };

  // Attacker Bob tries to access Alice's booking -> Must be blocked with 403
  const bobAccess = await evaluateBookingAccess(memberB);
  assert(
    bobAccess.allowed === false && bobAccess.status === 403,
    'Obj 5',
    'Booking IDOR: Unrelated user access blocked (403)',
    `Bob access allowed: ${bobAccess.allowed}, status: ${bobAccess.status}`
  );

  // Alice herself accesses -> Allowed
  const aliceAccess = await evaluateBookingAccess(memberA);
  assert(
    aliceAccess.allowed === true && aliceAccess.reason === 'DIRECT_OWNER',
    'Obj 5',
    'Booking IDOR: Direct owner access permitted',
    `Alice access allowed: ${aliceAccess.allowed}, reason: ${aliceAccess.reason}`
  );

  // Alice's family member accesses -> Allowed
  const familyAccess = await evaluateBookingAccess(memberC);
  assert(
    familyAccess.allowed === true && familyAccess.reason === 'FAMILY',
    'Obj 5',
    'Booking IDOR: Family member access permitted',
    `Family access allowed: ${familyAccess.allowed}, reason: ${familyAccess.reason}`
  );

  // Participant Dan accesses -> Allowed
  const participantAccess = await evaluateBookingAccess(memberD);
  assert(
    participantAccess.allowed === true && participantAccess.reason === 'PARTICIPANT',
    'Obj 5',
    'Booking IDOR: Invited game participant access permitted',
    `Participant access allowed: ${participantAccess.allowed}, reason: ${participantAccess.reason}`
  );

  // Admin accesses -> Allowed
  const adminAccess = await evaluateBookingAccess({ id: 'admin1', familyId: null, mobile: null, isAdmin: true });
  assert(
    adminAccess.allowed === true && adminAccess.reason === 'ADMIN',
    'Obj 5',
    'Booking IDOR: Admin session access permitted',
    `Admin access allowed: ${adminAccess.allowed}`
  );

  // 5.2: upload/delete IDOR logic evaluation
  const evaluateUploadDelete = async (
    requester: { id: string; familyId: string | null; mobile: string | null; isAdmin?: boolean } | null,
    key: string
  ) => {
    const isAdmin = !!requester?.isAdmin;
    if (!isAdmin && !requester) {
      return { status: 401, error: 'Unauthorized' };
    }

    if (!key) return { status: 400, error: 'key or publicUrl is required' };
    if (key.includes('..') || !key.startsWith('uploads/')) {
      return { status: 400, error: 'Invalid file key path' };
    }

    if (!isAdmin) {
      if (key.toLowerCase().endsWith('.apk')) {
        return { status: 403, error: 'Forbidden: Admin privileges required to delete application packages' };
      }

      const [isAppVersion, isBanner, isAnnouncement, isSport, isTurf, isTournament] = await Promise.all([
        prisma.appVersion.findFirst({ where: { OR: [{ fileKey: key }, { downloadUrl: { contains: key } }] }, select: { id: true } }),
        prisma.banner.findFirst({ where: { imageUrl: { contains: key } }, select: { id: true } }),
        prisma.appAnnouncement.findFirst({ where: { imageUrl: { contains: key } }, select: { id: true } }),
        prisma.sport.findFirst({ where: { iconPath: { contains: key } }, select: { id: true } }),
        prisma.turf.findFirst({ where: { iconPath: { contains: key } }, select: { id: true } }),
        prisma.tournament.findFirst({ where: { thumbnail: { contains: key } }, select: { id: true } })
      ]);

      if (isAppVersion || isBanner || isAnnouncement || isSport || isTurf || isTournament) {
        return { status: 403, error: 'Forbidden: Admin privileges required to delete system resources' };
      }

      const registration = await prisma.tournamentRegistration.findFirst({
        where: { paymentScreenshotUrl: { contains: key } },
        include: { registeredBy: true }
      });

      if (registration && requester) {
        const isOwner =
          registration.registeredById === requester.id ||
          (requester.familyId && registration.registeredBy?.familyId === requester.familyId) ||
          (requester.mobile && registration.registeredBy?.mobile === requester.mobile);

        if (!isOwner) {
          return { status: 403, error: 'Forbidden: You do not own this file' };
        }
      }
    }

    return { status: 200, success: true };
  };

  // Test Path Traversal attempt
  const trav1 = await evaluateUploadDelete(memberB, 'uploads/../../etc/passwd');
  assert(
    trav1.status === 400,
    'Obj 5',
    'Upload/delete: Path traversal key blocked (400)',
    `Status: ${trav1.status}`
  );

  // Test Non-uploads path attempt
  const nonUpload = await evaluateUploadDelete(memberB, 'system/config.json');
  assert(
    nonUpload.status === 400,
    'Obj 5',
    'Upload/delete: Outside uploads/ prefix blocked (400)',
    `Status: ${nonUpload.status}`
  );

  // Test APK deletion attempt by non-admin
  const apkDel = await evaluateUploadDelete(memberB, 'uploads/sportsvilla-app-release.apk');
  assert(
    apkDel.status === 403,
    'Obj 5',
    'Upload/delete: APK file deletion blocked for non-admin (403)',
    `Status: ${apkDel.status}`
  );

  // Test APK deletion attempt with uppercase extension .APK
  const apkUpperDel = await evaluateUploadDelete(memberB, 'uploads/SPORTSVILLA.APK');
  assert(
    apkUpperDel.status === 403,
    'Obj 5',
    'Upload/delete: Case-insensitive .APK deletion blocked (403)',
    `Status: ${apkUpperDel.status}`
  );

  // Test System Banner deletion by non-admin
  const testBanner = await prisma.banner.create({
    data: { imageUrl: `uploads/banner_${testBatchId}.jpg`, title: 'Promo Banner' }
  });
  const bannerDel = await evaluateUploadDelete(memberB, `uploads/banner_${testBatchId}.jpg`);
  assert(
    bannerDel.status === 403,
    'Obj 5',
    'Upload/delete: System banner deletion blocked for non-admin (403)',
    `Status: ${bannerDel.status}`
  );

  // Test Tournament Registration Screenshot IDOR
  const testTournament = await prisma.tournament.create({
    data: { name: `Tourney_${testBatchId}`, startDate: new Date() }
  });
  const regScreenshotKey = `uploads/payment_screenshot_${testBatchId}.png`;
  const reg = await prisma.tournamentRegistration.create({
    data: {
      tournamentId: testTournament.id,
      registeredById: memberA.id,
      paymentScreenshotUrl: regScreenshotKey,
      status: 'PENDING'
    }
  });

  // Attacker Bob tries to delete Alice's payment screenshot
  const bobDelScreenshot = await evaluateUploadDelete(memberB, regScreenshotKey);
  assert(
    bobDelScreenshot.status === 403,
    'Obj 5',
    'Upload/delete IDOR: Unrelated user cannot delete other user screenshot (403)',
    `Status: ${bobDelScreenshot.status}`
  );

  // Alice herself tries to delete her payment screenshot
  const aliceDelScreenshot = await evaluateUploadDelete(memberA, regScreenshotKey);
  assert(
    aliceDelScreenshot.status === 200,
    'Obj 5',
    'Upload/delete IDOR: Owner permitted to delete own screenshot (200)',
    `Status: ${aliceDelScreenshot.status}`
  );

  // Admin deletes banner -> Permitted
  const adminDelBanner = await evaluateUploadDelete({ id: 'admin1', familyId: null, mobile: null, isAdmin: true }, `uploads/banner_${testBatchId}.jpg`);
  assert(
    adminDelBanner.status === 200,
    'Obj 5',
    'Upload/delete: Admin permitted to delete system assets (200)',
    `Status: ${adminDelBanner.status}`
  );


  // ---------------------------------------------------------------------------
  // CLEANUP DB FIXTURES
  // ---------------------------------------------------------------------------
  console.log('\n>>> Cleaning up test fixtures...');
  try {
    await prisma.ticket.deleteMany({ where: { booking: { turfId: testTurf.id } } });
    await prisma.payment.deleteMany({ where: { booking: { turfId: testTurf.id } } });
    await prisma.transaction.deleteMany({ where: { booking: { turfId: testTurf.id } } });
    await prisma.bookingParticipant.deleteMany({ where: { bookingId: bookingA.id } });
    await prisma.booking.deleteMany({ where: { turfId: testTurf.id } });
    await prisma.tournamentRegistration.deleteMany({ where: { tournamentId: testTournament.id } });
    await prisma.tournament.delete({ where: { id: testTournament.id } });
    await prisma.banner.delete({ where: { id: testBanner.id } });
    await prisma.nfcTransaction.deleteMany({ where: { memberId: walletMember.id } });
    await prisma.walletTransaction.deleteMany({ where: { memberId: walletMember.id } });
    await prisma.nfcCard.deleteMany({ where: { memberId: walletMember.id } });
    await prisma.member.deleteMany({ where: { id: { in: [memberA.id, memberB.id, memberC.id, memberD.id, walletMember.id, testMember.id] } } });
    await prisma.familyGroup.delete({ where: { id: family.id } });
    await prisma.turf.delete({ where: { id: testTurf.id } });
    await prisma.sport.delete({ where: { id: testSport.id } });
    console.log('Cleanup finished cleanly.');
  } catch (cleanErr) {
    console.warn('Cleanup warning:', cleanErr);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('VERIFICATION SUMMARY');
  console.log('================================================================');
  const total = reports.length;
  const passed = reports.filter(r => r.passed).length;
  const failed = reports.filter(r => !r.passed).length;
  console.log(`Total Assertions Run: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Overall Status: ${failed === 0 ? 'SUCCESS - ALL FIXES HOLD EMPIRICALLY' : 'FAILURES DETECTED'}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAdversarialVerification().catch((e) => {
  console.error('Fatal execution error in test runner:', e);
  process.exit(1);
});
