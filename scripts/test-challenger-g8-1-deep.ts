import 'dotenv/config';
// Patch next-auth before importing route handlers
let mockAdminSession: any = null;
const nextAuthNext = require('next-auth/next');
nextAuthNext.getServerSession = async () => mockAdminSession;

import { prisma } from '../src/lib/prisma';
import { POST as paymentWebhookHandler } from '../src/app/api/client/v1/payments/webhook/route';
import { GET as bookingGetHandler } from '../src/app/api/client/v1/bookings/[id]/route';
import { POST as uploadDeleteHandler } from '../src/app/api/client/v1/upload/delete/route';
import { s3Client } from '../src/lib/s3';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

// Mock s3Client.send so legitimate delete calls don't need live Cloudflare R2 network connectivity
(s3Client as any).send = async () => ({});

interface DeepTestReport {
  test: string;
  passed: boolean;
  message: string;
}

const reports: DeepTestReport[] = [];

function check(passed: boolean, test: string, message: string) {
  if (passed) {
    console.log(`✅ [PASS] ${test}: ${message}`);
    reports.push({ test, passed: true, message });
  } else {
    console.error(`❌ [FAIL] ${test}: ${message}`);
    reports.push({ test, passed: false, message });
  }
}

async function runDeepRouteVerification() {
  console.log('================================================================');
  console.log('CHALLENGER G8 1: DEEP ROUTE-LEVEL ADVERSARIAL VERIFICATION');
  console.log('================================================================\n');

  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-tests';
  const testId = randomUUID().slice(0, 8);

  // Setup webhook secret in DB settings
  const webhookSecretKey = `rzp_test_secret_${testId}`;
  await prisma.setting.upsert({
    where: { key: 'RAZORPAY_WEBHOOK_SECRET' },
    update: { value: webhookSecretKey },
    create: { key: 'RAZORPAY_WEBHOOK_SECRET', value: webhookSecretKey }
  });

  // Setup DB fixtures: Sport, Turf, Members
  const sport = await prisma.sport.create({
    data: { name: `DeepSport_${testId}`, slotDurationMinutes: 60 }
  });
  const turf = await prisma.turf.create({
    data: { name: `DeepTurf_${testId}`, bookingPrice: 1000 }
  });

  const memberOwner = await prisma.member.create({
    data: {
      name: `DeepOwner_${testId}`,
      mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      walletBalance: 0
    }
  });

  const memberAttacker = await prisma.member.create({
    data: {
      name: `DeepAttacker_${testId}`,
      mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      walletBalance: 0
    }
  });

  const memberFamily = await prisma.member.create({
    data: {
      name: `DeepFamily_${testId}`,
      mobile: memberOwner.mobile, // Same mobile acts as family match
      walletBalance: 0
    }
  });

  const ownerToken = jwt.sign(
    { uid: memberOwner.mobile, memberId: memberOwner.id },
    secret,
    { algorithm: 'HS256' }
  );

  const attackerToken = jwt.sign(
    { uid: memberAttacker.mobile, memberId: memberAttacker.id },
    secret,
    { algorithm: 'HS256' }
  );

  const familyToken = jwt.sign(
    { uid: memberFamily.mobile, memberId: memberFamily.id },
    secret,
    { algorithm: 'HS256' }
  );

  const now = new Date();
  const t1Start = new Date(now.getTime() + 72 * 3600 * 1000);
  const t1End = new Date(t1Start.getTime() + 3600 * 1000);
  const t2Start = new Date(now.getTime() + 74 * 3600 * 1000);
  const t2End = new Date(t2Start.getTime() + 3600 * 1000);

  const b1 = await prisma.booking.create({
    data: {
      turfId: turf.id,
      sportId: sport.id,
      memberId: memberOwner.id,
      startTime: t1Start,
      endTime: t1End,
      price: 800,
      amountDue: 800,
      paymentStatus: 'UNPAID',
      status: 'CONFIRMED'
    }
  });

  const b2 = await prisma.booking.create({
    data: {
      turfId: turf.id,
      sportId: sport.id,
      memberId: memberOwner.id,
      startTime: t2Start,
      endTime: t2End,
      price: 400,
      amountDue: 400,
      paymentStatus: 'UNPAID',
      status: 'CONFIRMED'
    }
  });

  const tourney = await prisma.tournament.create({
    data: { name: `DeepTourney_${testId}`, startDate: new Date() }
  });
  const screenshotKey = `uploads/reg_proof_${testId}.jpg`;
  const reg = await prisma.tournamentRegistration.create({
    data: {
      tournamentId: tourney.id,
      registeredById: memberOwner.id,
      paymentScreenshotUrl: screenshotKey,
      status: 'PENDING'
    }
  });

  try {
    // -------------------------------------------------------------------------
    // PART 1: End-to-End Payment Link Webhook HTTP Route Execution
    // -------------------------------------------------------------------------
    console.log('>>> [PART 1] End-to-End Payment Link Webhook Testing...');

    // 1.1: Webhook signature security check - Tampered signature rejection
    const fakePayload = JSON.stringify({ event: 'payment_link.paid' });
    const badSigRequest = new Request('http://localhost:3000/api/client/v1/payments/webhook?gateway=RAZORPAY', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-razorpay-signature': 'invalid_signature_hex_code_1234567890abcdef'
      },
      body: fakePayload
    });
    const badSigResponse = (await (paymentWebhookHandler as any)(badSigRequest, {}))!;
    check(
      badSigResponse.status === 401,
      'Webhook Signature Rejection',
      `Tampered signature correctly returns HTTP 401 (got ${badSigResponse.status})`
    );

    // 1.2: Valid signature with payment_link.paid multi-booking allocation
    const linkId = `plink_${testId}`;
    const validWebhookPayload = JSON.stringify({
      event: 'payment_link.paid',
      payload: {
        payment_link: {
          entity: {
            id: linkId,
            reference_id: `${b1.id}, ${b2.id}`,
            amount_paid: 120000, // 120000 paise = ₹1200.00
            order_id: `order_${testId}`
          }
        },
        payment: {
          entity: {
            id: `pay_${testId}`,
            amount: 120000
          }
        }
      }
    });

    const validSignature = crypto
      .createHmac('sha256', webhookSecretKey)
      .update(validWebhookPayload)
      .digest('hex');

    const validWebhookRequest = new Request('http://localhost:3000/api/client/v1/payments/webhook?gateway=RAZORPAY', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-razorpay-signature': validSignature
      },
      body: validWebhookPayload
    });

    const validResponse = (await (paymentWebhookHandler as any)(validWebhookRequest, {}))!;
    const validRespJson = await validResponse.json();

    check(
      validResponse.status === 200 && validRespJson.success === true,
      'Payment Link Webhook Multi-Booking Execution',
      `Webhook handler returned 200 OK: ${JSON.stringify(validRespJson)}`
    );

    // Verify DB state of both bookings
    const reloadedB1 = await prisma.booking.findUnique({ where: { id: b1.id } });
    const reloadedB2 = await prisma.booking.findUnique({ where: { id: b2.id } });

    check(
      reloadedB1?.paymentStatus === 'PAID' && reloadedB1?.amountDue === 0 && reloadedB1?.advancePaid === 800,
      'Booking 1 Settle State',
      `B1 paymentStatus: ${reloadedB1?.paymentStatus}, amountDue: ${reloadedB1?.amountDue}, advancePaid: ${reloadedB1?.advancePaid}`
    );
    check(
      reloadedB2?.paymentStatus === 'PAID' && reloadedB2?.amountDue === 0 && reloadedB2?.advancePaid === 400,
      'Booking 2 Settle State',
      `B2 paymentStatus: ${reloadedB2?.paymentStatus}, amountDue: ${reloadedB2?.amountDue}, advancePaid: ${reloadedB2?.advancePaid}`
    );

    // Verify tickets were created for both bookings
    const ticketsB1 = await prisma.ticket.findMany({ where: { bookingId: b1.id } });
    const ticketsB2 = await prisma.ticket.findMany({ where: { bookingId: b2.id } });
    check(
      ticketsB1.length > 0 && ticketsB2.length > 0,
      'Tickets Generated on Payment Settlement',
      `B1 tickets: ${ticketsB1.length}, B2 tickets: ${ticketsB2.length}`
    );

    // -------------------------------------------------------------------------
    // PART 2: End-to-End Booking Detail IDOR HTTP Route Execution
    // -------------------------------------------------------------------------
    console.log('\n>>> [PART 2] End-to-End Booking Detail IDOR Testing...');

    mockAdminSession = null; // Ensure non-admin client mode

    // 2.1: Attacker tries to read Owner's booking -> HTTP 403
    const attackerRequest = new Request(`http://localhost:3000/api/client/v1/bookings/${b1.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${attackerToken}`
      }
    });
    const attackerResponse = (await bookingGetHandler(attackerRequest, { params: Promise.resolve({ id: b1.id }) }))!;
    const attackerJson = await attackerResponse.json();
    check(
      attackerResponse.status === 403,
      'Booking Detail IDOR Protection (Attacker Blocked)',
      `Attacker received HTTP 403 Forbidden: ${attackerJson.error}`
    );

    // 2.2: Owner reads own booking -> HTTP 200
    const ownerRequest = new Request(`http://localhost:3000/api/client/v1/bookings/${b1.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ownerToken}`
      }
    });
    const ownerResponse = (await bookingGetHandler(ownerRequest, { params: Promise.resolve({ id: b1.id }) }))!;
    const ownerJson = await ownerResponse.json();
    check(
      ownerResponse.status === 200 && ownerJson.success === true && ownerJson.booking.id === b1.id,
      'Booking Detail Owner Access',
      `Owner received HTTP 200 with booking ID ${ownerJson.booking?.id}`
    );

    // 2.3: Family member reads booking -> HTTP 200
    const familyRequest = new Request(`http://localhost:3000/api/client/v1/bookings/${b1.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${familyToken}`
      }
    });
    const familyResponse = (await bookingGetHandler(familyRequest, { params: Promise.resolve({ id: b1.id }) }))!;
    const familyJson = await familyResponse.json();
    check(
      familyResponse.status === 200 && familyJson.success === true && familyJson.booking.id === b1.id,
      'Booking Detail Family Access',
      `Family member received HTTP 200 with booking ID ${familyJson.booking?.id}`
    );

    // 2.4: Admin reads booking -> HTTP 200
    mockAdminSession = { user: { email: 'superadmin@sportsvilla.co.in' } };
    const adminRequest = new Request(`http://localhost:3000/api/client/v1/bookings/${b1.id}`, {
      method: 'GET'
    });
    const adminResponse = (await bookingGetHandler(adminRequest, { params: Promise.resolve({ id: b1.id }) }))!;
    const adminJson = await adminResponse.json();
    check(
      adminResponse.status === 200 && adminJson.success === true && adminJson.booking.id === b1.id,
      'Booking Detail Admin Override Access',
      `Admin session received HTTP 200 with booking ID ${adminJson.booking?.id}`
    );
    mockAdminSession = null;

    // 2.5: Unauthenticated request -> HTTP 401
    const anonRequest = new Request(`http://localhost:3000/api/client/v1/bookings/${b1.id}`, {
      method: 'GET'
    });
    const anonResponse = (await bookingGetHandler(anonRequest, { params: Promise.resolve({ id: b1.id }) }))!;
    check(
      anonResponse.status === 401,
      'Booking Detail Unauthenticated Access',
      `Anonymous request received HTTP 401 (got ${anonResponse.status})`
    );

    // -------------------------------------------------------------------------
    // PART 3: End-to-End upload/delete IDOR HTTP Route Execution
    // -------------------------------------------------------------------------
    console.log('\n>>> [PART 3] End-to-End upload/delete IDOR Testing...');

    // 3.1: Non-admin trying to delete APK -> HTTP 403
    const deleteApkRequest = new Request('http://localhost:3000/api/client/v1/upload/delete', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${attackerToken}`
      },
      body: JSON.stringify({ key: 'uploads/sportsvilla-v1.0.apk' })
    });
    const deleteApkResp = (await uploadDeleteHandler(deleteApkRequest))!;
    const deleteApkJson = await deleteApkResp.json();
    check(
      deleteApkResp.status === 403,
      'Upload Delete APK Protection',
      `Non-admin APK deletion rejected with HTTP 403: ${deleteApkJson.error}`
    );

    // 3.2: Path traversal attack -> HTTP 400
    const traversalRequest = new Request('http://localhost:3000/api/client/v1/upload/delete', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${attackerToken}`
      },
      body: JSON.stringify({ key: 'uploads/../../etc/passwd' })
    });
    const traversalResp = (await uploadDeleteHandler(traversalRequest))!;
    const traversalJson = await traversalResp.json();
    check(
      traversalResp.status === 400,
      'Upload Delete Path Traversal Protection',
      `Path traversal rejected with HTTP 400: ${traversalJson.error}`
    );

    // 3.3: Outside uploads/ jail -> HTTP 400
    const outsideJailRequest = new Request('http://localhost:3000/api/client/v1/upload/delete', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${attackerToken}`
      },
      body: JSON.stringify({ key: 'config/secrets.env' })
    });
    const outsideJailResp = (await uploadDeleteHandler(outsideJailRequest))!;
    const outsideJailJson = await outsideJailResp.json();
    check(
      outsideJailResp.status === 400,
      'Upload Delete Jail Protection',
      `Non-uploads prefix rejected with HTTP 400: ${outsideJailJson.error}`
    );

    // 3.4: Tournament screenshot IDOR: Attacker tries to delete Owner's payment screenshot -> 403
    const attackerDelProofReq = new Request('http://localhost:3000/api/client/v1/upload/delete', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${attackerToken}`
      },
      body: JSON.stringify({ key: screenshotKey })
    });
    const attackerDelProofResp = (await uploadDeleteHandler(attackerDelProofReq))!;
    const attackerDelProofJson = await attackerDelProofResp.json();
    check(
      attackerDelProofResp.status === 403,
      'Upload Delete Tournament Proof IDOR Protection',
      `Attacker cannot delete owner screenshot: HTTP 403 ${attackerDelProofJson.error}`
    );

    // 3.5: Owner deletes own payment screenshot -> 200
    const ownerDelProofReq = new Request('http://localhost:3000/api/client/v1/upload/delete', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ key: screenshotKey })
    });
    const ownerDelProofResp = (await uploadDeleteHandler(ownerDelProofReq))!;
    const ownerDelProofJson = await ownerDelProofResp.json();
    check(
      ownerDelProofResp.status === 200 && ownerDelProofJson.success === true,
      'Upload Delete Owner Access',
      `Owner permitted to delete own screenshot: HTTP 200 ${ownerDelProofJson.message}`
    );

    // 3.6: Admin deletes APK -> 200
    mockAdminSession = { user: { email: 'superadmin@sportsvilla.co.in' } };
    const adminDelApkReq = new Request('http://localhost:3000/api/client/v1/upload/delete', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ key: 'uploads/sportsvilla-v2.0.apk' })
    });
    const adminDelApkResp = (await uploadDeleteHandler(adminDelApkReq))!;
    const adminDelApkJson = await adminDelApkResp.json();
    check(
      adminDelApkResp.status === 200 && adminDelApkJson.success === true,
      'Upload Delete Admin Privilege Access',
      `Admin permitted to delete APK: HTTP 200 ${adminDelApkJson.message}`
    );
    mockAdminSession = null;

  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------------------
    console.log('\n>>> Cleaning up deep route fixtures...');
    try {
      await prisma.ticket.deleteMany({ where: { bookingId: { in: [b1.id, b2.id] } } });
      await prisma.payment.deleteMany({ where: { bookingId: { in: [b1.id, b2.id] } } });
      await prisma.transaction.deleteMany({ where: { bookingId: { in: [b1.id, b2.id] } } });
      await prisma.booking.deleteMany({ where: { id: { in: [b1.id, b2.id] } } });
      await prisma.tournamentRegistration.deleteMany({ where: { tournamentId: tourney.id } });
      await prisma.tournament.delete({ where: { id: tourney.id } });
      await prisma.member.deleteMany({ where: { id: { in: [memberOwner.id, memberAttacker.id, memberFamily.id] } } });
      await prisma.turf.delete({ where: { id: turf.id } });
      await prisma.sport.delete({ where: { id: sport.id } });
      console.log('Cleanup finished cleanly.');
    } catch (err) {
      console.warn('Cleanup warning:', err);
    }
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('DEEP VERIFICATION SUMMARY');
  console.log('================================================================');
  const total = reports.length;
  const passed = reports.filter(r => r.passed).length;
  const failed = reports.filter(r => !r.passed).length;
  console.log(`Total Route Checks Run: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Status: ${failed === 0 ? 'SUCCESS - ALL HTTP ENDPOINTS SECURE & CORRECT' : 'FAILURES DETECTED'}`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runDeepRouteVerification().catch(e => {
  console.error('Fatal in deep route runner:', e);
  process.exit(1);
});
