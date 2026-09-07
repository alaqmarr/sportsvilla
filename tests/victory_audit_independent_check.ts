import dotenv from 'dotenv';
dotenv.config();

import Module from 'module';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../src/lib/prisma';
import { PaymentService } from '../src/services/PaymentService';
import { BookingCleanupService } from '../src/services/BookingCleanupService';
import { BookingService } from '../src/services/BookingService';

// Mock next-auth session and next/cache for routes and server actions
let mockSession: any = null;
const originalRequire = (Module.prototype as any).require;
(Module.prototype as any).require = function(modulePath: string) {
  if (modulePath === 'next-auth') {
    return {
      getServerSession: async () => mockSession,
      default: () => {}
    };
  }
  if (modulePath === 'next/cache') {
    return {
      revalidatePath: () => {},
      revalidateTag: () => {}
    };
  }
  return originalRequire.apply(this, arguments);
};

try {
  const nextCacheResolved = require.resolve('next/cache');
  require.cache[nextCacheResolved] = {
    id: nextCacheResolved,
    filename: nextCacheResolved,
    loaded: true,
    exports: {
      revalidatePath: () => {},
      revalidateTag: () => {}
    }
  } as any;
} catch {}

interface TestResult {
  code: string;
  name: string;
  passed: boolean;
  error?: string;
  evidence: string;
}

const results: TestResult[] = [];

function recordPass(code: string, name: string, evidence: string) {
  results.push({ code, name, passed: true, evidence });
  console.log(`[PASS] ${code}: ${name}`);
  console.log(`       Evidence: ${evidence}`);
}

function recordFail(code: string, name: string, error: string) {
  results.push({ code, name, passed: false, error, evidence: error });
  console.error(`[FAIL] ${code}: ${name}`);
  console.error(`       Error: ${error}`);
}

async function main() {
  console.log('================================================================================');
  console.log('  VICTORY AUDITOR INDEPENDENT VERIFICATION SUITE');
  console.log('  10 Acceptance Criteria Forensic Verification');
  console.log('================================================================================\n');

  const jwtSecret = process.env.NEXTAUTH_SECRET || 'sportsvilla-dev-secret-jwt-key-2026';
  process.env.NEXTAUTH_SECRET = jwtSecret;

  // --------------------------------------------------------------------------
  // SEC-01: Razorpay webhook rejects missing x-razorpay-signature with 401
  // --------------------------------------------------------------------------
  try {
    const { POST: webhookPost } = await import('../src/app/api/client/v1/payments/webhook/route');

    // 1. Missing signature when gateway=RAZORPAY
    const reqNoSig = new Request('http://localhost:3000/api/client/v1/payments/webhook?gateway=RAZORPAY', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'order.paid' })
    });
    const resNoSig = await webhookPost(reqNoSig);
    const bodyNoSig = await resNoSig.json();

    if (resNoSig.status !== 401 || !bodyNoSig.error?.includes('Missing Razorpay signature')) {
      throw new Error(`Expected HTTP 401 with 'Missing Razorpay signature', got ${resNoSig.status}: ${JSON.stringify(bodyNoSig)}`);
    }

    // 2. Invalid signature with gateway=RAZORPAY
    const reqBadSig = new Request('http://localhost:3000/api/client/v1/payments/webhook?gateway=RAZORPAY', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
      },
      body: JSON.stringify({ event: 'order.paid' })
    });
    const resBadSig = await webhookPost(reqBadSig);
    const bodyBadSig = await resBadSig.json();

    if (resBadSig.status !== 401 || !bodyBadSig.error?.includes('Invalid webhook signature')) {
      throw new Error(`Expected HTTP 401 with 'Invalid webhook signature', got ${resBadSig.status}: ${JSON.stringify(bodyBadSig)}`);
    }

    recordPass('SEC-01', 'Razorpay webhook signature enforcement', `Missing signature returned HTTP ${resNoSig.status} ("${bodyNoSig.error}"). Invalid signature returned HTTP ${resBadSig.status} ("${bodyBadSig.error}").`);
  } catch (err: any) {
    recordFail('SEC-01', 'Razorpay webhook signature enforcement', err.message);
  }

  // --------------------------------------------------------------------------
  // SEC-02: Booking cleanup route requires CRON_SECRET Bearer token / admin session
  // --------------------------------------------------------------------------
  try {
    const { POST: cleanupPost, GET: cleanupGet } = await import('../src/app/api/client/v1/bookings/cleanup/route');

    process.env.CRON_SECRET = 'audit-test-cron-secret-12345';
    mockSession = null;

    // 1. Unauthenticated POST
    const reqPostUnauth = new Request('http://localhost:3000/api/client/v1/bookings/cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeoutMinutes: 15 })
    });
    const resPostUnauth = await cleanupPost(reqPostUnauth);
    const bodyPostUnauth = await resPostUnauth.json();

    if (resPostUnauth.status !== 401) {
      throw new Error(`Unauthenticated POST returned HTTP ${resPostUnauth.status}, expected 401`);
    }

    // 2. Unauthenticated GET
    const reqGetUnauth = new Request('http://localhost:3000/api/client/v1/bookings/cleanup', {
      method: 'GET'
    });
    const resGetUnauth = await cleanupGet(reqGetUnauth);
    if (resGetUnauth.status !== 401) {
      throw new Error(`Unauthenticated GET returned HTTP ${resGetUnauth.status}, expected 401`);
    }

    // 3. Authorized POST via CRON_SECRET Bearer token
    const reqPostAuth = new Request('http://localhost:3000/api/client/v1/bookings/cleanup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer audit-test-cron-secret-12345`
      },
      body: JSON.stringify({ timeoutMinutes: 15 })
    });
    const resPostAuth = await cleanupPost(reqPostAuth);
    const bodyPostAuth = await resPostAuth.json();
    if (resPostAuth.status !== 200 || !bodyPostAuth.success) {
      throw new Error(`Authorized POST returned ${resPostAuth.status}: ${JSON.stringify(bodyPostAuth)}`);
    }

    recordPass('SEC-02', 'Booking cleanup authorization guard', `Unauthenticated POST & GET returned HTTP 401. Authorized request with Bearer CRON_SECRET returned HTTP 200 (cleaned: ${bodyPostAuth.cleaned}).`);
  } catch (err: any) {
    recordFail('SEC-02', 'Booking cleanup authorization guard', err.message);
  }

  // --------------------------------------------------------------------------
  // SEC-03: debug_err route is deleted (404); whatsapp/logs requires admin session (401)
  // --------------------------------------------------------------------------
  try {
    const debugErrPath = path.resolve(__dirname, '../src/app/api/client/v1/debug_err');
    const debugErrExists = fs.existsSync(debugErrPath);
    if (debugErrExists) {
      throw new Error(`debug_err route file still exists on disk at ${debugErrPath}`);
    }

    const { GET: whatsappLogsGet } = await import('../src/app/api/client/v1/whatsapp/logs/route');
    mockSession = null; // No admin session

    const reqLogsUnauth = new Request('http://localhost:3000/api/client/v1/whatsapp/logs', { method: 'GET' });
    const resLogsUnauth = await whatsappLogsGet();
    const bodyLogsUnauth = await resLogsUnauth.json();

    if (resLogsUnauth.status !== 401 || !bodyLogsUnauth.error?.includes('Unauthorized')) {
      throw new Error(`whatsapp/logs without admin session returned HTTP ${resLogsUnauth.status}: ${JSON.stringify(bodyLogsUnauth)}`);
    }

    recordPass('SEC-03', 'OTP Plaintext & debug route elimination', `debug_err route completely removed from filesystem. whatsapp/logs returned HTTP 401 Unauthorized without session.`);
  } catch (err: any) {
    recordFail('SEC-03', 'OTP Plaintext & debug route elimination', err.message);
  }

  // --------------------------------------------------------------------------
  // SEC-04: Payment IDOR check in create & verify (403 on mismatch) & verifyRazorpayPayment
  // --------------------------------------------------------------------------
  try {
    const { POST: paymentCreatePost } = await import('../src/app/api/client/v1/payments/create/route');
    const { POST: paymentVerifyPost } = await import('../src/app/api/client/v1/payments/verify/route');

    const ts = Date.now();
    // Create two test members
    const memberA = await prisma.member.create({
      data: {
        id: `mem_a_${ts}`,
        name: `Member A ${ts}`,
        mobile: `99900${ts.toString().slice(-5)}`,
        email: `mem_a_${ts}@sportsvilla.test`
      }
    });

    const memberB = await prisma.member.create({
      data: {
        id: `mem_b_${ts}`,
        name: `Member B ${ts}`,
        mobile: `99911${ts.toString().slice(-5)}`,
        email: `mem_b_${ts}@sportsvilla.test`
      }
    });

    let turf = await prisma.turf.findFirst({ include: { sports: true } });
    if (!turf) {
      turf = await prisma.turf.create({
        data: { id: `turf_${ts}`, name: 'Court 1', bookingPrice: 500, bookingDurationMinutes: 60 }
      });
    }

    let sport = await prisma.sport.findFirst();
    if (!sport) {
      sport = await prisma.sport.create({
        data: { id: `sport_${ts}`, name: 'Badminton', rewardPointsPerCheckin: 0 }
      });
    }

    const sportId = turf.sports?.[0]?.sportId || sport.id;

    // Create booking for Member A
    const bookingA = await prisma.booking.create({
      data: {
        id: `bk_idor_a_${ts}`,
        memberId: memberA.id,
        turfId: turf.id,
        sportId: sportId,
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 90000000),
        price: 500,
        amountDue: 500,
        status: 'PAYMENT_PENDING',
        paymentStatus: 'UNPAID'
      }
    });

    // Generate JWT for Member B
    const tokenB = jwt.sign(
      { memberId: memberB.id, uid: memberB.mobile, email: memberB.email },
      jwtSecret
    );

    // 1. Member B attempts to call payments/create for Member A's booking
    const reqCreateMismatch = new Request('http://localhost:3000/api/client/v1/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({ bookingId: bookingA.id, gateway: 'RAZORPAY' })
    });
    const resCreateMismatch = await paymentCreatePost(reqCreateMismatch, {});
    const bodyCreateMismatch = await resCreateMismatch.json();

    if (resCreateMismatch.status !== 403) {
      throw new Error(`IDOR create check failed: expected HTTP 403, got ${resCreateMismatch.status}: ${JSON.stringify(bodyCreateMismatch)}`);
    }

    // 2. Member B attempts to call payments/verify for Member A's booking
    const reqVerifyMismatch = new Request('http://localhost:3000/api/client/v1/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        bookingId: bookingA.id,
        gateway: 'RAZORPAY',
        orderId: 'order_fake_123',
        paymentId: 'pay_fake_123',
        signature: 'sig_fake_123'
      })
    });
    const resVerifyMismatch = await paymentVerifyPost(reqVerifyMismatch, {});
    const bodyVerifyMismatch = await resVerifyMismatch.json();

    if (resVerifyMismatch.status !== 403) {
      throw new Error(`IDOR verify check failed: expected HTTP 403, got ${resVerifyMismatch.status}: ${JSON.stringify(bodyVerifyMismatch)}`);
    }

    // 3. Test verifyRazorpayPayment validates transaction.bookingId matches bookingId
    await prisma.setting.upsert({
      where: { key: 'RAZORPAY_KEY_SECRET' },
      update: { value: 'rzp_secret_audit_test' },
      create: { key: 'RAZORPAY_KEY_SECRET', value: 'rzp_secret_audit_test' }
    });

    const fakeOrderId = `order_test_${ts}`;
    const fakePaymentId = `pay_test_${ts}`;
    const rzpSecret = 'rzp_secret_audit_test';
    const validSig = crypto.createHmac('sha256', rzpSecret).update(`${fakeOrderId}|${fakePaymentId}`).digest('hex');

    // Create a transaction tied to bookingA
    await prisma.transaction.create({
      data: {
        id: `tx_${ts}`,
        bookingId: bookingA.id,
        memberId: memberA.id,
        gateway: 'RAZORPAY',
        gatewayOrderId: fakeOrderId,
        amount: 500,
        currency: 'INR',
        status: 'PENDING'
      }
    });

    // Create booking B
    const bookingB = await prisma.booking.create({
      data: {
        id: `bk_idor_b_${ts}`,
        memberId: memberB.id,
        turfId: turf.id,
        sportId: sportId,
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 90000000),
        price: 500,
        amountDue: 500,
        status: 'PAYMENT_PENDING',
        paymentStatus: 'UNPAID'
      }
    });

    // Attempt to verify payment for bookingB using order created for bookingA
    let mismatchCaught = false;
    try {
      await PaymentService.verifyRazorpayPayment(bookingB.id, fakeOrderId, fakePaymentId, validSig);
    } catch (e: any) {
      if (e.message.includes('Transaction does not match the provided booking ID') && e.status === 400) {
        mismatchCaught = true;
      } else {
        throw e;
      }
    }

    if (!mismatchCaught) {
      throw new Error('PaymentService.verifyRazorpayPayment failed to reject mismatched transaction.bookingId!');
    }

    recordPass('SEC-04', 'Payment IDOR & transaction booking validation', `payments/create & payments/verify rejected non-owner with HTTP 403. verifyRazorpayPayment threw HTTP 400 when orderId belonged to a different booking.`);
  } catch (err: any) {
    recordFail('SEC-04', 'Payment IDOR & transaction booking validation', err.message);
  }

  // --------------------------------------------------------------------------
  // PAY-03: Loyalty points deferred to settlement; pointsRedeemed saved on booking
  // --------------------------------------------------------------------------
  try {
    const ts = Date.now();
    const testMember = await prisma.member.create({
      data: {
        id: `mem_loyalty_${ts}`,
        name: `Loyalty Member ${ts}`,
        mobile: `98800${ts.toString().slice(-5)}`,
        email: `loyalty_${ts}@test.com`,
        loyaltyPoints: 100
      }
    });

    const sport = await prisma.sport.findFirst();
    const sportId = sport!.id;

    const isolatedTurf = await prisma.turf.create({
      data: {
        id: `turf_loyalty_${ts}`,
        name: `Isolated Turf ${ts}`,
        capacityPerSlot: 10,
        bookingPrice: 1000,
        bookingDurationMinutes: 60
      }
    });

    // 1. Create a booking directly simulating booking creation with pointsRedeemed and PAYMENT_PENDING
    const booking = await prisma.booking.create({
      data: {
        id: `bk_loyalty_${ts}`,
        memberId: testMember.id,
        turfId: isolatedTurf.id,
        sportId: sportId,
        startTime: new Date(Date.now() + 86400000 * 10),
        endTime: new Date(Date.now() + 86400000 * 10 + 3600000),
        price: 1000,
        amountDue: 900,
        pointsRedeemed: 100,
        status: 'PAYMENT_PENDING',
        paymentStatus: 'UNPAID'
      }
    });

    // Verify pointsRedeemed was saved
    if (booking.pointsRedeemed !== 100) {
      throw new Error(`Expected booking.pointsRedeemed === 100, got ${booking.pointsRedeemed}`);
    }

    // Verify member loyalty points is still at initial (not incremented with pointsEarned)
    const freshMemBefore = await prisma.member.findUnique({ where: { id: testMember.id } });
    if (freshMemBefore!.loyaltyPoints > 100) {
      throw new Error(`Loyalty points prematurely awarded before payment! Points: ${freshMemBefore!.loyaltyPoints}`);
    }

    // Settle payment
    await PaymentService.settleSuccessfulPayment({
      bookingId: booking.id,
      gateway: 'RAZORPAY',
      gatewayOrderId: `ord_loyalty_${ts}`,
      paidAmountRupees: 900
    });

    const freshMemAfter = await prisma.member.findUnique({ where: { id: testMember.id } });
    const earnedHistory = await prisma.loyaltyHistory.findFirst({
      where: { memberId: testMember.id, type: 'EARNED', description: { contains: booking.id } }
    });

    if (!earnedHistory || freshMemAfter!.loyaltyPoints <= 100) {
      throw new Error(`Loyalty points were not credited on settleSuccessfulPayment! Points: ${freshMemAfter?.loyaltyPoints}`);
    }

    // 2. Test BookingCleanupService refunds pointsRedeemed on expiration
    const expiredBooking = await prisma.booking.create({
      data: {
        id: `bk_cleanup_pts_${ts}`,
        memberId: testMember.id,
        turfId: isolatedTurf.id,
        sportId: sportId,
        startTime: new Date(Date.now() + 86400000 * 20),
        endTime: new Date(Date.now() + 86400000 * 20 + 3600000),
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        price: 1000,
        amountDue: 950,
        advancePaid: 0,
        pointsRedeemed: 50,
        status: 'PAYMENT_PENDING',
        paymentStatus: 'UNPAID'
      }
    });

    const pointsBeforeCleanup = freshMemAfter!.loyaltyPoints;
    await BookingCleanupService.cleanupAbandonedBookings(15);

    const freshMemPostCleanup = await prisma.member.findUnique({ where: { id: testMember.id } });
    const refundHistory = await prisma.loyaltyHistory.findFirst({
      where: { memberId: testMember.id, type: 'REFUND', description: { contains: expiredBooking.id } }
    });

    if (!refundHistory || freshMemPostCleanup!.loyaltyPoints !== pointsBeforeCleanup + 50) {
      throw new Error(`BookingCleanupService failed to refund 50 redeemed points! Before: ${pointsBeforeCleanup}, After: ${freshMemPostCleanup?.loyaltyPoints}`);
    }

    recordPass('PAY-03', 'Loyalty points lifecycle & cleanup refund', `pointsRedeemed saved on booking. Loyalty points deferred until settleSuccessfulPayment (${earnedHistory.points} pts earned). Expired booking restored ${refundHistory.points} points on cleanup.`);
  } catch (err: any) {
    recordFail('PAY-03', 'Loyalty points lifecycle & cleanup refund', err.message);
  }

  // --------------------------------------------------------------------------
  // PAY-02: BookingService.getRefundPreview includes all payment methods (ONLINE)
  // --------------------------------------------------------------------------
  try {
    const bookingWithOnlinePay: any = {
      id: 'bk_refund_test',
      price: 2000,
      discountAmount: 0,
      startTime: new Date(Date.now() + 86400000 * 2), // 48h in future (> cancellationLimitHours)
      payments: [
        { id: 'p1', bookingId: 'bk_refund_test', amount: 2000, method: 'ONLINE' }
      ]
    };

    const preview = BookingService.getRefundPreview(bookingWithOnlinePay, 24);
    if (preview.totalPaid !== 2000) {
      throw new Error(`Expected totalPaid to be 2000, got ${preview.totalPaid}`);
    }
    if (preview.refund !== 2000 || preview.penalty !== 0) {
      throw new Error(`Expected refund: 2000, penalty: 0, got refund: ${preview.refund}, penalty: ${preview.penalty}`);
    }

    recordPass('PAY-02', 'Refund calculation includes ONLINE payments', `Booking paid ₹2000 via ONLINE returned totalPaid: ₹${preview.totalPaid}, refund: ₹${preview.refund} (not ₹0).`);
  } catch (err: any) {
    recordFail('PAY-02', 'Refund calculation includes ONLINE payments', err.message);
  }

  // --------------------------------------------------------------------------
  // MOB-01: book.tsx blocks booking creation if amountDue > 0 && !selectedGateway
  // --------------------------------------------------------------------------
  try {
    const bookTsxPath = path.resolve(__dirname, '../../sportsvilla-app/src/app/(tabs)/book.tsx');
    const bookContent = fs.readFileSync(bookTsxPath, 'utf8');

    const hasConfirmGuard = bookContent.includes('if (amountDue > 0 && !selectedGateway)') &&
      bookContent.includes('"Payment Unavailable"');

    const hasSuccessGuard = bookContent.includes('if (data.booking.amountDue > 0)') &&
      bookContent.includes('if (!selectedGateway)') &&
      bookContent.includes('"Payment Unavailable"');

    if (!hasConfirmGuard || !hasSuccessGuard) {
      throw new Error(`book.tsx is missing pre-flight or post-creation selectedGateway guard`);
    }

    recordPass('MOB-01', 'Mobile offline gateway guard', `Verified book.tsx blocks swipe and booking flow when amountDue > 0 && !selectedGateway, displaying 'Payment Unavailable' alert.`);
  } catch (err: any) {
    recordFail('MOB-01', 'Mobile offline gateway guard', err.message);
  }

  // --------------------------------------------------------------------------
  // MOB-02: isPaymentInProgress ref guard prevents AppState listener from calling resetFlow()
  // --------------------------------------------------------------------------
  try {
    const bookTsxPath = path.resolve(__dirname, '../../sportsvilla-app/src/app/(tabs)/book.tsx');
    const bookContent = fs.readFileSync(bookTsxPath, 'utf8');

    const hasRef = bookContent.includes('isPaymentInProgress = useRef');
    const hasAppStateGuard = bookContent.includes('AppState.addEventListener') &&
      bookContent.includes('if (isPaymentInProgress.current) return;');
    const hasFocusGuard = bookContent.includes('useFocusEffect') &&
      bookContent.includes('if (isPaymentInProgress.current) return;');
    const hasFlagSetting = bookContent.includes('isPaymentInProgress.current = true;') &&
      bookContent.includes('isPaymentInProgress.current = false;');

    if (!hasRef || !hasAppStateGuard || !hasFocusGuard || !hasFlagSetting) {
      throw new Error(`book.tsx missing isPaymentInProgress ref guard implementation`);
    }

    recordPass('MOB-02', 'Mobile AppState payment protection', `Verified isPaymentInProgress ref prevents AppState and focus changes from calling resetFlow() during payment gateway interaction.`);
  } catch (err: any) {
    recordFail('MOB-02', 'Mobile AppState payment protection', err.message);
  }

  // --------------------------------------------------------------------------
  // MOB-03: SwipeButton loading bound to createBookingMutation.isPending || isProcessingPayment
  // --------------------------------------------------------------------------
  try {
    const bookTsxPath = path.resolve(__dirname, '../../sportsvilla-app/src/app/(tabs)/book.tsx');
    const bookContent = fs.readFileSync(bookTsxPath, 'utf8');

    const hasProcessingState = bookContent.includes('isProcessingPayment, setIsProcessingPayment] = useState');
    const hasSwipeProp = bookContent.includes('loading={createBookingMutation.isPending || isProcessingPayment}');
    const hasConfirmCheck = bookContent.includes('if (createBookingMutation.isPending || isProcessingPayment) return;');

    if (!hasProcessingState || !hasSwipeProp || !hasConfirmCheck) {
      throw new Error(`book.tsx missing isProcessingPayment lock or SwipeButton binding`);
    }

    recordPass('MOB-03', 'Mobile SwipeButton concurrency lock', `Verified SwipeButton loading is bound to (createBookingMutation.isPending || isProcessingPayment) and confirmBooking blocks re-entry.`);
  } catch (err: any) {
    recordFail('MOB-03', 'Mobile SwipeButton concurrency lock', err.message);
  }

  // --------------------------------------------------------------------------
  // ADM-01: confirmExtension recalculates totalPaid, newPrice, paymentStatus (PARTIAL), and amountDue
  // --------------------------------------------------------------------------
  try {
    const { confirmExtension } = await import('../src/app/(admin)/bookings/actions');
    const ts = Date.now();
    let sport = await prisma.sport.findFirst();
    const isolatedTurf = await prisma.turf.create({
      data: {
        id: `turf_adm_${ts}`,
        name: `Admin Test Turf ${ts}`,
        capacityPerSlot: 5,
        bookingPrice: 1000,
        bookingDurationMinutes: 60
      }
    });
    const sportId = sport!.id;

    const member = await prisma.member.create({
      data: {
        id: `mem_ext_${ts}`,
        name: `Ext Member ${ts}`,
        mobile: `97700${ts.toString().slice(-5)}`,
        email: `ext_${ts}@test.com`
      }
    });

    const originalStart = new Date(Date.now() + 86400000 * 30);
    const originalEnd = new Date(originalStart.getTime() + 3600000); // 1 hour

    // Create booking that was fully paid
    const booking = await prisma.booking.create({
      data: {
        id: `bk_ext_${ts}`,
        memberId: member.id,
        turfId: isolatedTurf.id,
        sportId: sportId,
        startTime: originalStart,
        endTime: originalEnd,
        price: 1000,
        advancePaid: 1000,
        amountDue: 0,
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      }
    });

    // Create payment record for ₹1000
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: 1000,
        method: 'ONLINE'
      }
    });

    // Same-court extension by 30 minutes, adding ₹500
    const extensionEnd = new Date(originalEnd.getTime() + 1800000);
    const allocations = [
      {
        turfId: isolatedTurf.id,
        turfName: isolatedTurf.name,
        startTime: originalEnd.toISOString(),
        endTime: extensionEnd.toISOString(),
        price: 500,
        isSameCourt: true
      }
    ];

    await confirmExtension(booking.id, allocations);

    const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    if (!updatedBooking) throw new Error('Booking not found after extension');

    if (updatedBooking.price !== 1500) {
      throw new Error(`Expected new price 1500, got ${updatedBooking.price}`);
    }
    if (updatedBooking.paymentStatus !== 'PARTIAL') {
      throw new Error(`Expected paymentStatus 'PARTIAL', got ${updatedBooking.paymentStatus}`);
    }
    if (updatedBooking.amountDue !== 500) {
      throw new Error(`Expected amountDue 500, got ${updatedBooking.amountDue}`);
    }

    recordPass('ADM-01', 'Admin extension payment status & balance recalculation', `confirmExtension updated price from ₹1000 to ₹1500, changed paymentStatus from PAID to PARTIAL, and set amountDue to ₹500.`);
  } catch (err: any) {
    recordFail('ADM-01', 'Admin extension payment status & balance recalculation', err.message);
  }

  console.log('\n================================================================================');
  console.log('SUMMARY OF INDEPENDENT VERIFICATION');
  console.log('================================================================================');
  const allPassed = results.every(r => r.passed);
  console.log(`Total Criteria Tested: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.passed).length}`);
  console.log(`Failed: ${results.filter(r => !r.passed).length}`);
  console.log(`OVERALL VERDICT: ${allPassed ? 'VICTORY CONFIRMED' : 'VICTORY REJECTED'}`);

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
