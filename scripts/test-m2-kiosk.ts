/**
 * Comprehensive Verification Script for Milestone 2 (Dual-Hardware Check-in Kiosk)
 * Tests all 6 required resolution pathways and edge cases:
 * a) Unregistered card rejection
 * b) Blocked card rejection
 * c) Booking check-in with ticket status update and loyalty points
 * d) Membership attendance creation and daily slotsPerDay limit
 * e) Drop-in fee wallet deduction & insufficient funds handling
 * f) Concurrency locking (Mutex) and card UID normalization
 */

import { prisma } from "../src/lib/prisma";
import { NfcCheckinService } from "../src/services/NfcCheckinService";
import { normalizeCardUid } from "../src/hooks/useNfcReader";
import { Mutex } from "../src/lib/mutex";

async function runM2Tests() {
  console.log("================================================================");
  console.log("   SPORTSVILLA MILESTONE 2: CHECK-IN KIOSK TEST SUITE");
  console.log("================================================================\n");

  const TEST_PREFIX = `M2_TEST_${Date.now()}`;
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalCount++;
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`  [FAIL] ${testName} - ${detail || "Assertion failed"}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // Setup Test Environment & Entities
    // -------------------------------------------------------------------------
    console.log(">> Setting up isolated test fixture data...");

    // 1. Create Sport with rewardPointsPerCheckin = 20
    const sport = await prisma.sport.create({
      data: {
        name: `${TEST_PREFIX}_Badminton`,
        rewardPointsPerCheckin: 20,
      },
    });

    // 2. Create Turf linked to Sport
    const turf = await prisma.turf.create({
      data: {
        name: `${TEST_PREFIX}_Court_1`,
        bookingPrice: 600,
        bookingDurationMinutes: 60,
      },
    });
    await prisma.turfSport.create({
      data: {
        turfId: turf.id,
        sportId: sport.id,
      },
    });

    // 3. Create Membership Plan with slotsPerDay = 1, rewardPointsPerCheckin = 15
    const plan = await prisma.membershipPlan.create({
      data: {
        name: `${TEST_PREFIX}_Monthly_Plan`,
        sportId: sport.id,
        durationInDays: 30,
        price: 2000,
        slotsPerDay: 1,
        rewardPointsPerCheckin: 15,
      },
    });

    // 4. Create Member A (Rich wallet: 50,000 paise = ₹500)
    const memberA = await prisma.member.create({
      data: {
        name: `${TEST_PREFIX}_Alice`,
        mobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
        walletBalance: 50000, // 500.00 INR
        loyaltyPoints: 0,
      },
    });

    // 5. Create Member B (Poor wallet: 500 paise = ₹5.00)
    const memberB = await prisma.member.create({
      data: {
        name: `${TEST_PREFIX}_Bob`,
        mobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
        walletBalance: 500, // 5.00 INR
        loyaltyPoints: 0,
      },
    });

    console.log("   Fixtures created successfully.\n");

    // -------------------------------------------------------------------------
    // Test Pathway A: Unregistered Card Rejection
    // -------------------------------------------------------------------------
    console.log(">> 1. Testing Unregistered Card Rejection...");
    const unregUid = "UNREG998877";
    const resA = await NfcCheckinService.resolveCheckin({
      cardUid: unregUid,
      deviceType: "KEYBOARD_WEDGE",
      location: "TEST_KIOSK",
    });

    assert(resA.success === false, "Unregistered card returns success: false");
    assert(resA.action === "REJECTED", "Unregistered card action is REJECTED");
    assert(resA.error === "UNREGISTERED_CARD", "Error code is UNREGISTERED_CARD");

    const failedTxA = await prisma.nfcTransaction.findFirst({
      where: { cardUid: unregUid, failureReason: "UNREGISTERED_CARD" },
    });
    assert(!!failedTxA, "Failed NfcTransaction audit record was logged in DB");
    assert(failedTxA?.status === "FAILED", "Logged transaction status is FAILED");
    console.log("   Pathway A verified.\n");

    // -------------------------------------------------------------------------
    // Test Pathway B: Blocked Card Rejection
    // -------------------------------------------------------------------------
    console.log(">> 2. Testing Blocked Card Rejection...");
    const blockedUid = "BLOCKEDA1B2";
    await prisma.nfcCard.create({
      data: {
        cardUid: blockedUid,
        memberId: memberA.id,
        status: "BLOCKED",
        notes: "Test blocked card",
      },
    });

    const resB = await NfcCheckinService.resolveCheckin({
      cardUid: blockedUid,
      deviceType: "KEYBOARD_WEDGE",
    });

    assert(resB.success === false, "Blocked card returns success: false");
    assert(resB.action === "REJECTED", "Blocked card action is REJECTED");
    assert(resB.error === "CARD_BLOCKED", "Error code is CARD_BLOCKED");

    const failedTxB = await prisma.nfcTransaction.findFirst({
      where: { cardUid: blockedUid, failureReason: "CARD_BLOCKED" },
    });
    assert(!!failedTxB, "Blocked card failure transaction logged in DB");
    console.log("   Pathway B verified.\n");

    // -------------------------------------------------------------------------
    // Test Pathway C: Active Booking Check-in with Ticket Status Update
    // -------------------------------------------------------------------------
    console.log(">> 3. Testing Active Booking Check-in (Priority 1)...");
    const activeCardUid = "ACTIVEC3D4";
    const activeCard = await prisma.nfcCard.create({
      data: {
        cardUid: activeCardUid,
        memberId: memberA.id,
        status: "ACTIVE",
      },
    });

    // Create confirmed booking for memberA starting 10 minutes ago, ending in 50 minutes
    const now = new Date();
    const startTime = new Date(now.getTime() - 10 * 60 * 1000);
    const endTime = new Date(now.getTime() + 50 * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        memberId: memberA.id,
        turfId: turf.id,
        sportId: sport.id,
        startTime,
        endTime,
        price: 600,
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
    });

    const ticket = await prisma.ticket.create({
      data: {
        bookingId: booking.id,
        qrCode: `TKT_${TEST_PREFIX}_01`,
        status: "VALID",
      },
    });

    const resC = await NfcCheckinService.resolveCheckin({
      cardUid: activeCardUid,
      deviceType: "KEYBOARD_WEDGE",
    });

    assert(resC.success === true, "Booking check-in returns success: true");
    assert(resC.action === "BOOKING_CHECKIN", "Action resolved as BOOKING_CHECKIN");
    assert(resC.details?.bookingId === booking.id, "Correct bookingId resolved in response");
    assert(resC.details?.ticketId === ticket.id, "Correct ticketId resolved in response");

    // Verify DB state changes
    const updatedTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    assert(updatedTicket?.status === "CHECKED_IN", "Ticket status changed to CHECKED_IN");
    assert(!!updatedTicket?.usedAt, "Ticket usedAt timestamp recorded");

    const updatedMemberA = await prisma.member.findUnique({ where: { id: memberA.id } });
    assert(updatedMemberA?.loyaltyPoints === 20, "Member loyalty points incremented by 20");

    const loyaltyHistory = await prisma.loyaltyHistory.findFirst({
      where: { memberId: memberA.id, source: "CHECKIN" },
    });
    assert(!!loyaltyHistory, "LoyaltyHistory entry created for check-in");

    const successTxC = await prisma.nfcTransaction.findFirst({
      where: { cardUid: activeCardUid, bookingId: booking.id, type: "CHECKIN", status: "SUCCESS" },
    });
    assert(!!successTxC, "Success NfcTransaction logged for booking check-in");
    console.log("   Pathway C verified.\n");

    // -------------------------------------------------------------------------
    // Test Pathway D: Active Membership Attendance Creation
    // -------------------------------------------------------------------------
    console.log(">> 4. Testing Active Membership Attendance (Priority 2)...");
    // Ticket for booking is now CHECKED_IN, so Priority 1 has no valid tickets.
    // Assign active MemberMembership to memberA
    const memberMembership = await prisma.memberMembership.create({
      data: {
        memberId: memberA.id,
        membershipPlanId: plan.id,
        startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
      },
    });

    const resD = await NfcCheckinService.resolveCheckin({
      cardUid: activeCardUid,
      deviceType: "WEB_NFC",
    });

    assert(resD.success === true, "Membership attendance check-in returns success: true");
    assert(resD.action === "MEMBERSHIP_ATTENDANCE", "Action resolved as MEMBERSHIP_ATTENDANCE");
    assert(resD.details?.membershipPlanName === plan.name, "Plan name matches in response");

    // Verify Attendance record in DB
    const attendance = await prisma.attendance.findFirst({
      where: { memberId: memberA.id, membershipPlanId: plan.id, status: "PRESENT" },
    });
    assert(!!attendance, "Attendance record created in database with status PRESENT");

    const updatedMemberAAfterD = await prisma.member.findUnique({ where: { id: memberA.id } });
    assert(
      updatedMemberAAfterD?.loyaltyPoints === 35,
      "Member loyalty points incremented by additional 15 from membership plan (20 + 15 = 35)"
    );
    console.log("   Pathway D verified.\n");

    // -------------------------------------------------------------------------
    // Test Pathway E: Drop-in Fee Wallet Deduction
    // -------------------------------------------------------------------------
    console.log(">> 5. Testing Drop-in Fee Wallet Deduction (Priority 3)...");
    // MemberA has already used their 1 slotPerDay for today's membership.
    // Tapping again should fall through to Drop-in Fee Deduction!
    // Current wallet balance: 50,000 paise (₹500.00). Default drop-in fee: ₹200 (20,000 paise).
    const resE = await NfcCheckinService.resolveCheckin({
      cardUid: activeCardUid,
      deviceType: "SIMULATOR",
    });

    assert(resE.success === true, "Drop-in check-in returns success: true");
    assert(resE.action === "DROPIN_DEDUCTED", "Action resolved as DROPIN_DEDUCTED");
    assert(resE.details?.dropInFeeRupees === 200, "Drop-in fee is ₹200.00");
    assert(resE.member?.walletBalanceRupees === 300, "Remaining wallet balance is ₹300.00");

    // Verify wallet deduction in DB
    const memberAfterE = await prisma.member.findUnique({ where: { id: memberA.id } });
    assert(memberAfterE?.walletBalance === 30000, "Database walletBalance decremented to 30,000 paise");

    const walletTx = await prisma.walletTransaction.findFirst({
      where: { memberId: memberA.id, type: "DEBIT" },
    });
    assert(!!walletTx, "DEBIT WalletTransaction created in DB");
    assert(walletTx?.amount === 20000, "WalletTransaction amount is 20,000 paise (₹200)");

    const dropinNfcTx = await prisma.nfcTransaction.findFirst({
      where: { cardUid: activeCardUid, type: "DROPIN", status: "SUCCESS" },
    });
    assert(!!dropinNfcTx, "SUCCESS DROPIN NfcTransaction logged in DB");

    // Test Insufficient Funds for Drop-in (Member B)
    console.log("   Testing Insufficient Funds for Drop-in...");
    const poorCardUid = "POORE5F6";
    await prisma.nfcCard.create({
      data: {
        cardUid: poorCardUid,
        memberId: memberB.id,
        status: "ACTIVE",
      },
    });

    const resE2 = await NfcCheckinService.resolveCheckin({
      cardUid: poorCardUid,
      deviceType: "KEYBOARD_WEDGE",
    });

    assert(resE2.success === false, "Insufficient funds returns success: false");
    assert(resE2.action === "REJECTED", "Insufficient funds action is REJECTED");
    assert(resE2.error === "INSUFFICIENT_FUNDS", "Error code is INSUFFICIENT_FUNDS");

    const failedDropinTx = await prisma.nfcTransaction.findFirst({
      where: { cardUid: poorCardUid, type: "DROPIN", status: "FAILED", failureReason: "INSUFFICIENT_FUNDS" },
    });
    assert(!!failedDropinTx, "FAILED DROPIN NfcTransaction logged with INSUFFICIENT_FUNDS");
    console.log("   Pathway E verified.\n");

    // -------------------------------------------------------------------------
    // Test Pathway F: Concurrency Locking & Normalization
    // -------------------------------------------------------------------------
    console.log(">> 6. Testing Concurrency Locking (Mutex) & UID Normalization...");

    // Test normalization utility
    assert(normalizeCardUid("04:a1:b2:c3") === "04A1B2C3", "Normalizes colon-separated lowercase hex");
    assert(normalizeCardUid("  04-a1-b2-c3  ") === "04A1B2C3", "Normalizes hyphen-separated hex with spaces");
    assert(normalizeCardUid("04a1b2c3") === "04A1B2C3", "Normalizes plain lowercase hex to uppercase");

    // Test Mutex concurrency locking
    const testMutexKey = "test_mutex_key";
    const acquiredFirst = await Mutex.acquire(testMutexKey, 500);
    assert(acquiredFirst === true, "Initial Mutex lock acquisition succeeds");

    const acquiredSecond = await Mutex.acquire(testMutexKey, 100);
    assert(acquiredSecond === false, "Second immediate acquisition on locked key times out / is blocked");

    Mutex.release(testMutexKey);
    const acquiredAfterRelease = await Mutex.acquire(testMutexKey, 500);
    assert(acquiredAfterRelease === true, "Acquisition succeeds immediately after release");
    Mutex.release(testMutexKey);

    console.log("   Pathway F verified.\n");

    // -------------------------------------------------------------------------
    // Cleanup Test Data
    // -------------------------------------------------------------------------
    console.log(">> Cleaning up test fixtures from database...");
    await prisma.nfcTransaction.deleteMany({
      where: {
        OR: [
          { cardUid: { in: [unregUid, blockedUid, activeCardUid, poorCardUid] } },
          { memberId: { in: [memberA.id, memberB.id] } },
        ],
      },
    });
    await prisma.walletTransaction.deleteMany({
      where: { memberId: { in: [memberA.id, memberB.id] } },
    });
    await prisma.loyaltyHistory.deleteMany({
      where: { memberId: { in: [memberA.id, memberB.id] } },
    });
    await prisma.attendance.deleteMany({
      where: { memberId: { in: [memberA.id, memberB.id] } },
    });
    await prisma.ticket.deleteMany({
      where: { bookingId: booking.id },
    });
    await prisma.booking.deleteMany({
      where: { id: booking.id },
    });
    await prisma.memberMembership.deleteMany({
      where: { id: memberMembership.id },
    });
    await prisma.nfcCard.deleteMany({
      where: { cardUid: { in: [blockedUid, activeCardUid, poorCardUid] } },
    });
    await prisma.member.deleteMany({
      where: { id: { in: [memberA.id, memberB.id] } },
    });
    await prisma.membershipPlan.deleteMany({
      where: { id: plan.id },
    });
    await prisma.turfSport.deleteMany({
      where: { turfId: turf.id, sportId: sport.id },
    });
    await prisma.turf.deleteMany({
      where: { id: turf.id },
    });
    await prisma.sport.deleteMany({
      where: { id: sport.id },
    });
    console.log("   Database cleaned successfully.\n");

    console.log("================================================================");
    console.log(`   ALL M2 KIOSK TESTS PASSED: ${passedCount} / ${totalCount}`);
    console.log("================================================================");
  } catch (err) {
    console.error("\n[M2 Test Suite Error]:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runM2Tests();
