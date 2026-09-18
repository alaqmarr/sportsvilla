import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmedPush, sendPushNotificationToMember } from '@/lib/notifications';
import { PaymentService } from '@/services/PaymentService';

// Set up mocks for Next.js server runtime primitives
try {
  const nextAuth = require('next-auth');
  nextAuth.getServerSession = async () => null;
} catch {}
try {
  const nextCache = require('next/cache');
  nextCache.revalidatePath = () => {};
} catch {}

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function recordTest(category: string, name: string, passed: boolean, error?: string, details?: any) {
  results.push({ category, name, passed, error, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} [${category}] ${name}${error ? ` -> ${error}` : ''}`);
}

async function runChallengerSuite() {
  console.log('================================================================');
  console.log('  CHALLENGER 1 (G13) EMPIRICAL VERIFICATION & STRESS TEST SUITE ');
  console.log('  Milestone R4: Booking Confirmation Triggers                   ');
  console.log('================================================================\n');

  // Track created entities for thorough cleanup
  const createdMemberIds: string[] = [];
  const createdSportIds: string[] = [];
  const createdTurfIds: string[] = [];
  const createdBookingIds: string[] = [];

  try {
    // -------------------------------------------------------------------------
    // Setup Shared Test Fixtures
    // -------------------------------------------------------------------------
    const uniqueSuffix = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString();
    
    // 1. Sport
    const testSport = await prisma.sport.create({
      data: {
        name: `Challenger Tennis ${uniqueSuffix}`,
        description: 'Challenger Sport for R4 Verification',
        slotDurationMinutes: 60,
      }
    });
    createdSportIds.push(testSport.id);

    // 2. Turf
    const testTurf = await prisma.turf.create({
      data: {
        name: `Challenger Center Court ${uniqueSuffix}`,
        bookingPrice: 800,
        bookingDurationMinutes: 60,
        capacityPerSlot: 4,
      }
    });
    createdTurfIds.push(testTurf.id);

    await prisma.turfSport.create({
      data: {
        turfId: testTurf.id,
        sportId: testSport.id,
      }
    });

    // -------------------------------------------------------------------------
    // CATEGORY 1: Baseline Verification & Field Contract
    // -------------------------------------------------------------------------
    console.log('\n--- CATEGORY 1: Baseline Verification & Field Contract ---');
    
    const memberWithToken = await prisma.member.create({
      data: {
        mobile: `988${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'Challenger User With Token',
        walletBalance: 50000,
      }
    });
    createdMemberIds.push(memberWithToken.id);

    // Register a valid mock Expo push token
    const mockToken1 = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
    await prisma.deviceToken.create({
      data: {
        memberId: memberWithToken.id,
        token: mockToken1,
        platform: 'android'
      }
    });

    const bookingId1 = `chk-bkg-1-${uniqueSuffix}`;
    const startTime1 = new Date('2026-11-20T04:30:00.000Z'); // 10:00 AM IST
    const endTime1 = new Date('2026-11-20T05:30:00.000Z');   // 11:00 AM IST

    await sendBookingConfirmedPush({
      id: bookingId1,
      memberId: memberWithToken.id,
      turf: { name: testTurf.name },
      sport: { name: testSport.name },
      startTime: startTime1,
      endTime: endTime1,
    });

    // Allow short tick for DB settlement
    await new Promise(r => setTimeout(r, 150));

    const notif1 = await prisma.notification.findFirst({
      where: { memberId: memberWithToken.id },
      orderBy: { createdAt: 'desc' }
    });

    recordTest(
      'Contract',
      'sendBookingConfirmedPush persists notification record in DB',
      !!notif1
    );

    recordTest(
      'Contract',
      'Title exactly matches "Booking Confirmed! 🎾"',
      notif1?.title === 'Booking Confirmed! 🎾',
      notif1?.title !== 'Booking Confirmed! 🎾' ? `Received "${notif1?.title}"` : undefined
    );

    const payload1 = notif1?.data as any;
    recordTest(
      'Contract',
      'Data payload contains bookingId matching input',
      payload1?.bookingId === bookingId1,
      payload1?.bookingId !== bookingId1 ? `Received "${payload1?.bookingId}"` : undefined
    );

    recordTest(
      'Contract',
      'Data payload contains screen === "bookings"',
      payload1?.screen === 'bookings',
      payload1?.screen !== 'bookings' ? `Received "${payload1?.screen}"` : undefined
    );

    recordTest(
      'Contract',
      'Data payload contains type === "BOOKING_CONFIRMED"',
      payload1?.type === 'BOOKING_CONFIRMED',
      payload1?.type !== 'BOOKING_CONFIRMED' ? `Received "${payload1?.type}"` : undefined
    );

    recordTest(
      'Contract',
      'Notification is initially unread (isRead === false)',
      notif1?.isRead === false
    );

    recordTest(
      'Contract',
      'Body contains formatted date, sport name, turf name, and confirmed status',
      typeof notif1?.body === 'string' &&
      notif1.body.includes(testSport.name) &&
      notif1.body.includes(testTurf.name) &&
      notif1.body.includes('is confirmed'),
      undefined,
      { body: notif1?.body }
    );

    // -------------------------------------------------------------------------
    // CATEGORY 2: Behavior with 0 Registered Device Tokens
    // -------------------------------------------------------------------------
    console.log('\n--- CATEGORY 2: Behavior with 0 Registered Device Tokens ---');

    const memberZeroTokens = await prisma.member.create({
      data: {
        mobile: `987${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'Challenger User Zero Tokens',
        walletBalance: 20000,
      }
    });
    createdMemberIds.push(memberZeroTokens.id);

    // Ensure member has exactly 0 device tokens
    const tokenCount = await prisma.deviceToken.count({ where: { memberId: memberZeroTokens.id } });
    recordTest('Zero Tokens', 'Precondition: Member has 0 registered device tokens', tokenCount === 0);

    const bookingId2 = `chk-bkg-2-${uniqueSuffix}`;
    let threwZeroToken = false;
    try {
      await sendBookingConfirmedPush({
        id: bookingId2,
        memberId: memberZeroTokens.id,
        turf: { name: 'Court B' },
        sport: { name: 'Squash' },
        startTime: startTime1,
        endTime: endTime1,
      });
    } catch (e: any) {
      threwZeroToken = true;
    }

    recordTest(
      'Zero Tokens',
      'sendBookingConfirmedPush executes without throwing exceptions when tokens === 0',
      !threwZeroToken
    );

    await new Promise(r => setTimeout(r, 150));

    const notifZero = await prisma.notification.findFirst({
      where: { memberId: memberZeroTokens.id },
      orderBy: { createdAt: 'desc' }
    });

    recordTest(
      'Zero Tokens',
      'Notification record is still saved in DB when member has 0 tokens',
      !!notifZero && notifZero.title === 'Booking Confirmed! 🎾'
    );

    const payloadZero = notifZero?.data as any;
    recordTest(
      'Zero Tokens',
      'Payload preserves deep link fields for in-app inbox sync',
      payloadZero?.bookingId === bookingId2 &&
      payloadZero?.screen === 'bookings' &&
      payloadZero?.type === 'BOOKING_CONFIRMED'
    );

    // -------------------------------------------------------------------------
    // CATEGORY 3: Null Turf and Null Sport Fallbacks
    // -------------------------------------------------------------------------
    console.log('\n--- CATEGORY 3: Null Turf and Null Sport Fallbacks ---');

    const memberNullTurf = await prisma.member.create({
      data: {
        mobile: `986${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'Challenger Null Turf User',
      }
    });
    createdMemberIds.push(memberNullTurf.id);

    const bookingId3 = `chk-bkg-3-${uniqueSuffix}`;
    let threwNullTurf = false;
    try {
      await sendBookingConfirmedPush({
        id: bookingId3,
        memberId: memberNullTurf.id,
        turf: null,
        sport: null,
        startTime: startTime1,
        endTime: endTime1,
      });
    } catch (e) {
      threwNullTurf = true;
    }

    recordTest(
      'Fallback Resilience',
      'sendBookingConfirmedPush handles turf: null and sport: null without crashing',
      !threwNullTurf
    );

    const notifNullTurf = await prisma.notification.findFirst({
      where: { memberId: memberNullTurf.id },
      orderBy: { createdAt: 'desc' }
    });

    recordTest(
      'Fallback Resilience',
      'Notification body uses fallback "Sports Court" when turf is null',
      typeof notifNullTurf?.body === 'string' && notifNullTurf.body.includes('Sports Court'),
      notifNullTurf?.body ? `Body: "${notifNullTurf.body}"` : 'No body found'
    );

    recordTest(
      'Fallback Resilience',
      'Notification body uses fallback "Session" when sport is null',
      typeof notifNullTurf?.body === 'string' && notifNullTurf.body.includes('Session'),
      notifNullTurf?.body ? `Body: "${notifNullTurf.body}"` : 'No body found'
    );

    // Also test turf: undefined and sport: undefined
    const memberUndefinedTurf = await prisma.member.create({
      data: {
        mobile: `985${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'Challenger Undefined Turf User',
      }
    });
    createdMemberIds.push(memberUndefinedTurf.id);

    let threwUndefined = false;
    try {
      await sendBookingConfirmedPush({
        id: `chk-bkg-3b-${uniqueSuffix}`,
        memberId: memberUndefinedTurf.id,
        turf: undefined,
        sport: undefined,
        startTime: '2026-11-20T04:30:00.000Z',
        endTime: '2026-11-20T05:30:00.000Z',
      });
    } catch {
      threwUndefined = true;
    }

    recordTest(
      'Fallback Resilience',
      'sendBookingConfirmedPush handles undefined turf and sport gracefully',
      !threwUndefined
    );

    const notifUndefined = await prisma.notification.findFirst({
      where: { memberId: memberUndefinedTurf.id },
      orderBy: { createdAt: 'desc' }
    });

    recordTest(
      'Fallback Resilience',
      'Undefined turf and sport produce proper fallback body string',
      typeof notifUndefined?.body === 'string' &&
      notifUndefined.body.includes('Session') &&
      notifUndefined.body.includes('Sports Court')
    );

    // -------------------------------------------------------------------------
    // CATEGORY 4: Token Pruning & Syntax Validation
    // -------------------------------------------------------------------------
    console.log('\n--- CATEGORY 4: Token Pruning & Syntax Validation ---');

    const memberPruneTest = await prisma.member.create({
      data: {
        mobile: `984${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'Challenger Prune Test User',
      }
    });
    createdMemberIds.push(memberPruneTest.id);

    const malformedToken = 'invalid-not-an-expo-token-999';

    await prisma.deviceToken.create({
      data: { memberId: memberPruneTest.id, token: malformedToken, platform: 'web' },
    });

    await sendBookingConfirmedPush({
      id: `chk-bkg-4-${uniqueSuffix}`,
      memberId: memberPruneTest.id,
      turf: { name: 'Center Court' },
      sport: { name: 'Pickleball' },
      startTime: startTime1,
      endTime: endTime1,
    });

    await new Promise(r => setTimeout(r, 200));

    // Verify malformed token was pruned from the database by pre-flight validation
    const malformedRemaining = await prisma.deviceToken.findFirst({
      where: { token: malformedToken }
    });

    recordTest(
      'Token Management',
      'Malformed syntax tokens are automatically pruned from deviceToken table',
      malformedRemaining === null
    );

    const notifPrune = await prisma.notification.findFirst({
      where: { memberId: memberPruneTest.id },
      orderBy: { createdAt: 'desc' }
    });

    recordTest(
      'Token Management',
      'Notification record still created even when token is malformed',
      !!notifPrune && notifPrune.title === 'Booking Confirmed! 🎾'
    );

    // -------------------------------------------------------------------------
    // CATEGORY 5: Extreme Edge Cases & Error Containment
    // -------------------------------------------------------------------------
    console.log('\n--- CATEGORY 5: Extreme Edge Cases & Error Containment ---');

    let threwNonExistentMember = false;
    try {
      await sendBookingConfirmedPush({
        id: `chk-bkg-5-${uniqueSuffix}`,
        memberId: 'non-existent-member-cuid-999999',
        turf: { name: 'Ghost Court' },
        sport: { name: 'Ghost Sport' },
        startTime: startTime1,
        endTime: endTime1,
      });
    } catch {
      threwNonExistentMember = true;
    }

    recordTest(
      'Error Containment',
      'sendBookingConfirmedPush never throws when memberId does not exist in DB',
      !threwNonExistentMember
    );

    let threwInvalidDate = false;
    try {
      await sendBookingConfirmedPush({
        id: `chk-bkg-5b-${uniqueSuffix}`,
        memberId: memberWithToken.id,
        turf: { name: 'Court' },
        sport: { name: 'Tennis' },
        startTime: 'invalid-date-string-here',
        endTime: 'invalid-date-string-here',
      });
    } catch {
      threwInvalidDate = true;
    }

    recordTest(
      'Error Containment',
      'sendBookingConfirmedPush never throws on invalid date strings',
      !threwInvalidDate
    );

    // -------------------------------------------------------------------------
    // CATEGORY 6: Trigger Integration in PaymentService.sendConfirmationAndTickets
    // -------------------------------------------------------------------------
    console.log('\n--- CATEGORY 6: Trigger Integration in PaymentService.sendConfirmationAndTickets ---');

    // Create an actual confirmed booking in DB for PaymentService testing
    const bookingFull = await prisma.booking.create({
      data: {
        id: `chk-ps-bkg-full-${uniqueSuffix}`,
        memberId: memberWithToken.id,
        turfId: testTurf.id,
        sportId: testSport.id,
        startTime: startTime1,
        endTime: endTime1,
        price: 800,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        participantCount: 1,
      },
      include: {
        turf: true,
        sport: true,
        member: true,
      }
    });
    createdBookingIds.push(bookingFull.id);

    let psFullError: any = null;
    try {
      await PaymentService.sendConfirmationAndTickets(bookingFull);
    } catch (err) {
      psFullError = err;
    }

    recordTest(
      'PaymentService Integration',
      'PaymentService.sendConfirmationAndTickets completes successfully for full booking',
      psFullError === null,
      psFullError?.message
    );

    // Verify tickets were created
    const tickets = await prisma.ticket.findMany({
      where: { bookingId: bookingFull.id }
    });
    recordTest(
      'PaymentService Integration',
      'PaymentService.sendConfirmationAndTickets generates ticket records',
      tickets.length === 1
    );

    // Verify push notification record was created for memberWithToken
    await new Promise(r => setTimeout(r, 200));
    const psNotif = await prisma.notification.findFirst({
      where: {
        memberId: memberWithToken.id,
        title: 'Booking Confirmed! 🎾',
      },
      orderBy: { createdAt: 'desc' }
    });

    const psPayload = psNotif?.data as any;
    recordTest(
      'PaymentService Integration',
      'PaymentService triggers push notification with correct title and payload',
      !!psNotif &&
      psPayload?.bookingId === bookingFull.id &&
      psPayload?.screen === 'bookings' &&
      psPayload?.type === 'BOOKING_CONFIRMED'
    );

    // Stress Scenario: partial booking relations
    console.log('\n--- Stress Scenario: PaymentService with lazy / partial booking relations ---');
    const bookingPartial = await prisma.booking.create({
      data: {
        id: `chk-ps-bkg-partial-${uniqueSuffix}`,
        memberId: memberWithToken.id,
        turfId: testTurf.id,
        sportId: testSport.id,
        startTime: startTime1,
        endTime: endTime1,
        price: 800,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        participantCount: 1,
      }
    });
    createdBookingIds.push(bookingPartial.id);

    let psPartialError: any = null;
    try {
      await PaymentService.sendConfirmationAndTickets(bookingPartial);
    } catch (err) {
      psPartialError = err;
    }

    recordTest(
      'PaymentService Stress',
      'PaymentService.sendConfirmationAndTickets handles partial relations without unhandled crash',
      psPartialError === null,
      psPartialError?.message
    );

    // -------------------------------------------------------------------------
    // CATEGORY 7: Trigger Integration in Client Booking Route (POST /api/client/v1/bookings)
    // -------------------------------------------------------------------------
    console.log('\n--- CATEGORY 7: Trigger Integration in Client Booking Route ---');

    const memberClientBook = await prisma.member.create({
      data: {
        mobile: `983${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'Challenger Client Book User',
        walletBalance: 100000,
      }
    });
    createdMemberIds.push(memberClientBook.id);

    // Free court so status is CONFIRMED immediately on creation
    const freeTurf = await prisma.turf.create({
      data: {
        name: `Free Court ${uniqueSuffix}`,
        bookingPrice: 0,
        bookingDurationMinutes: 60,
        capacityPerSlot: 4,
      }
    });
    createdTurfIds.push(freeTurf.id);

    await prisma.turfSport.create({
      data: {
        turfId: freeTurf.id,
        sportId: testSport.id,
      }
    });

    const clientSlotStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    clientSlotStart.setMinutes(0, 0, 0);
    const clientSlotEnd = new Date(clientSlotStart.getTime() + 60 * 60 * 1000);

    const jwt = require('jsonwebtoken');
    const clientAuthToken = jwt.sign(
      { uid: memberClientBook.mobile, memberId: memberClientBook.id },
      process.env.NEXTAUTH_SECRET || 'secret'
    );

    const { POST: clientBookingPost } = await import('@/app/api/client/v1/bookings/route');

    const clientReq = new Request('http://localhost/api/client/v1/bookings', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${clientAuthToken}`
      },
      body: JSON.stringify({
        turfId: freeTurf.id,
        sportId: testSport.id,
        startTime: clientSlotStart.toISOString(),
        endTime: clientSlotEnd.toISOString(),
        participantCount: 1,
      })
    });

    const clientRes = await clientBookingPost(clientReq);
    const clientJson = await clientRes.json();

    recordTest(
      'Client Booking API',
      'POST /api/client/v1/bookings returns success: true and status: CONFIRMED',
      clientRes.status === 200 && clientJson?.success === true && clientJson?.booking?.status === 'CONFIRMED',
      clientJson?.error || (clientRes.status !== 200 ? `HTTP ${clientRes.status}` : undefined)
    );

    if (clientJson?.booking?.id) {
      createdBookingIds.push(clientJson.booking.id);
    }

    // Wait for async fire-and-forget push trigger
    await new Promise(r => setTimeout(r, 300));

    const clientBookingNotif = await prisma.notification.findFirst({
      where: { memberId: memberClientBook.id },
      orderBy: { createdAt: 'desc' }
    });

    recordTest(
      'Client Booking API',
      'Confirmed booking creation triggers sendBookingConfirmedPush creating Notification record',
      !!clientBookingNotif && clientBookingNotif.title === 'Booking Confirmed! 🎾',
      !clientBookingNotif ? 'No notification record found in DB' : undefined
    );

    const clientNotifPayload = clientBookingNotif?.data as any;
    recordTest(
      'Client Booking API',
      'Notification payload contains bookingId, screen: "bookings", and type: "BOOKING_CONFIRMED"',
      clientNotifPayload?.screen === 'bookings' &&
      clientNotifPayload?.type === 'BOOKING_CONFIRMED' &&
      clientJson?.booking?.id && clientNotifPayload?.bookingId === clientJson.booking.id
    );

    // -------------------------------------------------------------------------
    // CATEGORY 8: Booking State Transitions & End-to-End Deferred Confirmation
    // -------------------------------------------------------------------------
    console.log('\n--- CATEGORY 8: Booking State Transitions & Deferred Confirmation ---');

    const memberDeferred = await prisma.member.create({
      data: {
        mobile: `982${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: 'Challenger Deferred User',
      }
    });
    createdMemberIds.push(memberDeferred.id);

    // 1. Initial Pending Booking (Paid turf): Ensure NO push is fired on creation
    const deferredReq = new Request('http://localhost/api/client/v1/bookings', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${jwt.sign(
          { uid: memberDeferred.mobile, memberId: memberDeferred.id },
          process.env.NEXTAUTH_SECRET || 'secret'
        )}`
      },
      body: JSON.stringify({
        turfId: testTurf.id,
        sportId: testSport.id,
        startTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        participantCount: 1,
      })
    });

    const deferredRes = await clientBookingPost(deferredReq);
    const deferredJson = await deferredRes.json();

    recordTest(
      'State Transitions',
      'Unpaid booking creation is set to PAYMENT_PENDING',
      deferredRes.status === 200 && deferredJson?.booking?.status === 'PAYMENT_PENDING'
    );

    if (deferredJson?.booking?.id) {
      createdBookingIds.push(deferredJson.booking.id);
    }

    await new Promise(r => setTimeout(r, 200));

    // Ensure NO push notification was emitted for this member while PAYMENT_PENDING
    const pendingNotif = await prisma.notification.findFirst({
      where: { memberId: memberDeferred.id }
    });
    recordTest(
      'State Transitions',
      'PAYMENT_PENDING bookings do NOT emit confirmed notifications prematurely',
      pendingNotif === null
    );

    // 2. Now settle the booking through PaymentService.sendConfirmationAndTickets
    if (deferredJson?.booking?.id) {
      const fullBookingToSettle = await prisma.booking.findUnique({
        where: { id: deferredJson.booking.id },
        include: { turf: true, sport: true, member: true }
      });

      await PaymentService.sendConfirmationAndTickets(fullBookingToSettle);
      await new Promise(r => setTimeout(r, 300));

      const settledNotif = await prisma.notification.findFirst({
        where: { memberId: memberDeferred.id },
        orderBy: { createdAt: 'desc' }
      });

      recordTest(
        'State Transitions',
        'Payment settlement fires sendBookingConfirmedPush creating Notification record',
        !!settledNotif && settledNotif.title === 'Booking Confirmed! 🎾'
      );

      const settledPayload = settledNotif?.data as any;
      recordTest(
        'State Transitions',
        'Settled notification payload matches bookingId and deep link parameters',
        settledPayload?.bookingId === deferredJson.booking.id &&
        settledPayload?.screen === 'bookings' &&
        settledPayload?.type === 'BOOKING_CONFIRMED'
      );
    }

  } finally {
    console.log('\n--- Cleaning up Test Fixtures ---');
    try {
      if (createdBookingIds.length > 0) {
        await prisma.ticket.deleteMany({ where: { bookingId: { in: createdBookingIds } } });
        await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
      }
      if (createdMemberIds.length > 0) {
        await prisma.notification.deleteMany({ where: { memberId: { in: createdMemberIds } } });
        await prisma.deviceToken.deleteMany({ where: { memberId: { in: createdMemberIds } } });
        await prisma.booking.deleteMany({ where: { memberId: { in: createdMemberIds } } });
        await prisma.member.deleteMany({ where: { id: { in: createdMemberIds } } });
      }
      if (createdTurfIds.length > 0) {
        await prisma.turfSport.deleteMany({ where: { turfId: { in: createdTurfIds } } });
        await prisma.turf.deleteMany({ where: { id: { in: createdTurfIds } } });
      }
      if (createdSportIds.length > 0) {
        await prisma.sport.deleteMany({ where: { id: { in: createdSportIds } } });
      }
      console.log('Test fixtures cleaned up successfully.');
    } catch (cleanupErr) {
      console.error('Error during cleanup:', cleanupErr);
    }
  }

  // ---------------------------------------------------------------------------
  // Summary & Evaluation
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('                     TEST RESULTS SUMMARY                       ');
  console.log('================================================================');
  
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`Total Assertions : ${total}`);
  console.log(`Passed           : ${passed}`);
  console.log(`Failed           : ${failed}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`❌ [${r.category}] ${r.name}: ${r.error || 'Assertion failed'}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 ALL EMPIRICAL CHALLENGER ASSERTIONS PASSED WITH ZERO FAILURES!');
    process.exit(0);
  }
}

runChallengerSuite().catch(err => {
  console.error('Fatal unhandled error in test suite:', err);
  process.exit(1);
});
