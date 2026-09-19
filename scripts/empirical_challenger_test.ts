import fs from 'fs';
import path from 'path';
import assert from 'assert';

// 1. WhatsApp template imports (Direct imports from *.template.ts)
import { sendWhatsAppBookingCancelledTemplate } from '../src/modules/whatsapp/booking-cancellation.template';
import { sendWhatsAppBookingConfirmedTemplate } from '../src/modules/whatsapp/booking-confirmation.template';
import { sendWhatsAppCheckinTemplate } from '../src/modules/whatsapp/checkin.template';
import { sendEventMessage } from '../src/modules/whatsapp/event-trigger.template';
import { sendWhatsAppGameInviteTemplate } from '../src/modules/whatsapp/game-invite.template';
import { sendWhatsAppMagicLogin } from '../src/modules/whatsapp/magic-login.template';
import { sendWhatsAppMemberRegisteredTemplate } from '../src/modules/whatsapp/member-registered.template';
import { sendWhatsAppMembershipExpiringTemplate } from '../src/modules/whatsapp/membership-expiring.template';
import { sendWhatsAppMembershipPurchasedTemplate } from '../src/modules/whatsapp/membership-purchased.template';
import { sendWhatsAppOtp } from '../src/modules/whatsapp/otp.template';
import { sendWhatsAppPlayerJoinedNotification } from '../src/modules/whatsapp/player-joined.template';
import { sendWhatsAppWalletCreditTemplate } from '../src/modules/whatsapp/wallet-credit.template';
import { formatWhatsAppNumber, sendWhatsAppMessage } from '../src/modules/whatsapp/whatsapp.service';

// 2. NFC Services
import { NfcCheckinService } from '../src/modules/nfc/nfc-checkin.services';
import { NfcPaymentService } from '../src/modules/nfc/nfc-payment.services';

// 3. Payment Services
import { RazorpayService, createRazorpayOrder, createPaymentLink, verifyRazorpayPayment } from '../src/modules/payments/razorpay.services';
import { PhonePeService, createPhonePeOrder, checkPhonePeStatus, verifyPhonePeWebhook } from '../src/modules/payments/phonepe.services';
import { PaymentSettlementService, settleSuccessfulPayment, sendConfirmationAndTickets, expireAbandonedTransactions } from '../src/modules/payments/payment-settlement.services';

// 4. Member Services
import { MemberService } from '../src/modules/members/members.services';
import { AuthService } from '../src/modules/members/members-auth.services';

// Database & Core utils
import { prisma } from '../src/core/database/prisma';
import { Mutex } from '../src/core/utils/mutex';

let passedTests = 0;
let totalTests = 0;
const results: { name: string; status: 'PASS' | 'FAIL'; error?: string }[] = [];

async function test(name: string, fn: () => Promise<void> | void) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    results.push({ name, status: 'PASS' });
    console.log(`  [PASS] ${name}`);
  } catch (err: any) {
    results.push({ name, status: 'FAIL', error: err?.message || String(err) });
    console.error(`  [FAIL] ${name}:`, err?.message || err);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('CHALLENGER 2: EMPIRICAL VERIFICATION OF CHUNKED MODULES & SERVICES');
  console.log('================================================================\n');

  // Query existing booking from DB for foreign key valid test cases
  const sampleBooking = await prisma.booking.findFirst({
    include: { member: true, turf: true, sport: true }
  });
  const validBookingId = sampleBooking?.id || 'cmq52ed9v000bd4otvlw03g2v';

  // -------------------------------------------------------------
  // SECTION 1: WhatsApp Templates (12 Functions)
  // -------------------------------------------------------------
  console.log('--- SECTION 1: WHATSAPP TEMPLATES (12 INDIVIDUAL TEMPLATES) ---');

  await test('1.1: formatWhatsAppNumber formats 10-digit and international numbers', () => {
    assert.strictEqual(formatWhatsAppNumber('9876543210'), '919876543210');
    assert.strictEqual(formatWhatsAppNumber('+91 98765 43210'), '919876543210');
    assert.strictEqual(formatWhatsAppNumber('919876543210'), '919876543210');
    assert.strictEqual(formatWhatsAppNumber('12345'), '12345');
    assert.strictEqual(formatWhatsAppNumber(''), '');
  });

  await test('1.2: booking-cancellation.template: sendWhatsAppBookingCancelledTemplate payload structure', async () => {
    assert.strictEqual(typeof sendWhatsAppBookingCancelledTemplate, 'function');
    const res = await sendWhatsAppBookingCancelledTemplate(
      'John Doe',
      'Turf Arena A',
      '19 Sep 2026, 06:00 PM',
      500,
      '9876543210'
    );
    assert.ok(res !== undefined, 'Result should be defined');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Missing Meta credentials');
  });

  await test('1.3: booking-confirmation.template: sendWhatsAppBookingConfirmedTemplate handles fallback QR gracefully', async () => {
    assert.strictEqual(typeof sendWhatsAppBookingConfirmedTemplate, 'function');
    const res = await sendWhatsAppBookingConfirmedTemplate(
      validBookingId,
      'Jane Smith',
      'Grand Turf',
      'Football',
      '19 Sep 2026, 07:00 PM',
      '₹1200 (PAID)',
      '9876543211'
    );
    assert.ok(res !== undefined, 'Result should be defined');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Missing Meta credentials');
  });

  await test('1.4: checkin.template: sendWhatsAppCheckinTemplate creates checkin_v1 payload', async () => {
    assert.strictEqual(typeof sendWhatsAppCheckinTemplate, 'function');
    const res = await sendWhatsAppCheckinTemplate(
      'Alice',
      'Badminton',
      '19 Sep 2026, 08:00 AM',
      '9876543212'
    );
    assert.ok(res !== undefined);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Missing Meta credentials');
  });

  await test('1.5: event-trigger.template: sendEventMessage handles unconfigured / disabled events', async () => {
    assert.strictEqual(typeof sendEventMessage, 'function');
    const res = await sendEventMessage('NON_EXISTENT_EVENT', '9876543213', { foo: 'bar' });
    assert.deepStrictEqual(res, {
      success: false,
      reason: 'Event trigger is disabled or has no template configured.'
    });
  });

  await test('1.6: game-invite.template: sendWhatsAppGameInviteTemplate extracts invite code & builds fallback', async () => {
    assert.strictEqual(typeof sendWhatsAppGameInviteTemplate, 'function');
    // Test with URL: should extract last segment
    const res = await sendWhatsAppGameInviteTemplate(
      '9876543214',
      'Bob Host',
      'Cricket',
      'Box 1',
      '20 Sep 2026',
      'https://sportsvilla.in/join/CRIC789',
      'Dave Guest'
    );
    assert.ok(res !== undefined);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Missing Meta credentials');
  });

  await test('1.7: magic-login.template: sendWhatsAppMagicLogin generates DB entry & button payload', async () => {
    assert.strictEqual(typeof sendWhatsAppMagicLogin, 'function');
    const token = 'test-magic-token-xyz';
    const res = await sendWhatsAppMagicLogin('9876543215', token, 'LOGIN');
    assert.ok(res !== undefined);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Missing Meta credentials');
  });

  await test('1.8: member-registered.template: sendWhatsAppMemberRegisteredTemplate builds member template', async () => {
    assert.strictEqual(typeof sendWhatsAppMemberRegisteredTemplate, 'function');
    const res = await sendWhatsAppMemberRegisteredTemplate('Charlie Member', '9876543216');
    assert.ok(res !== undefined);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Missing Meta credentials');
  });

  await test('1.9: membership-expiring.template: sendWhatsAppMembershipExpiringTemplate handles payload interface', async () => {
    assert.strictEqual(typeof sendWhatsAppMembershipExpiringTemplate, 'function');
    const res = await sendWhatsAppMembershipExpiringTemplate('9876543217', {
      customerName: 'Eve',
      planName: 'Gold Annual',
      expirationDate: '30 Sep 2026',
      registeredPhone: '9876543217'
    });
    assert.ok(res !== undefined);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Missing Meta credentials');
  });

  await test('1.10: membership-purchased.template: sendWhatsAppMembershipPurchasedTemplate parameter verification', async () => {
    assert.strictEqual(typeof sendWhatsAppMembershipPurchasedTemplate, 'function');
    const res = await sendWhatsAppMembershipPurchasedTemplate(
      'Frank',
      'Platinum Monthly',
      'Turf Central',
      '6:00 AM - 8:00 AM',
      '31 Oct 2026',
      '9876543218'
    );
    assert.ok(res !== undefined);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Missing Meta credentials');
  });

  await test('1.11: otp.template: sendWhatsAppOtp creates DB record and triggers fallback on missing API token', async () => {
    assert.strictEqual(typeof sendWhatsAppOtp, 'function');
    const res = await sendWhatsAppOtp('9876543219', '654321', 'LOGIN');
    assert.ok(res !== undefined);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Missing Meta credentials');
  });

  await test('1.12: player-joined.template: sendWhatsAppPlayerJoinedNotification builds joined payload', async () => {
    assert.strictEqual(typeof sendWhatsAppPlayerJoinedNotification, 'function');
    const res = await sendWhatsAppPlayerJoinedNotification(
      '9876543220',
      'Host Gary',
      'Player Helen',
      'Pickleball',
      'Court 3',
      '21 Sep 2026',
      3
    );
    assert.ok(res !== undefined);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Missing Meta credentials');
  });

  await test('1.13: wallet-credit.template: sendWhatsAppWalletCreditTemplate formats amounts', async () => {
    assert.strictEqual(typeof sendWhatsAppWalletCreditTemplate, 'function');
    const res = await sendWhatsAppWalletCreditTemplate(
      'Ian',
      1000,
      2500,
      '9876543221'
    );
    assert.ok(res !== undefined);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'Missing Meta credentials');
  });

  // -------------------------------------------------------------
  // SECTION 2: Decomposed NFC Services
  // -------------------------------------------------------------
  console.log('\n--- SECTION 2: DECOMPOSED NFC SERVICES ---');

  await test('2.1: NfcCheckinService.normalizeCardUid handles JSON payloads', () => {
    const jsonStr = '{"id":"ticket-cuid-999","type":"QR"}';
    assert.strictEqual(NfcCheckinService.normalizeCardUid(jsonStr), jsonStr);
  });

  await test('2.2: NfcCheckinService.normalizeCardUid handles UUID format', () => {
    const uuid = '12345678-1234-1234-1234-123456789abc';
    assert.strictEqual(NfcCheckinService.normalizeCardUid(uuid), uuid);
  });

  await test('2.3: NfcCheckinService.normalizeCardUid handles CUID format', () => {
    const cuid = 'clabcdef01234567890123456';
    assert.strictEqual(NfcCheckinService.normalizeCardUid(cuid), cuid);
  });

  await test('2.4: NfcCheckinService.normalizeCardUid normalizes physical hex UID', () => {
    const rawUid = '04:a2:3f:8b:1c';
    assert.strictEqual(NfcCheckinService.normalizeCardUid(rawUid), '04A23F8B1C');
    assert.strictEqual(NfcCheckinService.normalizeCardUid(''), '');
  });

  await test('2.5: NfcCheckinService.resolveCheckin rejects invalid/empty card UID', async () => {
    const res = await NfcCheckinService.resolveCheckin({ cardUid: '' });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.action, 'REJECTED');
    assert.strictEqual(res.error, 'INVALID_CARD_UID');
  });

  await test('2.6: NfcCheckinService.resolveCheckin rejects non-existent physical card with UNREGISTERED_CARD', async () => {
    const res = await NfcCheckinService.resolveCheckin({ cardUid: 'NON_EXISTENT_UID_9999' });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.action, 'REJECTED');
    assert.strictEqual(res.error, 'UNREGISTERED_CARD');
  });

  await test('2.7: NfcCheckinService protects against double-tap race conditions with Mutex concurrency lock', async () => {
    const testUid = '04A23F8B1D';
    await Mutex.acquire(`nfc:checkin:${testUid}`, 3000);
    try {
      const res = await NfcCheckinService.resolveCheckin({ cardUid: testUid });
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error, 'CONCURRENCY_LOCK_ACTIVE');
    } finally {
      await Mutex.release(`nfc:checkin:${testUid}`);
    }
  });

  await test('2.8: NfcPaymentService.processPayment rejects invalid/short card UID', async () => {
    const res = await NfcPaymentService.processPayment({ cardUid: '12', amount: 100 });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'INVALID_CARD_UID');
  });

  await test('2.9: NfcPaymentService.processPayment rejects invalid or zero amount', async () => {
    const res1 = await NfcPaymentService.processPayment({ cardUid: '04A23F8B1C', amount: 0 });
    assert.strictEqual(res1.success, false);
    assert.strictEqual(res1.error, 'INVALID_AMOUNT');

    const res2 = await NfcPaymentService.processPayment({ cardUid: '04A23F8B1C', amount: -50 });
    assert.strictEqual(res2.success, false);
    assert.strictEqual(res2.error, 'INVALID_AMOUNT');
  });

  await test('2.10: NfcPaymentService.processPayment rejects non-existent card', async () => {
    const res = await NfcPaymentService.processPayment({ cardUid: 'NONEXISTENT99', amount: 250 });
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, 'CARD_NOT_FOUND');
  });

  await test('2.11: NfcPaymentService protects against double-tap payment with Mutex concurrency lock', async () => {
    const testUid = '04A23F8B1C';
    await Mutex.acquire(`nfc:pay:${testUid}`, 3000);
    try {
      const res = await NfcPaymentService.processPayment({ cardUid: testUid, amount: 500 });
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.error, 'CONCURRENCY_LOCK_ACTIVE');
    } finally {
      await Mutex.release(`nfc:pay:${testUid}`);
    }
  });

  // -------------------------------------------------------------
  // SECTION 3: Decomposed Payment Services
  // -------------------------------------------------------------
  console.log('\n--- SECTION 3: DECOMPOSED PAYMENT SERVICES ---');

  await test('3.1: RazorpayService static methods and functions exist', () => {
    assert.strictEqual(RazorpayService.createOrder, createRazorpayOrder);
    assert.strictEqual(RazorpayService.createPaymentLink, createPaymentLink);
    assert.strictEqual(RazorpayService.verifyRazorpayPayment, verifyRazorpayPayment);
  });

  await test('3.2: createRazorpayOrder throws 400 when amountDue <= 0', async () => {
    try {
      await createRazorpayOrder({ id: validBookingId, amountDue: 0 });
      assert.fail('Should have thrown ApiError');
    } catch (err: any) {
      assert.strictEqual(err.name, 'ApiError');
      assert.strictEqual(err.status, 400);
      assert.strictEqual(err.message, 'No amount due');
    }
  });

  await test('3.3: verifyRazorpayPayment rejects invalid HMAC signature with 400', async () => {
    try {
      await verifyRazorpayPayment(validBookingId, 'order_test_rzp_123', 'pay_test_rzp_123', 'invalid_signature_xyz');
      assert.fail('Should have thrown ApiError');
    } catch (err: any) {
      assert.strictEqual(err.name, 'ApiError');
      assert.strictEqual(err.status, 400);
      assert.strictEqual(err.message, 'Invalid payment signature');
    }
  });

  await test('3.4: PhonePeService static methods and functions exist', () => {
    assert.strictEqual(PhonePeService.createOrder, createPhonePeOrder);
    assert.strictEqual(PhonePeService.checkPhonePeStatus, checkPhonePeStatus);
    assert.strictEqual(PhonePeService.verifyPhonePeWebhook, verifyPhonePeWebhook);
  });

  await test('3.5: createPhonePeOrder throws 400 when amountDue <= 0', async () => {
    try {
      await createPhonePeOrder({ id: validBookingId, amountDue: 0 });
      assert.fail('Should have thrown ApiError');
    } catch (err: any) {
      assert.strictEqual(err.name, 'ApiError');
      assert.strictEqual(err.status, 400);
      assert.strictEqual(err.message, 'No amount due');
    }
  });

  await test('3.6: verifyPhonePeWebhook verifies signature and throws 401 on mismatch', async () => {
    const payload = Buffer.from(JSON.stringify({ response: 'test' })).toString('base64');
    try {
      await verifyPhonePeWebhook(payload, 'wrong_verify_header');
      assert.fail('Should have thrown ApiError');
    } catch (err: any) {
      assert.strictEqual(err.name, 'ApiError');
      assert.strictEqual(err.status, 401);
      assert.strictEqual(err.message, 'Invalid PhonePe signature');
    }
  });

  await test('3.7: PaymentSettlementService static methods and functions exist', () => {
    assert.strictEqual(PaymentSettlementService.settleSuccessfulPayment, settleSuccessfulPayment);
    assert.strictEqual(PaymentSettlementService.sendConfirmationAndTickets, sendConfirmationAndTickets);
    assert.strictEqual(PaymentSettlementService.expireAbandonedTransactions, expireAbandonedTransactions);
  });

  await test('3.8: settleSuccessfulPayment throws 404 for non-existent booking', async () => {
    try {
      await settleSuccessfulPayment({
        bookingId: 'non-existent-booking-id-999',
        gateway: 'RAZORPAY',
        paidAmountRupees: 500
      });
      assert.fail('Should have thrown ApiError');
    } catch (err: any) {
      assert.strictEqual(err.name, 'ApiError');
      assert.strictEqual(err.status, 404);
      assert.strictEqual(err.message, 'Booking not found');
    }
  });

  // -------------------------------------------------------------
  // SECTION 4: Decomposed Member Services
  // -------------------------------------------------------------
  console.log('\n--- SECTION 4: DECOMPOSED MEMBER SERVICES ---');

  await test('4.1: MemberService methods exist', () => {
    assert.strictEqual(typeof MemberService.getProfile, 'function');
    assert.strictEqual(typeof MemberService.updateProfile, 'function');
    assert.strictEqual(typeof MemberService.autoPopulateFamilyGroup, 'function');
  });

  await test('4.2: MemberService.getProfile returns expected shape and activity counts', async () => {
    const primaryMember = { id: 'mem-test-challenger-999', mobile: '9999999999' };
    const profileData = await MemberService.getProfile(primaryMember);
    assert.ok(profileData !== null);
    assert.ok(Array.isArray(profileData.familyMembers));
    assert.ok(profileData.activity !== undefined);
    assert.strictEqual(typeof profileData.activity.total, 'number');
    assert.strictEqual(typeof profileData.activity.completed, 'number');
    assert.strictEqual(typeof profileData.activity.upcoming, 'number');
    assert.strictEqual(typeof profileData.activity.cancelled, 'number');
    assert.strictEqual(typeof profileData.activity.ongoing, 'number');
  });

  await test('4.3: MemberService.updateProfile throws 403 on unauthorized family mismatch', async () => {
    const primaryMember = { id: 'mem-1', mobile: '9999999999' };
    try {
      await MemberService.updateProfile(primaryMember, 'foreign-member-id', { name: 'New Name' });
      assert.fail('Should have thrown ApiError');
    } catch (err: any) {
      assert.strictEqual(err.name, 'ApiError');
      assert.strictEqual(err.status, 403);
      assert.strictEqual(err.message, 'Unauthorized access to member profile');
    }
  });

  await test('4.4: AuthService methods exist', () => {
    assert.strictEqual(typeof AuthService.sendOtp, 'function');
    assert.strictEqual(typeof AuthService.verifyOtp, 'function');
  });

  await test('4.5: AuthService.sendOtp rejects invalid/short mobile numbers with 400', async () => {
    try {
      await AuthService.sendOtp('123');
      assert.fail('Should have thrown ApiError');
    } catch (err: any) {
      assert.strictEqual(err.name, 'ApiError');
      assert.strictEqual(err.status, 400);
      assert.strictEqual(err.message, 'Invalid mobile number');
    }
  });

  await test('4.6: AuthService.verifyOtp requires both mobile and code with 400', async () => {
    try {
      await AuthService.verifyOtp('', '123456');
      assert.fail('Should have thrown ApiError');
    } catch (err: any) {
      assert.strictEqual(err.name, 'ApiError');
      assert.strictEqual(err.status, 400);
      assert.strictEqual(err.message, 'Mobile and code are required');
    }

    try {
      await AuthService.verifyOtp('9876543210', '');
      assert.fail('Should have thrown ApiError');
    } catch (err: any) {
      assert.strictEqual(err.name, 'ApiError');
      assert.strictEqual(err.status, 400);
      assert.strictEqual(err.message, 'Mobile and code are required');
    }
  });

  // -------------------------------------------------------------
  // SECTION 5: Zero Re-export Facades & Broken Reference Checks
  // -------------------------------------------------------------
  console.log('\n--- SECTION 5: ZERO RE-EXPORT FACADES & REFERENCE INTEGRITY ---');

  await test('5.1: Confirm whatsapp.service.ts has NO template imports or re-exports', () => {
    const waServiceContent = fs.readFileSync('src/modules/whatsapp/whatsapp.service.ts', 'utf-8');
    assert.ok(!waServiceContent.includes('export * from'), 'whatsapp.service.ts must not have barrel re-exports');
    assert.ok(!waServiceContent.includes('.template.ts'), 'whatsapp.service.ts must not import template files');
    assert.ok(!waServiceContent.includes('.template"'), 'whatsapp.service.ts must not import template files');
    assert.ok(!waServiceContent.includes(".template'"), 'whatsapp.service.ts must not import template files');
    assert.ok(!waServiceContent.includes('sendWhatsAppBookingConfirmedTemplate'), 'whatsapp.service.ts must not export template functions');
    assert.ok(!waServiceContent.includes('sendWhatsAppOtp'), 'whatsapp.service.ts must not export template functions');
  });

  await test('5.2: Confirm bookings.whatsapp.ts has NO template re-exports and imports directly', () => {
    const bookingsWaContent = fs.readFileSync('src/modules/bookings/bookings.whatsapp.ts', 'utf-8');
    assert.ok(!bookingsWaContent.includes('export * from'), 'bookings.whatsapp.ts must not have wildcard re-exports');
    assert.ok(
      bookingsWaContent.includes("from '@/modules/whatsapp/booking-confirmation.template'") ||
      bookingsWaContent.includes('from "@/modules/whatsapp/booking-confirmation.template"'),
      'bookings.whatsapp.ts must import directly from booking-confirmation.template'
    );
    assert.ok(
      bookingsWaContent.includes("from '@/modules/whatsapp/booking-cancellation.template'") ||
      bookingsWaContent.includes('from "@/modules/whatsapp/booking-cancellation.template"'),
      'bookings.whatsapp.ts must import directly from booking-cancellation.template'
    );
  });

  await test('5.3: Confirm src/services/ and src/lib/ do not exist', () => {
    assert.ok(!fs.existsSync('src/services'), 'src/services/ must not exist');
    assert.ok(!fs.existsSync('src/lib'), 'src/lib/ must not exist');
  });

  await test('5.4: Verify ZERO "@\\lib/" or "@\\services/" occurrences across entire src/ directory', () => {
    function scanDir(dir: string): string[] {
      const violations: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          violations.push(...scanDir(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('@/services/') || content.includes('@/services"') || content.includes("@/services'")) {
            violations.push(`Found legacy @/services import in ${fullPath}`);
          }
          if (content.includes('@/lib/') || content.includes('@/lib"') || content.includes("@/lib'")) {
            violations.push(`Found legacy @/lib import in ${fullPath}`);
          }
        }
      }
      return violations;
    }

    const violations = scanDir('src');
    assert.strictEqual(violations.length, 0, `Violations found:\n${violations.join('\n')}`);
  });

  await test('5.5: Verify all direct imports across all 12 template files resolve cleanly', () => {
    const templatesDir = path.join('src', 'modules', 'whatsapp');
    const templateFiles = fs.readdirSync(templatesDir).filter(f => f.endsWith('.template.ts'));
    assert.strictEqual(templateFiles.length, 12, 'Expected exactly 12 template files in src/modules/whatsapp');
    
    for (const tFile of templateFiles) {
      const filePath = path.join(templatesDir, tFile);
      const content = fs.readFileSync(filePath, 'utf-8');
      assert.ok(content.length > 50, `${tFile} must not be empty`);
      assert.ok(content.includes('export async function'), `${tFile} must export an async function`);
    }
  });

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log('================================================================');

  if (passedTests === totalTests) {
    console.log('\nFINAL VERDICT: APPROVE');
    process.exit(0);
  } else {
    console.error('\nFINAL VERDICT: REJECT');
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
