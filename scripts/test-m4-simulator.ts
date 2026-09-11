/**
 * Comprehensive Verification Test Suite for Milestone 4 (M4: Simulated Hardware Testing Panel)
 * 
 * Verifies:
 * 1. Synthetic Keyboard Wedge Keystroke Emitter (<15ms inter-key bursts) ending in Enter
 * 2. CustomEvent Simulation Bus ('nfc:tap' and 'nfc-card-tap') with deviceType: 'SIMULATOR'
 * 3. End-to-end Kiosk Check-in triggered by Simulator (Ticket marked CHECKED_IN, NfcTransaction logged)
 * 4. End-to-end Payment Flow triggered by Simulator (Wallet deduction, ledger, deviceType: 'SIMULATOR')
 * 5. All 6 Simulation Presets coverage & Mock UID generator format
 * 6. Audit Trail integrity for Simulated Rejections (Blocked & Unregistered cards)
 */

import { prisma } from "../src/lib/prisma";
import { NfcCheckinService } from "../src/services/NfcCheckinService";
import { NfcPaymentService } from "../src/services/NfcPaymentService";
import {
  generateRandomHexUid,
  simulateCustomEventTap,
  simulateKeyboardWedgeKeystrokes,
  DEFAULT_PRESET_CARDS,
} from "../src/lib/nfcSimulator";
import { normalizeCardUid } from "../src/hooks/useNfcReader";
import { randomUUID } from "crypto";

async function runM4SimulatorTests() {
  console.log("================================================================");
  console.log("   SPORTSVILLA MILESTONE 4: HARDWARE SIMULATOR TEST SUITE");
  console.log("================================================================\n");

  const TEST_ID = randomUUID().slice(0, 8).toUpperCase();
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

  // Database fixture IDs for teardown
  let testMemberAId: string | null = null;
  let testMemberBId: string | null = null;
  let testSportId: string | null = null;
  let testTurfId: string | null = null;
  let testBookingId: string | null = null;
  let testTicketId: string | null = null;

  const validCardUid = `SIMVAL${TEST_ID}`;
  const blockedCardUid = `SIMBLK${TEST_ID}`;
  const unregCardUid = `SIMUNR${TEST_ID}`;

  try {
    // -------------------------------------------------------------------------
    // 1. Test Synthetic Keyboard Wedge Keystroke Emitter & Buffer Capture
    // -------------------------------------------------------------------------
    console.log(">> 1. Testing Synthetic Keyboard Wedge Keystroke Emitter & Buffer...");

    const wedgeTestUid = "04A1B2C3";
    const eventLog: { key: string; time: number }[] = [];

    // Setup an EventTarget with keyboard wedge buffer detection logic matching useNfcReader.ts
    const mockWindow = new EventTarget();
    let capturedUid: string | null = null;
    let capturedDevice: string | null = null;

    const buffer: string[] = [];
    const timestamps: number[] = [];

    mockWindow.addEventListener("keydown", (e: any) => {
      const now = Date.now();
      const key = e.key;
      eventLog.push({ key, time: now });

      if (key === "Enter") {
        if (buffer.length >= 4) {
          let isBurst = true;
          for (let i = 1; i < timestamps.length; i++) {
            if (timestamps[i] - timestamps[i - 1] > 65) {
              isBurst = false;
              break;
            }
          }
          if (isBurst) {
            capturedUid = normalizeCardUid(buffer.join(""));
            capturedDevice = "KEYBOARD_WEDGE";
          }
        }
        buffer.length = 0;
        timestamps.length = 0;
        return;
      }

      if (key.length === 1) {
        buffer.push(key);
        timestamps.push(now);
      }
    });

    // Run keyboard wedge simulation with 5ms delay per keystroke
    const wedgeResult = await simulateKeyboardWedgeKeystrokes(wedgeTestUid, mockWindow, 5);

    assert(wedgeResult.success === true, "Wedge simulation returned success: true");
    assert(wedgeResult.cardUid === wedgeTestUid, "Wedge simulation returned normalized cardUid");
    assert(wedgeResult.charCount === wedgeTestUid.length + 1, "Emitted all characters + Enter terminator");
    assert(capturedUid === wedgeTestUid, "Keyboard wedge buffer captured full UID correctly");
    assert(capturedDevice === "KEYBOARD_WEDGE", "Captured device type is KEYBOARD_WEDGE");

    // Verify inter-character delays were rapid (<15ms per character)
    let maxDelta = 0;
    for (let i = 1; i < eventLog.length; i++) {
      const delta = eventLog[i].time - eventLog[i - 1].time;
      if (delta > maxDelta) maxDelta = delta;
    }
    assert(maxDelta <= 20, `Keystroke intervals within burst threshold (max delta: ${maxDelta}ms)`);
    console.log("   Keyboard Wedge simulation verified.\n");

    // -------------------------------------------------------------------------
    // 2. Test CustomEvent Simulation Bus ('nfc:tap' & 'nfc-card-tap')
    // -------------------------------------------------------------------------
    console.log(">> 2. Testing CustomEvent Tap Bus & Random Hex Generator...");

    const eventTracker = {
      tapReceived: false,
      cardTapReceived: false,
    };
    let receivedDetail: any = null;

    const busTarget = new EventTarget();
    busTarget.addEventListener("nfc:tap", (e: any) => {
      eventTracker.tapReceived = true;
      receivedDetail = e.detail;
    });
    busTarget.addEventListener("nfc-card-tap", () => {
      eventTracker.cardTapReceived = true;
    });

    const tapResult = simulateCustomEventTap("04:d4:e5:f6", busTarget, "SIMULATOR");

    assert(tapResult.success === true, "CustomEvent tap simulation succeeded");
    assert(tapResult.cardUid === "04D4E5F6", "Card UID was properly normalized to uppercase hex");
    assert(eventTracker.tapReceived === true, "'nfc:tap' CustomEvent was caught by listener");
    assert(eventTracker.cardTapReceived === true, "'nfc-card-tap' CustomEvent was caught by listener");
    assert(receivedDetail?.cardUid === "04D4E5F6", "Event detail contains correct cardUid");
    assert(receivedDetail?.deviceType === "SIMULATOR", "Event detail deviceType is 'SIMULATOR'");

    // Test Random Hex UID Generator
    const randomUid1 = generateRandomHexUid(8);
    const randomUid2 = generateRandomHexUid(8);
    assert(randomUid1.length === 8, "Random UID generates 8-character hex string");
    assert(/^04[0-9A-F]{6}$/.test(randomUid1), "Random UID follows Mifare 04 prefix hex pattern");
    assert(randomUid1 !== randomUid2, "Subsequent random UIDs are distinct");
    console.log("   CustomEvent bus and UID generator verified.\n");

    // -------------------------------------------------------------------------
    // 3. Test End-to-End Kiosk Check-in with deviceType: 'SIMULATOR'
    // -------------------------------------------------------------------------
    console.log(">> 3. Testing Simulated Kiosk Check-in (Active Booking & Ticket Update)...");

    // Create Member A
    const memberA = await prisma.member.create({
      data: {
        name: `Sim Member A ${TEST_ID}`,
        mobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
        walletBalance: 150000, // ₹1,500.00
      },
    });
    testMemberAId = memberA.id;

    // Create active card linked to member A
    await prisma.nfcCard.create({
      data: {
        cardUid: validCardUid,
        memberId: memberA.id,
        status: "ACTIVE",
        notes: "M4 test active card",
      },
    });

    // Create Sport & Turf
    let sport = await prisma.sport.findFirst();
    if (!sport) {
      sport = await prisma.sport.create({
        data: { name: `Sport_${TEST_ID}`, rewardPointsPerCheckin: 10 },
      });
      testSportId = sport.id;
    }

    const turf = await prisma.turf.create({
      data: {
        name: `Turf_${TEST_ID}`,
        bookingPrice: 600,
        bookingDurationMinutes: 60,
      },
    });
    testTurfId = turf.id;

    // Create confirmed booking for today
    const now = new Date();
    const startTime = new Date(now.getTime() - 10 * 60 * 1000);
    const endTime = new Date(now.getTime() + 50 * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        memberId: memberA.id,
        sportId: sport.id,
        turfId: turf.id,
        startTime,
        endTime,
        price: 600,
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
    });
    testBookingId = booking.id;

    // Create valid ticket
    const ticket = await prisma.ticket.create({
      data: {
        bookingId: booking.id,
        qrCode: `TKT_SIM_${TEST_ID}`,
        status: "VALID",
      },
    });
    testTicketId = ticket.id;

    // Trigger check-in with deviceType = 'SIMULATOR'
    const checkinResponse = await NfcCheckinService.resolveCheckin({
      cardUid: validCardUid,
      deviceType: "SIMULATOR",
      location: "DEV_SIMULATOR_PANEL",
    });

    assert(checkinResponse.success === true, "Simulated check-in returns success: true");
    assert(checkinResponse.action === "BOOKING_CHECKIN", "Action resolved as BOOKING_CHECKIN");
    assert(checkinResponse.details?.ticketId === ticket.id, "Ticket ID matches test booking ticket");

    // Verify database state: Ticket must be marked CHECKED_IN
    const updatedTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    assert(updatedTicket?.status === "CHECKED_IN", "Ticket status transitioned to CHECKED_IN");
    assert(!!updatedTicket?.usedAt, "Ticket usedAt timestamp was recorded");

    // Verify NfcTransaction audit record
    const checkinTx = await prisma.nfcTransaction.findFirst({
      where: {
        cardUid: validCardUid,
        bookingId: booking.id,
        type: "CHECKIN",
      },
    });
    assert(!!checkinTx, "NfcTransaction was logged in database");
    assert(checkinTx?.status === "SUCCESS", "Transaction status is SUCCESS");
    assert(checkinTx?.deviceType === "SIMULATOR", "Audit record captures deviceType: 'SIMULATOR'");
    console.log("   Simulated Kiosk Check-in verified.\n");

    // -------------------------------------------------------------------------
    // 4. Test End-to-End Payment Flow with deviceType: 'SIMULATOR'
    // -------------------------------------------------------------------------
    console.log(">> 4. Testing Simulated Payment & Wallet Deduction...");

    // Member A started with ₹1,500.00 (150,000 paise).
    // Simulate ₹75.00 payment
    const paymentAmountRupees = 75;
    const paymentResponse = await NfcPaymentService.processPayment({
      cardUid: validCardUid,
      amount: paymentAmountRupees,
      deviceType: "SIMULATOR",
      description: "Simulator QA Payment",
    });

    assert(paymentResponse.success === true, "Simulated payment returns success: true");
    assert(paymentResponse.deductedAmount === 75, "Deducted amount is ₹75.00");
    assert(paymentResponse.remainingBalance === 1425, "Remaining balance is ₹1,425.00");

    // Verify Member wallet balance in database (142,500 paise)
    const updatedMemberA = await prisma.member.findUnique({ where: { id: memberA.id } });
    assert(updatedMemberA?.walletBalance === 142500, "Database walletBalance decremented to 142,500 paise");

    // Verify WalletTransaction ledger record
    const walletDebit = await prisma.walletTransaction.findFirst({
      where: { memberId: memberA.id, type: "DEBIT" },
      orderBy: { createdAt: "desc" },
    });
    assert(!!walletDebit, "WalletTransaction DEBIT record logged");
    assert(walletDebit?.amount === 7500, "WalletTransaction amount is 7,500 paise (₹75.00)");

    // Verify NfcTransaction audit record with deviceType: 'SIMULATOR'
    const paymentTx = await prisma.nfcTransaction.findUnique({
      where: { id: paymentResponse.transactionId },
    });
    assert(!!paymentTx, "Payment NfcTransaction logged in database");
    assert(paymentTx?.status === "SUCCESS", "Transaction status is SUCCESS");
    assert(paymentTx?.type === "PAYMENT", "Transaction type is PAYMENT");
    assert(paymentTx?.amount === 75, "Transaction amount is ₹75.00");
    assert(paymentTx?.deviceType === "SIMULATOR", "Transaction captures deviceType: 'SIMULATOR'");
    console.log("   Simulated Payment verified.\n");

    // -------------------------------------------------------------------------
    // 5. Test Presets Coverage & Categories
    // -------------------------------------------------------------------------
    console.log(">> 5. Testing Simulator Presets Coverage...");

    const expectedCategories = [
      "ACTIVE_BOOKING",
      "ACTIVE_MEMBERSHIP",
      "MEMBER_WALLET",
      "LOW_BALANCE",
      "BLOCKED_CARD",
      "UNREGISTERED_CARD",
    ];

    assert(DEFAULT_PRESET_CARDS.length === 6, "Default presets list contains exactly 6 scenarios");

    expectedCategories.forEach((cat) => {
      const found = DEFAULT_PRESET_CARDS.some((p) => p.category === cat);
      assert(found, `Preset exists for required category: ${cat}`);
    });
    console.log("   Presets coverage verified.\n");

    // -------------------------------------------------------------------------
    // 6. Test Simulated Rejections & Audit Trail
    // -------------------------------------------------------------------------
    console.log(">> 6. Testing Simulated Rejections (Blocked & Unregistered Cards)...");

    // Create Blocked Card
    await prisma.nfcCard.create({
      data: {
        cardUid: blockedCardUid,
        memberId: memberA.id,
        status: "BLOCKED",
        notes: "M4 test blocked card",
      },
    });

    // Test Simulated Payment on Blocked Card
    const blockedPayResult = await NfcPaymentService.processPayment({
      cardUid: blockedCardUid,
      amount: 50,
      deviceType: "SIMULATOR",
    });

    assert(blockedPayResult.success === false, "Simulated payment on blocked card rejected");
    assert(blockedPayResult.code === "CARD_BLOCKED", "Rejection code is CARD_BLOCKED");

    const blockedTx = await prisma.nfcTransaction.findUnique({
      where: { id: blockedPayResult.transactionId },
    });
    assert(blockedTx?.status === "FAILED", "Blocked card logged as FAILED in audit trail");
    assert(blockedTx?.failureReason === "CARD_BLOCKED", "Audit reason is CARD_BLOCKED");
    assert(blockedTx?.deviceType === "SIMULATOR", "Device type logged as 'SIMULATOR'");

    // Test Simulated Check-in on Unregistered Card
    const unregCheckinResult = await NfcCheckinService.resolveCheckin({
      cardUid: unregCardUid,
      deviceType: "SIMULATOR",
      location: "QA_SIMULATOR",
    });

    assert(unregCheckinResult.success === false, "Simulated checkin on unregistered card rejected");
    assert(unregCheckinResult.action === "REJECTED", "Rejection action is REJECTED");
    assert(unregCheckinResult.error === "UNREGISTERED_CARD", "Rejection error is UNREGISTERED_CARD");

    const unregTx = await prisma.nfcTransaction.findFirst({
      where: { cardUid: unregCardUid, failureReason: "UNREGISTERED_CARD" },
    });
    assert(!!unregTx, "Audit log exists for unregistered simulated tap");
    assert(unregTx?.status === "FAILED", "Audit transaction status is FAILED");
    assert(unregTx?.deviceType === "SIMULATOR", "Unregistered tap recorded deviceType: 'SIMULATOR'");
    console.log("   Simulated Rejections verified.\n");

    console.log("================================================================");
    console.log(`   ALL M4 SIMULATOR TESTS PASSED: ${passedCount} / ${totalCount}`);
    console.log("================================================================");
  } catch (err) {
    console.error("\n[M4 Test Suite Error]:", err);
    process.exit(1);
  } finally {
    // Teardown test fixtures
    console.log("\n>> Cleaning up test fixtures from database...");
    try {
      if (testTicketId) {
        await prisma.ticket.deleteMany({ where: { id: testTicketId } });
      }
      if (testBookingId) {
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
          cardUid: { in: [validCardUid, blockedCardUid, unregCardUid] },
        },
      });
      await prisma.nfcCard.deleteMany({
        where: {
          cardUid: { in: [validCardUid, blockedCardUid] },
        },
      });
      if (testMemberAId) {
        await prisma.walletTransaction.deleteMany({ where: { memberId: testMemberAId } });
        await prisma.member.deleteMany({ where: { id: testMemberAId } });
      }
      console.log("   Database cleaned successfully.\n");
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
    } finally {
      await prisma.$disconnect();
    }
  }
}

runM4SimulatorTests();
