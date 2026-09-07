import dotenv from 'dotenv';
dotenv.config();

import Module from 'module';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../src/lib/prisma';
import { whatsappDb } from '../src/lib/whatsappDb';
import { PaymentService } from '../src/services/PaymentService';
import { BookingCleanupService } from '../src/services/BookingCleanupService';

// ============================================================================
// ADVERSARIAL TEST HARNESS FOR MILESTONE 5
// ============================================================================

interface TestRecord {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const testResults: TestRecord[] = [];

function assert(condition: boolean, message: string, details?: any) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}${details ? ' - ' + JSON.stringify(details) : ''}`);
  }
}

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    testResults.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    testResults.push({ name, passed: false, error: err.message, details: err.stack });
    console.error(`  ✗ ${name}`);
    console.error(`      Error: ${err.message}`);
  }
}

// Intercept next-auth so getServerSession can return configured session
let mockSession: any = null;

const originalRequire = (Module.prototype as any).require;
(Module.prototype as any).require = function(modulePath: string) {
  if (modulePath === 'next-auth') {
    return {
      getServerSession: async () => mockSession,
      default: () => {}
    };
  }
  return originalRequire.apply(this, arguments);
};

async function main() {
  console.log('================================================================================');
  console.log('  MILESTONE 5 EMPIRICAL ADVERSARIAL VERIFICATION SUITE');
  console.log('  Testing: SEC-05, SEC-07, SEC-08, SEC-09, PAY-01, PAY-04, PAY-05');
  console.log('================================================================================\n');

  // Load route modules after intercepting next-auth
  const { POST: phonePeRedirectPost } = await import('../src/app/api/client/v1/payments/phonepe-redirect/route');
  const { GET: chatGet, POST: chatPost } = await import('../src/app/api/client/v1/whatsapp/chat/route');
  const { GET: convGet } = await import('../src/app/api/client/v1/whatsapp/conversations/route');
  const { GET: analyticsGet } = await import('../src/app/api/client/v1/whatsapp/analytics/route');
  const { GET: configGet, POST: configPost } = await import('../src/app/api/client/v1/whatsapp/config/route');
  const { POST: testTemplatePost } = await import('../src/app/api/client/v1/whatsapp/test-template/route');
  const { GET: memberContextGet } = await import('../src/app/api/client/v1/whatsapp/member-context/route');
  const { GET: eventsGet, POST: eventsPost } = await import('../src/app/api/client/v1/whatsapp/events/route');
  const { POST: markReadPost } = await import('../src/app/api/client/v1/whatsapp/mark-read/route');
  const { GET: templatesGet } = await import('../src/app/api/client/v1/whatsapp/templates/route');
  const { POST: templateNamePost } = await import('../src/app/api/client/v1/whatsapp/templates/[name]/route');
  const { GET: logsGet } = await import('../src/app/api/client/v1/logs/route');
  const { POST: tournamentRegisterPost } = await import('../src/app/api/client/v1/tournaments/register/route');
  const { POST: joinGamePost } = await import('../src/app/api/client/v1/bookings/[id]/join/route');
  const { POST: bookingCreatePost } = await import('../src/app/api/client/v1/bookings/route');

  const fallbackUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/+$/, '');

  // --------------------------------------------------------------------------
  // SUITE 1: SEC-05 — Open Redirect in PhonePe Callback
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 1: SEC-05 (PhonePe Redirect Whitelist & HTTP 303) ---');

  const adversarialOrigins = [
    { origin: 'https://sportsvilla.co.in.evil.com', expectedAllowed: false, desc: 'Domain suffix spoofing' },
    { origin: 'http://sportsvilla.co.in', expectedAllowed: false, desc: 'Plain HTTP protocol on production domain' },
    { origin: 'javascript:alert(1)', expectedAllowed: false, desc: 'JavaScript URI scheme' },
    { origin: '//evil.com', expectedAllowed: false, desc: 'Protocol-relative URL' },
    { origin: 'data:text/html,<script>alert(1)</script>', expectedAllowed: false, desc: 'Data URI' },
    { origin: 'https://evil-sportsvilla.co.in', expectedAllowed: false, desc: 'Lookalike domain without subdomain dot' },
    { origin: 'https://sportsvilla.co.in@evil.com', expectedAllowed: false, desc: 'Embedded userinfo spoofing' },
    { origin: 'http://localhost.evil.com', expectedAllowed: false, desc: 'Localhost subdomain on evil host' },
    { origin: 'https://evil.com/sportsvilla.co.in', expectedAllowed: false, desc: 'Path-based domain spoofing' },
    { origin: 'https://not-sportsvilla.co.in', expectedAllowed: false, desc: 'Hyphenated domain spoofing' },
    { origin: 'https://beta.sportsvilla.co.in', expectedAllowed: true, desc: 'Official beta subdomain' },
    { origin: 'https://play-beta.sportsvilla.co.in', expectedAllowed: true, desc: 'Official play-beta subdomain' },
    { origin: 'https://play.sportsvilla.co.in', expectedAllowed: true, desc: 'Official play subdomain' },
    { origin: 'https://admin.sportsvilla.co.in', expectedAllowed: true, desc: 'Official admin subdomain' },
    { origin: 'https://sportsvilla.co.in', expectedAllowed: true, desc: 'Official apex domain' },
    { origin: 'https://tournament.sportsvilla.co.in', expectedAllowed: true, desc: 'Dynamic sportsvilla subdomain' },
    { origin: 'https://sportsvilla.co.in:8080', expectedAllowed: true, desc: 'HTTPS with custom port on apex domain' },
    { origin: 'http://localhost:3000', expectedAllowed: true, desc: 'Local development localhost' },
    { origin: 'http://127.0.0.1:3000', expectedAllowed: true, desc: 'Local development 127.0.0.1' },
    { origin: 'ftp://sportsvilla.co.in', expectedAllowed: false, desc: 'FTP protocol on valid apex domain' },
    { origin: 'https://sportsvilla.co.in%00.evil.com', expectedAllowed: false, desc: 'Null-byte URL injection' },
    { origin: 'https://evil.com#sportsvilla.co.in', expectedAllowed: false, desc: 'Fragment spoofing' },
    { origin: '', expectedAllowed: false, desc: 'Empty string origin' },
  ];

  for (const tc of adversarialOrigins) {
    await runTest(`SEC-05: ${tc.desc} (${tc.origin})`, async () => {
      const url = `http://localhost:3000/api/client/v1/payments/phonepe-redirect?bookingId=bk_test&origin=${encodeURIComponent(tc.origin)}`;
      const req = new Request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          transactionId: 'tx_test_01',
          code: 'PAYMENT_ERROR'
        }).toString()
      });

      const res = await phonePeRedirectPost(req);

      // Verify HTTP 303 status code
      assert(res.status === 303, `Expected status 303 See Other, got ${res.status}`);

      const location = res.headers.get('location');
      assert(!!location, 'Expected Location header to be set');

      if (tc.expectedAllowed) {
        // Target location must start with allowed origin
        const expectedOriginClean = new URL(tc.origin).origin;
        assert(
          location!.startsWith(expectedOriginClean),
          `Expected redirect to start with ${expectedOriginClean}, but got ${location}`
        );
      } else {
        // Must fallback to configured fallbackUrl, NOT the adversarial origin
        assert(
          location!.startsWith(fallbackUrl),
          `Expected fallback to ${fallbackUrl}, but got ${location}`
        );
        assert(
          !location!.includes('evil.com') && !location!.includes('javascript:'),
          `Malicious origin leaked in redirect location: ${location}`
        );
      }
    });
  }

  await runTest('SEC-05: Invalid payload missing transactionId returns 303', async () => {
    const req = new Request('http://localhost:3000/api/client/v1/payments/phonepe-redirect?bookingId=bk_test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({}).toString()
    });
    const res = await phonePeRedirectPost(req);
    assert(res.status === 303, `Expected status 303, got ${res.status}`);
    const location = res.headers.get('location');
    assert(location!.includes('error=invalid_payload'), `Expected error=invalid_payload in ${location}`);
  });

  // --------------------------------------------------------------------------
  // SUITE 2: SEC-07 — Protect WhatsApp & Logs Routes with Admin Session Auth
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 2: SEC-07 (Unauthenticated WhatsApp & Logs Routes Protection) ---');

  mockSession = null; // Unauthenticated

  const protectedRoutes = [
    { name: 'GET whatsapp/chat', call: () => chatGet({ url: 'http://localhost/api/client/v1/whatsapp/chat?phoneNumber=9876543210' } as any) },
    { name: 'POST whatsapp/chat', call: () => chatPost(new Request('http://localhost/api/client/v1/whatsapp/chat', { method: 'POST', body: JSON.stringify({}) }) as any) },
    { name: 'GET whatsapp/conversations', call: () => convGet() },
    { name: 'GET whatsapp/analytics', call: () => analyticsGet() },
    { name: 'GET whatsapp/config', call: () => configGet() },
    { name: 'POST whatsapp/config', call: () => configPost(new Request('http://localhost/api/client/v1/whatsapp/config', { method: 'POST', body: JSON.stringify({}) }) as any) },
    { name: 'POST whatsapp/test-template', call: () => testTemplatePost(new Request('http://localhost/api/client/v1/whatsapp/test-template', { method: 'POST', body: JSON.stringify({}) }) as any) },
    { name: 'GET whatsapp/member-context', call: () => memberContextGet({ url: 'http://localhost/api/client/v1/whatsapp/member-context?phone=9876543210' } as any) },
    { name: 'GET whatsapp/events', call: () => eventsGet() },
    { name: 'POST whatsapp/events', call: () => eventsPost(new Request('http://localhost/api/client/v1/whatsapp/events', { method: 'POST', body: JSON.stringify({}) }) as any) },
    { name: 'POST whatsapp/mark-read', call: () => markReadPost(new Request('http://localhost/api/client/v1/whatsapp/mark-read', { method: 'POST', body: JSON.stringify({}) }) as any) },
    { name: 'GET whatsapp/templates', call: () => templatesGet() },
    { name: 'POST whatsapp/templates/[name]', call: () => templateNamePost(new Request('http://localhost/api/client/v1/whatsapp/templates/test', { method: 'POST', body: JSON.stringify({}) }) as any, { params: Promise.resolve({ name: 'test' }) }) },
    { name: 'GET logs', call: () => logsGet() },
  ];

  for (const r of protectedRoutes) {
    await runTest(`SEC-07: Unauthenticated ${r.name} returns HTTP 401`, async () => {
      mockSession = null;
      const res = await r.call();
      assert(res.status === 401, `Expected status 401 Unauthorized for ${r.name}, got ${res.status}`);
      const body = await res.json();
      assert(body.error === 'Unauthorized' || body.success === false, `Expected unauthorized error body, got: ${JSON.stringify(body)}`);
    });

    await runTest(`SEC-07: Session without email on ${r.name} returns HTTP 401`, async () => {
      mockSession = { user: {} }; // Invalid session without email
      const res = await r.call();
      assert(res.status === 401, `Expected status 401 Unauthorized for session without email, got ${res.status}`);
    });
  }

  // --------------------------------------------------------------------------
  // SUITE 3: SEC-08 — Tournament Registration Fraud via aiVerified Flag
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 3: SEC-08 (Tournament Registration aiVerified Ignored) ---');

  const jwtSecret = process.env.NEXTAUTH_SECRET || 'hJfrTEQX5WUzdXs6vZIWRO+IzAlIkJ22h94Ulqj3Kpk=';

  // Seed test tournament and member
  const testTournamentId = `tourn_sec08_${Date.now()}`;
  const testMemberId = `mem_sec08_${Date.now()}`;

  await prisma.member.create({
    data: {
      id: testMemberId,
      name: 'Adversarial Tester',
      mobile: `999${Math.floor(1000000 + Math.random() * 9000000)}`,
      walletBalance: 0
    }
  });

  await prisma.tournament.create({
    data: {
      id: testTournamentId,
      name: 'Security Open Cup',
      status: 'UPCOMING',
      participationFee: 1000,
      teamSize: 2,
      maxTeams: 16,
      startDate: new Date(Date.now() + 86400000)
    }
  });

  const memberAuthToken = jwt.sign({ memberId: testMemberId, uid: '9999999999' }, jwtSecret);

  await runTest('SEC-08: Request with client-supplied aiVerified: true creates PENDING registration', async () => {
    const maliciousPayload = {
      tournamentId: testTournamentId,
      teamName: 'ExploitSquad',
      aiVerified: true, // Attacker attempting bypass
      status: 'VERIFIED', // Attacker attempting status overwrite
      paymentMethod: 'UPI',
      paymentUtr: `UTR_${Date.now()}`,
      players: [
        { name: 'Attacker Alpha', mobile: '9991112233' },
        { name: 'Attacker Beta', mobile: '9991112234' }
      ]
    };

    const req = new Request('http://localhost:3000/api/client/v1/tournaments/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberAuthToken}`
      },
      body: JSON.stringify(maliciousPayload)
    });

    const res = await tournamentRegisterPost(req);
    assert(res.status === 200, `Expected 200 OK from registration API, got ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Registration was not successful');
    assert(data.registration.status === 'PENDING', `Registration status must be PENDING, got: ${data.registration.status}`);

    // Verify directly in database
    const dbRecord = await prisma.tournamentRegistration.findUnique({
      where: { id: data.registration.id }
    });
    assert(!!dbRecord, 'Registration record not found in database');
    assert(dbRecord!.status === 'PENDING', `Database record status must be PENDING, got ${dbRecord!.status}`);
  });

  await runTest('SEC-08: String coercion aiVerified: "true" and status: "VERIFIED" still creates PENDING', async () => {
    const maliciousPayload = {
      tournamentId: testTournamentId,
      teamName: 'CoercionSquad',
      aiVerified: 'true',
      status: 'VERIFIED',
      paymentMethod: 'CASH',
      paymentUtr: `UTR_COERCE_${Date.now()}`,
      players: [
        { name: 'Attacker Gamma', mobile: '9991112255' }
      ]
    };

    const req = new Request('http://localhost:3000/api/client/v1/tournaments/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberAuthToken}`
      },
      body: JSON.stringify(maliciousPayload)
    });

    const res = await tournamentRegisterPost(req);
    // User already registered in previous test, so either rejected with duplicate team or created as PENDING
    // Let's create a fresh member to test registration status
    const freshMemberId = `mem_sec08_coerce_${Date.now()}`;
    await prisma.member.create({
      data: { id: freshMemberId, name: 'Coerce User', mobile: `996${Math.floor(1000000 + Math.random() * 9000000)}`, walletBalance: 0 }
    });
    const freshToken = jwt.sign({ memberId: freshMemberId, uid: '9999999998' }, jwtSecret);

    const freshReq = new Request('http://localhost:3000/api/client/v1/tournaments/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${freshToken}`
      },
      body: JSON.stringify(maliciousPayload)
    });

    const freshRes = await tournamentRegisterPost(freshReq);
    assert(freshRes.status === 200, `Expected 200 OK, got ${freshRes.status}`);
    const freshData = await freshRes.json();
    assert(freshData.registration.status === 'PENDING', `Status must be PENDING, got ${freshData.registration.status}`);
  });

  // --------------------------------------------------------------------------
  // SUITE 4: SEC-09 — Free Game Joining & Point Farming Rejection
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 4: SEC-09 (Free Game Joining & Point Farming Rejection) ---');

  const sportId = `sport_sec09_${Date.now()}`;
  const turfId = `turf_sec09_${Date.now()}`;
  const hostMemberId = `mem_host_${Date.now()}`;
  const joinerMemberId = `mem_joiner_${Date.now()}`;
  const bookingId = `bk_sec09_${Date.now()}`;

  await prisma.sport.create({
    data: { id: sportId, name: 'Adversarial Tennis' }
  });

  await prisma.turf.create({
    data: { id: turfId, name: 'Court 9', bookingPrice: 800, capacityPerSlot: 2 }
  });

  await prisma.member.create({
    data: { id: hostMemberId, name: 'Game Host', mobile: `998${Math.floor(1000000 + Math.random() * 9000000)}`, walletBalance: 0 }
  });

  await prisma.member.create({
    data: { id: joinerMemberId, name: 'Free Loader', mobile: `997${Math.floor(1000000 + Math.random() * 9000000)}`, walletBalance: 0, loyaltyPoints: 0 }
  });

  // Create a game with price 800, 4 max players => joiner price = 200
  await prisma.booking.create({
    data: {
      id: bookingId,
      turfId,
      sportId,
      memberId: hostMemberId,
      startTime: new Date(Date.now() + 3600000),
      endTime: new Date(Date.now() + 7200000),
      price: 800,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      participantCount: 1,
      visibility: 'OPEN',
      inviteMaxCount: 4,
      advancePaid: 800,
      amountDue: 0
    }
  });

  const joinerToken = jwt.sign({ memberId: joinerMemberId, uid: '9970000000' }, jwtSecret);

  await runTest('SEC-09: Unpaid join request (wallet=0, points=0) returns HTTP 400 PAYMENT_PENDING', async () => {
    const req = new Request(`http://localhost:3000/api/client/v1/bookings/${bookingId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${joinerToken}`
      },
      body: JSON.stringify({
        walletAmountToUse: 0,
        pointsAmountToUse: 0
      })
    });

    const res = (await joinGamePost(req, { params: Promise.resolve({ id: bookingId }) })) as Response;
    assert(res.status === 400, `Expected HTTP 400 for unpaid join, got ${res.status}`);

    const body = await res.json();
    assert(body.status === 'PAYMENT_PENDING', `Expected status PAYMENT_PENDING, got ${body.status}`);
    assert(body.amountDue === 200, `Expected amountDue 200, got ${body.amountDue}`);

    // Verify NO participant was created
    const participant = await prisma.bookingParticipant.findFirst({
      where: { bookingId, memberId: joinerMemberId }
    });
    assert(!participant, 'BookingParticipant record must NOT be created for unpaid join');

    // Verify booking participantCount was not incremented
    const freshBooking = await prisma.booking.findUnique({ where: { id: bookingId } });
    assert(freshBooking!.participantCount === 1, `participantCount should remain 1, got ${freshBooking!.participantCount}`);

    // Verify member loyalty points were not credited
    const freshMember = await prisma.member.findUnique({ where: { id: joinerMemberId } });
    assert(freshMember!.loyaltyPoints === 0, `Member loyalty points should remain 0, got ${freshMember!.loyaltyPoints}`);
  });

  await runTest('SEC-09: Partial wallet join (amountDue > 0) returns HTTP 400 and preserves wallet balance', async () => {
    // Create member with partial wallet balance (50 INR = 5000 paise)
    const partialMemberId = `mem_partial_${Date.now()}`;
    const partialMobile = `996${Math.floor(1000000 + Math.random() * 9000000)}`;
    await prisma.member.create({
      data: { id: partialMemberId, name: 'Partial Payer', mobile: partialMobile, walletBalance: 5000, loyaltyPoints: 0 }
    });
    const partialToken = jwt.sign({ memberId: partialMemberId, uid: partialMobile }, jwtSecret);

    await whatsappDb.whatsAppOtp.create({
      data: {
        phoneNumber: `91${partialMobile}`,
        otp: '887766',
        purpose: 'WALLET_TXN',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    const req = new Request(`http://localhost:3000/api/client/v1/bookings/${bookingId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${partialToken}`
      },
      body: JSON.stringify({
        walletAmountToUse: 50, // Only covers 50 of 200 required
        walletOtp: '887766',
        pointsAmountToUse: 0
      })
    });

    const res = (await joinGamePost(req, { params: Promise.resolve({ id: bookingId }) })) as Response;
    assert(res.status === 400, `Expected HTTP 400, got ${res.status}`);
    const body = await res.json();
    assert(body.status === 'PAYMENT_PENDING', `Expected status PAYMENT_PENDING, got ${body.status}`);
    assert(body.amountDue === 150, `Expected amountDue 150, got ${body.amountDue}`);

    // Verify wallet balance was NOT deducted
    const memberCheck = await prisma.member.findUnique({ where: { id: partialMemberId } });
    assert(memberCheck!.walletBalance === 5000, `Wallet balance should remain 5000 paise, got ${memberCheck!.walletBalance}`);

    // Verify participant was NOT added
    const participant = await prisma.bookingParticipant.findFirst({
      where: { bookingId, memberId: partialMemberId }
    });
    assert(!participant, 'BookingParticipant record must NOT be created');
  });

  await runTest('SEC-09: Negative wallet/points values are clamped and rejected with PAYMENT_PENDING', async () => {
    const req = new Request(`http://localhost:3000/api/client/v1/bookings/${bookingId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${joinerToken}`
      },
      body: JSON.stringify({
        walletAmountToUse: -100,
        pointsAmountToUse: -50
      })
    });

    const res = (await joinGamePost(req, { params: Promise.resolve({ id: bookingId }) })) as Response;
    assert(res.status === 400, `Expected HTTP 400, got ${res.status}`);
    const body = await res.json();
    assert(body.status === 'PAYMENT_PENDING', `Expected status PAYMENT_PENDING, got ${body.status}`);
    assert(body.amountDue === 200, `Expected amountDue 200, got ${body.amountDue}`);
  });

  // --------------------------------------------------------------------------
  // SUITE 5: PAY-01 — Double-Settlement Idempotency & Razorpay Return Status
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 5: PAY-01 (Idempotent Settlement & Razorpay verify returns PAID) ---');

  const payBookingId = `bk_pay01_${Date.now()}`;
  const payOrderId = `order_pay01_${Date.now()}`;
  const payPaymentId = `pay_rzp_${Date.now()}`;
  const rzpSecret = 'test_razorpay_secret_key_123';

  await prisma.setting.upsert({
    where: { key: 'RAZORPAY_KEY_SECRET' },
    update: { value: rzpSecret },
    create: { key: 'RAZORPAY_KEY_SECRET', value: rzpSecret }
  });

  await prisma.booking.create({
    data: {
      id: payBookingId,
      turfId,
      sportId,
      memberId: hostMemberId,
      startTime: new Date(Date.now() + 10000000),
      endTime: new Date(Date.now() + 13600000),
      price: 1200,
      paymentStatus: 'PAID', // Already paid
      status: 'CONFIRMED',
      advancePaid: 1200,
      amountDue: 0
    }
  });

  // Create a pending transaction simulating concurrent webhook/browser race
  await prisma.transaction.create({
    data: {
      id: `tx_conc_${Date.now()}`,
      bookingId: payBookingId,
      memberId: hostMemberId,
      gateway: 'RAZORPAY',
      gatewayOrderId: payOrderId,
      amount: 1200,
      status: 'PENDING'
    }
  });

  await runTest('PAY-01: settleSuccessfulPayment on already PAID booking is idempotent', async () => {
    const settleResult = await PaymentService.settleSuccessfulPayment({
      bookingId: payBookingId,
      gateway: 'RAZORPAY',
      gatewayOrderId: payOrderId,
      gatewayPaymentId: payPaymentId,
      paidAmountRupees: 1200
    });

    assert(settleResult.success === true, 'Expected settleResult.success to be true');
    assert(settleResult.status === 'ALREADY_PAID', `Expected status ALREADY_PAID, got ${settleResult.status}`);

    // Verify PENDING transaction was resolved to SUCCESS (not left stranded)
    const resolvedTx = await prisma.transaction.findFirst({
      where: { gatewayOrderId: payOrderId }
    });
    assert(resolvedTx!.status === 'SUCCESS', `Expected transaction status SUCCESS, got ${resolvedTx!.status}`);
    assert(resolvedTx!.metadata!.includes('Settled via concurrent request (idempotent)'), 'Expected note in metadata');

    // Verify advancePaid was NOT doubled
    const bookingCheck = await prisma.booking.findUnique({ where: { id: payBookingId } });
    assert(bookingCheck!.advancePaid === 1200, `advancePaid should remain 1200, got ${bookingCheck!.advancePaid}`);
  });

  await runTest('PAY-01: verifyRazorpayPayment returns { success: true, status: "PAID" } when already settled', async () => {
    const body = payOrderId + "|" + payPaymentId;
    const signature = crypto.createHmac('sha256', rzpSecret).update(body).digest('hex');

    const verifyResult = await PaymentService.verifyRazorpayPayment(
      payBookingId,
      payOrderId,
      payPaymentId,
      signature
    );

    assert(verifyResult.success === true, 'Expected verifyResult.success === true');
    assert(verifyResult.status === 'PAID', `Expected normalized status PAID, got ${verifyResult.status}`);
  });

  await runTest('PAY-01: Concurrent race stress: 5 parallel settlement calls do NOT duplicate payments', async () => {
    const stressBookingId = `bk_stress_${Date.now()}`;
    await prisma.booking.create({
      data: {
        id: stressBookingId,
        turfId,
        sportId,
        memberId: hostMemberId,
        startTime: new Date(Date.now() + 20000000),
        endTime: new Date(Date.now() + 23600000),
        price: 1500,
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        advancePaid: 1500,
        amountDue: 0
      }
    });

    const calls = Array.from({ length: 5 }, (_, i) =>
      PaymentService.settleSuccessfulPayment({
        bookingId: stressBookingId,
        gateway: 'RAZORPAY',
        gatewayOrderId: `order_stress_${i}`,
        gatewayPaymentId: `pay_stress_${i}`,
        paidAmountRupees: 1500
      })
    );

    const results = await Promise.all(calls);
    for (const r of results) {
      assert(r.success === true, 'All concurrent settlements must succeed');
      assert(r.status === 'ALREADY_PAID', 'Must return ALREADY_PAID for idempotent branch');
    }

    const bookingFinal = await prisma.booking.findUnique({ where: { id: stressBookingId } });
    assert(bookingFinal!.advancePaid === 1500, `advancePaid must not multiply, got ${bookingFinal!.advancePaid}`);
  });

  // --------------------------------------------------------------------------
  // SUITE 6: PAY-04 — pointsRedeemed Saved on Booking Record
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 6: PAY-04 (pointsRedeemed Saved on Booking Record) ---');

  const pay04MemberId = `mem_pay04_${Date.now()}`;
  await prisma.member.create({
    data: {
      id: pay04MemberId,
      name: 'Points Spender',
      mobile: `995${Math.floor(1000000 + Math.random() * 9000000)}`,
      walletBalance: 100000, // 1000 INR
      loyaltyPoints: 150
    }
  });

  const pay04Token = jwt.sign({ memberId: pay04MemberId, uid: '9950000000' }, jwtSecret);

  await runTest('PAY-04: Booking creation with points deduction saves pointsRedeemed on Booking record', async () => {
    await prisma.turfSport.upsert({
      where: { turfId_sportId: { turfId, sportId } },
      update: {},
      create: { turfId, sportId }
    });

    const bookingPayload = {
      turfId,
      sportId,
      participantCount: 1,
      targetMemberId: pay04MemberId,
      startTime: new Date(Date.now() + 15000000).toISOString(),
      endTime: new Date(Date.now() + 18600000).toISOString(),
      price: 600,
      paymentMethod: 'ONLINE',
      pointsAmountToUse: 75,
      walletAmountToUse: 0
    };

    const req = new Request('http://localhost:3000/api/client/v1/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pay04Token}`
      },
      body: JSON.stringify(bookingPayload)
    });

    const res = (await bookingCreatePost(req)) as Response;
    const data = await res.json();
    if (res.status !== 200) {
      console.log('PAY-04 booking creation failed response:', res.status, data);
    }
    assert(res.status === 200, `Booking creation failed with status ${res.status}: ${JSON.stringify(data)}`);
    assert(data.success === true, 'Expected booking creation success === true');

    const createdBookingId = data.booking.id;
    const dbBooking = await prisma.booking.findUnique({ where: { id: createdBookingId } });

    assert(!!dbBooking, 'Created booking not found in DB');
    assert(dbBooking!.pointsRedeemed === 75, `Expected pointsRedeemed === 75, got ${dbBooking!.pointsRedeemed}`);
  });

  await runTest('PAY-04: Booking creation with 0 points redeemed saves pointsRedeemed: 0', async () => {
    const bookingPayload = {
      turfId,
      sportId,
      participantCount: 1,
      targetMemberId: pay04MemberId,
      startTime: new Date(Date.now() + 25000000).toISOString(),
      endTime: new Date(Date.now() + 28600000).toISOString(),
      price: 600,
      paymentMethod: 'ONLINE',
      pointsAmountToUse: 0,
      walletAmountToUse: 0
    };

    const req = new Request('http://localhost:3000/api/client/v1/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pay04Token}`
      },
      body: JSON.stringify(bookingPayload)
    });

    const res = (await bookingCreatePost(req)) as Response;
    const data = await res.json();
    assert(res.status === 200, `Booking creation failed: ${JSON.stringify(data)}`);
    const dbBooking = await prisma.booking.findUnique({ where: { id: data.booking.id } });
    assert(dbBooking!.pointsRedeemed === 0, `Expected pointsRedeemed === 0, got ${dbBooking!.pointsRedeemed}`);
  });

  // --------------------------------------------------------------------------
  // SUITE 7: PAY-05 — Booking Cleanup Wallet Refund Description
  // --------------------------------------------------------------------------
  console.log('\n--- SUITE 7: PAY-05 (Wallet Auto-Refund Description & Transaction Logging) ---');

  const expMemberId = `mem_exp_${Date.now()}`;
  const expBookingId = `bk_exp_${Date.now()}`;

  await prisma.member.create({
    data: {
      id: expMemberId,
      name: 'Expired Booking User',
      mobile: `994${Math.floor(1000000 + Math.random() * 9000000)}`,
      walletBalance: 0,
      loyaltyPoints: 50
    }
  });

  // Create an expired booking with advancePaid = 350 and pointsRedeemed = 30
  // Created 30 minutes ago
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  await prisma.booking.create({
    data: {
      id: expBookingId,
      turfId,
      sportId,
      memberId: expMemberId,
      startTime: new Date(Date.now() + 20000000),
      endTime: new Date(Date.now() + 23600000),
      price: 800,
      paymentStatus: 'PARTIAL',
      status: 'PAYMENT_PENDING',
      advancePaid: 350,
      amountDue: 420,
      pointsRedeemed: 30,
      discountAmount: 30,
      createdAt: thirtyMinutesAgo
    }
  });

  await runTest('PAY-05: cleanupAbandonedBookings refunds wallet with exact description', async () => {
    const summary = await BookingCleanupService.cleanupAbandonedBookings(15);
    assert(summary.expiredCount >= 1, `Expected at least 1 booking expired, got ${summary.expiredCount}`);
    assert(summary.refundedCount >= 1, `Expected at least 1 refund processed, got ${summary.refundedCount}`);

    // Verify member wallet balance was restored: 350 INR = 35000 paise
    const memberAfter = await prisma.member.findUnique({ where: { id: expMemberId } });
    assert(memberAfter!.walletBalance === 35000, `Expected wallet balance 35000 paise, got ${memberAfter!.walletBalance}`);

    // Verify points were restored: 50 + 30 = 80
    assert(memberAfter!.loyaltyPoints === 80, `Expected loyaltyPoints 80, got ${memberAfter!.loyaltyPoints}`);

    // Verify WalletTransaction record created with required description
    const refundTx = await prisma.walletTransaction.findFirst({
      where: {
        memberId: expMemberId,
        type: 'CREDIT'
      }
    });

    assert(!!refundTx, 'WalletTransaction CREDIT not found');
    assert(refundTx!.amount === 35000, `Expected refund amount 35000 paise, got ${refundTx!.amount}`);
    assert(
      refundTx!.description === 'Refund: Booking expired (payment not completed)',
      `Expected description "Refund: Booking expired (payment not completed)", got: "${refundTx!.description}"`
    );

    // Verify Booking status was marked CANCELLED
    const bookingAfter = await prisma.booking.findUnique({ where: { id: expBookingId } });
    assert(bookingAfter!.status === 'CANCELLED', `Expected CANCELLED status, got ${bookingAfter!.status}`);
  });

  await runTest('PAY-05: Non-expired booking (< 15 mins) is NOT cleaned up or refunded', async () => {
    const freshExpMemberId = `mem_fresh_${Date.now()}`;
    const freshExpBookingId = `bk_fresh_${Date.now()}`;
    await prisma.member.create({
      data: { id: freshExpMemberId, name: 'Fresh User', mobile: `993${Math.floor(1000000 + Math.random() * 9000000)}`, walletBalance: 10000 }
    });

    // Created only 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await prisma.booking.create({
      data: {
        id: freshExpBookingId,
        turfId,
        sportId,
        memberId: freshExpMemberId,
        startTime: new Date(Date.now() + 30000000),
        endTime: new Date(Date.now() + 33600000),
        price: 800,
        paymentStatus: 'PARTIAL',
        status: 'PAYMENT_PENDING',
        advancePaid: 200,
        amountDue: 600,
        createdAt: fiveMinutesAgo
      }
    });

    await BookingCleanupService.cleanupAbandonedBookings(15);

    const bookingCheck = await prisma.booking.findUnique({ where: { id: freshExpBookingId } });
    assert(bookingCheck!.status === 'PAYMENT_PENDING', 'Fresh booking must remain PAYMENT_PENDING');
    assert(bookingCheck!.advancePaid === 200, 'advancePaid must remain 200');

    const memberCheck = await prisma.member.findUnique({ where: { id: freshExpMemberId } });
    assert(memberCheck!.walletBalance === 10000, 'Wallet balance must remain unchanged');
  });

  await runTest('PAY-05: Abandoned booking with advancePaid: 0 cancels booking without empty WalletTransaction', async () => {
    const zeroAdvanceMemberId = `mem_zero_${Date.now()}`;
    const zeroAdvanceBookingId = `bk_zero_${Date.now()}`;
    await prisma.member.create({
      data: { id: zeroAdvanceMemberId, name: 'Zero Advance User', mobile: `992${Math.floor(1000000 + Math.random() * 9000000)}`, walletBalance: 5000 }
    });

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    await prisma.booking.create({
      data: {
        id: zeroAdvanceBookingId,
        turfId,
        sportId,
        memberId: zeroAdvanceMemberId,
        startTime: new Date(Date.now() + 35000000),
        endTime: new Date(Date.now() + 38600000),
        price: 800,
        paymentStatus: 'UNPAID',
        status: 'PAYMENT_PENDING',
        advancePaid: 0,
        amountDue: 800,
        createdAt: thirtyMinutesAgo
      }
    });

    await BookingCleanupService.cleanupAbandonedBookings(15);

    const bookingCheck = await prisma.booking.findUnique({ where: { id: zeroAdvanceBookingId } });
    assert(bookingCheck!.status === 'CANCELLED', 'Booking must be cancelled');

    const txCheck = await prisma.walletTransaction.findFirst({
      where: { memberId: zeroAdvanceMemberId }
    });
    assert(!txCheck, 'No WalletTransaction should be created when advancePaid was 0');
  });

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log('ADVERSARIAL VERIFICATION SUMMARY');
  console.log('================================================================================');
  const total = testResults.length;
  const passed = testResults.filter(t => t.passed).length;
  const failed = testResults.filter(t => !t.passed).length;

  console.log(`Total Adversarial Tests Executed: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Pass Rate: ${Math.round((passed / total) * 100)}%`);

  if (failed > 0) {
    console.log('\nFAILURES:');
    for (const f of testResults.filter(t => !t.passed)) {
      console.log(`- ${f.name}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log('\nALL ADVERSARIAL AND BOUNDARY TESTS PASSED EMPIRICALLY!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
