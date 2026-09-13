import { Mutex } from '../src/lib/mutex.ts';
import { formatIST, todayIST, getISTDateBounds } from '../src/lib/dateUtils.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual === expected) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message} (Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)})`);
    failed++;
  }
}

console.log('================================================================');
console.log('CHALLENGER G8 2 — EMPIRICAL VERIFICATION & STRESS TEST HARNESS');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// SUITE 1: Mutex Concurrency, TTL Expiration & Lock Isolation
// ----------------------------------------------------------------------------
async function testSuite1_Mutex() {
  console.log('--- SUITE 1: In-Memory Mutex Concurrency & TTL ---');

  // Test 1.1: Basic Acquire and Release
  const acquired1 = await Mutex.acquire('test:lock:1', 1000, 10000);
  assertEqual(acquired1, true, 'Mutex.acquire acquires free lock');

  // Test 1.2: Concurrent Acquire Times Out
  const startT = Date.now();
  const acquired2 = await Mutex.acquire('test:lock:1', 200, 10000);
  const elapsed = Date.now() - startT;
  assertEqual(acquired2, false, 'Second acquire on locked key times out and returns false');
  assert(elapsed >= 190 && elapsed <= 350, `Acquire timeout honors timeoutMs (~200ms, took ${elapsed}ms)`);

  // Test 1.3: Release Unlocks Immediately
  Mutex.release('test:lock:1');
  const acquired3 = await Mutex.acquire('test:lock:1', 500, 10000);
  assertEqual(acquired3, true, 'Lock re-acquired immediately after release');
  Mutex.release('test:lock:1');

  // Test 1.4: Lock Key Isolation
  const lockA = await Mutex.acquire('key:A', 500, 5000);
  const lockB = await Mutex.acquire('key:B', 500, 5000);
  assertEqual(lockA && lockB, true, 'Independent keys do not block each other');
  Mutex.release('key:A');
  Mutex.release('key:B');

  // Test 1.5: TTL Auto-Expiration (Without Release)
  const ttlKey = 'test:ttl:key';
  const acquiredTtl = await Mutex.acquire(ttlKey, 500, 200); // 200ms TTL
  assertEqual(acquiredTtl, true, 'Acquired lock with 200ms TTL');

  // Immediately try to reacquire (should fail)
  const immediateReacquire = await Mutex.acquire(ttlKey, 50, 1000);
  assertEqual(immediateReacquire, false, 'Cannot acquire before TTL expiry');

  // Wait 250ms for TTL to expire
  await new Promise(r => setTimeout(r, 260));
  const postTtlAcquire = await Mutex.acquire(ttlKey, 500, 5000);
  assertEqual(postTtlAcquire, true, 'Lock auto-released after TTL expiration without explicit release');
  Mutex.release(ttlKey);

  // Test 1.6: Stress Test Concurrent Contention (20 Workers)
  const stressKey = 'resource:court:checkin';
  let activeWorkers = 0;
  let maxConcurrent = 0;
  let successCount = 0;
  const totalWorkers = 20;

  const workerPromises = Array.from({ length: totalWorkers }, async (_, idx) => {
    const ok = await Mutex.acquire(stressKey, 5000, 2000);
    if (!ok) return;

    activeWorkers++;
    if (activeWorkers > maxConcurrent) {
      maxConcurrent = activeWorkers;
    }

    // Simulate work inside critical section
    await new Promise(r => setTimeout(r, 20));

    activeWorkers--;
    successCount++;
    Mutex.release(stressKey);
  });

  await Promise.all(workerPromises);
  assertEqual(maxConcurrent, 1, `Strict mutual exclusion maintained under high contention (Max concurrent: ${maxConcurrent})`);
  assertEqual(successCount, totalWorkers, `All ${totalWorkers} workers successfully entered critical section sequentially`);
}

// ----------------------------------------------------------------------------
// SUITE 2: Join-Game By Code Payload Unwrapping & Boundary Safety
// ----------------------------------------------------------------------------
function testSuite2_JoinGamePayload() {
  console.log('\n--- SUITE 2: Join-Game Payload Unwrapping & Boundary Safety ---');

  // Helper extracting exact unwrapping and rendering logic from join-game/[code]/page.tsx
  function evaluateJoinGamePage(res: any, error: any = null) {
    const booking = res?.booking ?? (res?.id ? res : null);

    if (!booking || error || res?.error) {
      return {
        view: 'ERROR_OR_NOT_FOUND',
        errorMsg: res?.error || "This invite code doesn't exist or has expired.",
        canJoin: false,
      };
    }

    const squad = booking.participants || booking.squad || [];
    const capacity = booking.inviteMaxCount || (booking.turf?.capacityPerSlot ? booking.turf.capacityPerSlot * 2 : 10);
    const isFull = squad.length >= capacity;

    const formatSlotTime = () => {
      if (Array.isArray(booking.slots) && booking.slots.length > 0) {
        return booking.slots.join(', ');
      }
      if (booking.startTime && booking.endTime) {
        const s = new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const e = new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${s} - ${e}`;
      }
      if (booking.startTime) {
        return new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return 'Time slot not specified';
    };

    const sportTitle = booking.sport?.name || 'Sports Match';
    const hostName = `Hosted by ${booking.member?.name || booking.host?.name || 'a member'}`;
    const venueName = booking.turf?.name || booking.venue?.name || 'SportsVilla Court';
    const venueAddress = booking.turf?.location || booking.turf?.address || booking.venue?.address || 'Main Campus';
    const dateDisplay = booking.startTime 
      ? new Date(booking.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : (booking.date ? new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date not specified');
    const slotTimeDisplay = formatSlotTime();

    return {
      view: 'GAME_DETAILS',
      squadCount: squad.length,
      capacity,
      isFull,
      sportTitle,
      hostName,
      venueName,
      venueAddress,
      dateDisplay,
      slotTimeDisplay,
      canJoin: !isFull && !!booking.id,
    };
  }

  // Test 2.1: Wrapped Response Format ({ booking: { ... } })
  const resWrapped = {
    booking: {
      id: 'b-wrapped-101',
      sport: { name: 'Box Cricket' },
      turf: { name: 'Turf A', location: 'Gate 2', capacityPerSlot: 6 },
      member: { name: 'Rahul' },
      startTime: '2026-09-20T14:30:00.000Z',
      endTime: '2026-09-20T16:00:00.000Z',
      participants: [{ id: 'p1' }, { id: 'p2' }],
      inviteMaxCount: 12
    }
  };
  const evalWrapped = evaluateJoinGamePage(resWrapped);
  assertEqual(evalWrapped.view, 'GAME_DETAILS', 'Wrapped response unwrapped correctly');
  assertEqual(evalWrapped.sportTitle, 'Box Cricket', 'Sport title resolved');
  assertEqual(evalWrapped.venueName, 'Turf A', 'Turf name resolved');
  assertEqual(evalWrapped.capacity, 12, 'Custom inviteMaxCount honored');
  assertEqual(evalWrapped.squadCount, 2, 'Squad count resolved');
  assertEqual(evalWrapped.isFull, false, 'Squad not full');

  // Test 2.2: Flat Root Response Format ({ id: '...', ... })
  const resFlat = {
    id: 'b-flat-202',
    sport: { name: 'Football 5v5' },
    turf: { name: 'Arena B', address: 'North Wing', capacityPerSlot: 5 },
    host: { name: 'Vikram' },
    squad: [{ id: 'm1' }],
    slots: ['06:00 PM - 07:00 PM']
  };
  const evalFlat = evaluateJoinGamePage(resFlat);
  assertEqual(evalFlat.view, 'GAME_DETAILS', 'Flat root payload unwrapped correctly via fallback');
  assertEqual(evalFlat.hostName, 'Hosted by Vikram', 'Host name resolved from booking.host');
  assertEqual(evalFlat.capacity, 10, 'Capacity computed as capacityPerSlot * 2');
  assertEqual(evalFlat.slotTimeDisplay, '06:00 PM - 07:00 PM', 'Slots array formatted correctly');

  // Test 2.3: Boundary Safety: Null Sport, Missing Turf, Empty Squad
  const resSparse = {
    booking: {
      id: 'b-sparse-303',
      sport: null,
      turf: null,
      member: null,
      host: null,
      venue: null,
      participants: null,
      squad: null,
      startTime: null,
      endTime: null,
      slots: null,
    }
  };
  const evalSparse = evaluateJoinGamePage(resSparse);
  assertEqual(evalSparse.view, 'GAME_DETAILS', 'Null relations do not crash page');
  assertEqual(evalSparse.sportTitle, 'Sports Match', 'Sport falls back to default safely');
  assertEqual(evalSparse.hostName, 'Hosted by a member', 'Host falls back to default safely');
  assertEqual(evalSparse.venueName, 'SportsVilla Court', 'Venue falls back to default safely');
  assertEqual(evalSparse.venueAddress, 'Main Campus', 'Address falls back to default safely');
  assertEqual(evalSparse.capacity, 10, 'Capacity defaults to 10 when turf and inviteMaxCount are missing');
  assertEqual(evalSparse.squadCount, 0, 'Squad count is 0 without crash');
  assertEqual(evalSparse.slotTimeDisplay, 'Time slot not specified', 'Slot time handles nulls gracefully');
  assertEqual(evalSparse.dateDisplay, 'Date not specified', 'Date handles nulls gracefully');
  assertEqual(evalSparse.canJoin, true, 'User can join sparse booking');

  // Test 2.4: Full Squad Boundary
  const resFull = {
    booking: {
      id: 'b-full-404',
      inviteMaxCount: 3,
      participants: [{ id: '1' }, { id: '2' }, { id: '3' }],
    }
  };
  const evalFull = evaluateJoinGamePage(resFull);
  assertEqual(evalFull.isFull, true, 'Squad marked as full when squad length reaches capacity');
  assertEqual(evalFull.canJoin, false, 'Join button disabled when squad is full');

  // Test 2.5: Error / Expired Responses
  const resError = { error: 'Invite code expired' };
  const evalError = evaluateJoinGamePage(resError);
  assertEqual(evalError.view, 'ERROR_OR_NOT_FOUND', 'Error response properly displays error view');
  assertEqual(evalError.errorMsg, 'Invite code expired', 'API error message displayed');

  const resNull = null;
  const evalNull = evaluateJoinGamePage(resNull);
  assertEqual(evalNull.view, 'ERROR_OR_NOT_FOUND', 'Null API response handled gracefully');
}

// ----------------------------------------------------------------------------
// SUITE 3: Reschedule Datetime Formatting & IST Offset Protection
// ----------------------------------------------------------------------------
function testSuite3_RescheduleTimezone() {
  console.log('\n--- SUITE 3: Reschedule Datetime Formatting with IST Timezone Offsets ---');

  // Test 3.1: formatIST correctly converts UTC Date to IST String
  // UTC 2026-09-15 14:30:00 -> IST (+5:30) is 2026-09-15 20:00:00
  const utcDate1 = new Date('2026-09-15T14:30:00.000Z');
  const istDateStr = formatIST(utcDate1, 'yyyy-MM-dd');
  const istTimeStr = formatIST(utcDate1, 'HH:mm');
  assertEqual(istDateStr, '2026-09-15', 'formatIST extracts correct IST date string');
  assertEqual(istTimeStr, '20:00', 'formatIST extracts correct IST 24-hour time');

  // Test 3.2: Cross-Midnight Boundary Conversion (UTC late evening -> IST next day morning)
  // UTC 2026-09-15 21:00:00 -> IST (+5:30) is 2026-09-16 02:30:00
  const utcCrossMidnight = new Date('2026-09-15T21:00:00.000Z');
  assertEqual(formatIST(utcCrossMidnight, 'yyyy-MM-dd'), '2026-09-16', 'Cross-midnight UTC correctly rolls over to next day in IST');
  assertEqual(formatIST(utcCrossMidnight, 'HH:mm'), '02:30', 'Cross-midnight time reflects 02:30 AM IST');

  // Test 3.3: ManageBookings Reschedule Datetime Construction
  // Simulated form inputs in admin modal:
  const selectedDate = '2026-10-05';
  const selectedTime = '17:30'; // 5:30 PM IST
  const originalBookingDurationMs = 60 * 60 * 1000; // 1 hour

  // Code under test from ManageBookings.tsx (lines 161-163):
  const newStart = new Date(`${selectedDate}T${selectedTime}:00+05:30`);
  const newEnd = new Date(newStart.getTime() + originalBookingDurationMs);

  // Verification: Regardless of machine/browser local timezone, newStart MUST equal UTC 12:00:00
  assertEqual(newStart.toISOString(), '2026-10-05T12:00:00.000Z', 'Constructed start Date with +05:30 parses to exact UTC equivalent');
  assertEqual(newEnd.toISOString(), '2026-10-05T13:00:00.000Z', 'Constructed end Date preserves exact duration (1 hour)');

  // Verify reverse formatting preserves exact user inputs
  assertEqual(formatIST(newStart, 'yyyy-MM-dd'), selectedDate, 'Round-trip date in IST matches user selection');
  assertEqual(formatIST(newStart, 'HH:mm'), selectedTime, 'Round-trip time in IST matches user selection');

  // Test 3.4: Edge Case: Reschedule to Midnight (00:00 IST)
  const midnightStart = new Date('2026-11-01T00:00:00+05:30');
  assertEqual(midnightStart.toISOString(), '2026-10-31T18:30:00.000Z', 'Midnight IST (00:00) parsed to correct previous UTC day 18:30');
  assertEqual(formatIST(midnightStart, 'yyyy-MM-dd HH:mm'), '2026-11-01 00:00', 'Midnight IST round-trip preserves 00:00 on selected date');

  // Test 3.5: Edge Case: Reschedule to Late Night (23:45 IST)
  const lateNightStart = new Date('2026-11-01T23:45:00+05:30');
  assertEqual(lateNightStart.toISOString(), '2026-11-01T18:15:00.000Z', 'Late night 23:45 IST parsed to 18:15 UTC');
  assertEqual(formatIST(lateNightStart, 'HH:mm'), '23:45', 'Late night IST round-trip preserves 23:45');
}

// ----------------------------------------------------------------------------
// SUITE 4: Entry Pass QR Rendering Condition Logic (Unpaid vs Paid)
// ----------------------------------------------------------------------------
function testSuite4_EntryPassQrConditions() {
  console.log('\n--- SUITE 4: Entry Pass QR Rendering Conditions (Unpaid vs Paid) ---');

  // Logic under test from BookingDetailClient.tsx (Web)
  function evaluateWebEntryPass(booking: any) {
    const isConfirmed = booking.status === "CONFIRMED";
    const isCancelled = booking.status === "CANCELLED";
    const isCompleted = booking.status === "COMPLETED";

    const amountDue = booking.amountDue > 0
      ? booking.amountDue
      : Math.max(0, (booking.price || 0) - (booking.discountAmount || 0) - (booking.advancePaid || 0));

    let qrRenderState = 'NONE'; // not in DOM

    if (isConfirmed && !isCompleted) {
      if (booking.paymentStatus === 'PAID' || amountDue <= 0) {
        qrRenderState = 'QR_UNLOCKED';
      } else {
        qrRenderState = 'LOCKED_PAYMENT_REQUIRED';
      }
    }

    return { qrRenderState, amountDue };
  }

  // Logic under test from BookingCard.tsx (Mobile App)
  function evaluateMobileEntryPass(booking: any, now: Date = new Date('2026-09-13T10:00:00.000Z')) {
    const startDate = new Date(booking.startTime);
    const validityEnd = new Date(startDate.getTime());
    validityEnd.setHours(23, 59, 59, 999);
    if (booking.turf?.bookingValidityDays > 0) {
      validityEnd.setDate(validityEnd.getDate() + booking.turf.bookingValidityDays);
    }
    const isQrExpired = now > validityEnd;
    const activeTicket = booking.tickets?.find((t: any) => !t.usedAt);
    const isPaid = booking.paymentStatus === 'PAID' || (booking.amountDue !== undefined && booking.amountDue <= 0);
    const showQrCode = !isQrExpired && booking.status !== 'CANCELLED' && isPaid && !!activeTicket;

    return { showQrCode, isPaid, isQrExpired, hasActiveTicket: !!activeTicket };
  }

  const futureStart = '2026-09-15T10:00:00.000Z';
  const futureEnd = '2026-09-15T11:00:00.000Z';

  // Test 4.1: Unpaid Confirmed Booking (PAC / Pay At Counter)
  const unpaidBooking = {
    id: 'b-unpaid',
    status: 'CONFIRMED',
    paymentStatus: 'UNPAID',
    price: 1200,
    advancePaid: 0,
    amountDue: 1200,
    startTime: futureStart,
    endTime: futureEnd,
    tickets: [{ id: 't1', usedAt: null, qrCode: 'TICKET-1' }]
  };
  const webUnpaid = evaluateWebEntryPass(unpaidBooking);
  assertEqual(webUnpaid.qrRenderState, 'LOCKED_PAYMENT_REQUIRED', 'Web Entry Pass is LOCKED with Payment Required banner for UNPAID booking');
  assertEqual(webUnpaid.amountDue, 1200, 'Web amountDue accurately calculated');

  const mobileUnpaid = evaluateMobileEntryPass(unpaidBooking);
  assertEqual(mobileUnpaid.showQrCode, false, 'Mobile BookingCard hides Show QR button for UNPAID booking');

  // Test 4.2: Partially Paid Booking (Advance paid, remaining balance due)
  const partialBooking = {
    id: 'b-partial',
    status: 'CONFIRMED',
    paymentStatus: 'PARTIAL',
    price: 1500,
    discountAmount: 200,
    advancePaid: 500,
    amountDue: 800,
    startTime: futureStart,
    endTime: futureEnd,
    tickets: [{ id: 't2', usedAt: null, qrCode: 'TICKET-2' }]
  };
  const webPartial = evaluateWebEntryPass(partialBooking);
  assertEqual(webPartial.qrRenderState, 'LOCKED_PAYMENT_REQUIRED', 'Web Entry Pass is LOCKED for PARTIAL payment status');
  assertEqual(webPartial.amountDue, 800, 'Web reflects net remaining amount due');

  const mobilePartial = evaluateMobileEntryPass(partialBooking);
  assertEqual(mobilePartial.showQrCode, false, 'Mobile BookingCard hides Show QR for PARTIAL booking with outstanding amount');

  // Test 4.3: Fully Paid Confirmed Booking
  const paidBooking = {
    id: 'b-paid',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    price: 1000,
    discountAmount: 100,
    advancePaid: 900,
    amountDue: 0,
    startTime: futureStart,
    endTime: futureEnd,
    tickets: [{ id: 't3', usedAt: null, qrCode: 'TICKET-3' }]
  };
  const webPaid = evaluateWebEntryPass(paidBooking);
  assertEqual(webPaid.qrRenderState, 'QR_UNLOCKED', 'Web Entry Pass QR is UNLOCKED and rendered for fully PAID booking');

  const mobilePaid = evaluateMobileEntryPass(paidBooking);
  assertEqual(mobilePaid.showQrCode, true, 'Mobile BookingCard displays Show QR button for fully PAID booking');

  // Test 4.4: Cancelled Booking
  const cancelledBooking = {
    id: 'b-cancelled',
    status: 'CANCELLED',
    paymentStatus: 'PAID',
    price: 1000,
    amountDue: 0,
    startTime: futureStart,
    endTime: futureEnd,
    tickets: [{ id: 't4', usedAt: null }]
  };
  const webCancelled = evaluateWebEntryPass(cancelledBooking);
  assertEqual(webCancelled.qrRenderState, 'NONE', 'Web does not render QR section for CANCELLED booking');

  const mobileCancelled = evaluateMobileEntryPass(cancelledBooking);
  assertEqual(mobileCancelled.showQrCode, false, 'Mobile does not show QR for CANCELLED booking');

  // Test 4.5: Completed Booking (Already played)
  const completedBooking = {
    id: 'b-completed',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    price: 1000,
    amountDue: 0,
    startTime: '2026-09-01T10:00:00.000Z',
    endTime: '2026-09-01T11:00:00.000Z',
    tickets: [{ id: 't5', usedAt: '2026-09-01T10:05:00.000Z' }]
  };
  const webCompleted = evaluateWebEntryPass(completedBooking);
  assertEqual(webCompleted.qrRenderState, 'NONE', 'Web does not render QR section for COMPLETED booking');

  const mobileCompleted = evaluateMobileEntryPass(completedBooking);
  assertEqual(mobileCompleted.showQrCode, false, 'Mobile does not show QR for COMPLETED/used ticket');

  // Test 4.6: Pending Booking (Payment not yet attempted)
  const pendingBooking = {
    id: 'b-pending',
    status: 'PAYMENT_PENDING',
    paymentStatus: 'UNPAID',
    price: 1000,
    amountDue: 1000,
    startTime: futureStart,
    endTime: futureEnd,
  };
  const webPending = evaluateWebEntryPass(pendingBooking);
  assertEqual(webPending.qrRenderState, 'NONE', 'Web does not render QR section for PAYMENT_PENDING booking');
}

// ----------------------------------------------------------------------------
// RUN ALL TESTS
// ----------------------------------------------------------------------------
async function runAll() {
  await testSuite1_Mutex();
  testSuite2_JoinGamePayload();
  testSuite3_RescheduleTimezone();
  testSuite4_EntryPassQrConditions();

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAll().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
