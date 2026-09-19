import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { authenticateClient } from '@/core/auth/auth-middleware';
import { jsonResponse, apiLog } from '@/core/logging/api-logger';
import { bumpSyncTimestamp } from '@/core/database/sync';
import { sendMembershipPush, sendWalletTransactionPush } from '@/modules/notifications/notifications.services';
import { logger } from '@/core/logging/logger';
import { addDays } from 'date-fns';

export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/memberships called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { member } = authRes;

  try {
    const plans = await prisma.membershipPlan.findMany({
      include: { sport: true }
    });

    const activeMemberships = await prisma.memberMembership.findMany({
      where: {
        memberId: member.id,
        status: 'ACTIVE'
      },
      include: {
        membershipPlan: {
          include: { sport: true }
        },
        turf: true
      },
      orderBy: { endDate: 'asc' }
    });

    return jsonResponse({
      success: true,
      plans,
      memberships: activeMemberships
    });
  } catch (error: any) {
    logger.error('[API ERROR] GET /api/client/v1/memberships ->', error);
    return jsonResponse({ error: error.message || 'Failed to fetch memberships' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  apiLog(`[API] POST /api/client/v1/memberships called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { member: primaryMember } = authRes;

  try {
    const body = await request.json();
    const { planId, memberId, startDate, turfId, timeSlot } = body;

    if (!planId) {
      return jsonResponse({ error: 'planId is required' }, { status: 400 });
    }

    const targetMemberId = memberId || primaryMember.id;

    // Verify member or family group access
    const familyMembers = await prisma.member.findMany({
      where: { mobile: primaryMember.mobile },
      select: { id: true }
    });

    if (!familyMembers.some(m => m.id === targetMemberId)) {
      return jsonResponse({ error: 'Unauthorized member.' }, { status: 403 });
    }

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return jsonResponse({ error: 'Membership plan not found.' }, { status: 404 });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = addDays(start, plan.durationInDays);
    const planPricePaise = Math.round(plan.price * 100);

    const result = await prisma.$transaction(async (tx) => {
      // Check for overlapping active plan
      const overlapping = await tx.memberMembership.findFirst({
        where: {
          memberId: targetMemberId,
          membershipPlanId: planId,
          status: 'ACTIVE',
          AND: [
            { startDate: { lte: end } },
            { endDate: { gte: start } }
          ]
        }
      });

      if (overlapping) {
        throw new Error('Member already has an active subscription for this plan in this period.');
      }

      // Check wallet balance
      const member = await tx.member.findUnique({
        where: { id: targetMemberId }
      });

      if (!member) throw new Error('Member not found');
      if (plan.price > 0 && member.walletBalance < planPricePaise) {
        throw new Error('Insufficient wallet balance to purchase this membership.');
      }

      // Deduct wallet if paid plan
      if (planPricePaise > 0) {
        await tx.member.update({
          where: { id: targetMemberId },
          data: { walletBalance: { decrement: planPricePaise } }
        });

        await tx.walletTransaction.create({
          data: {
            memberId: targetMemberId,
            amount: planPricePaise,
            type: 'DEBIT',
            description: `Purchase membership: ${plan.name}`
          }
        });
      }

      // Create membership record
      const membership = await tx.memberMembership.create({
        data: {
          memberId: targetMemberId,
          membershipPlanId: plan.id,
          startDate: start,
          endDate: end,
          status: 'ACTIVE',
          turfId: turfId || null,
          timeSlot: timeSlot || null
        },
        include: {
          membershipPlan: true
        }
      });

      // Award loyalty points on purchase if configured
      if (plan.rewardPointsOnPurchase > 0) {
        await tx.member.update({
          where: { id: targetMemberId },
          data: { loyaltyPoints: { increment: plan.rewardPointsOnPurchase } }
        });

        await tx.loyaltyHistory.create({
          data: {
            memberId: targetMemberId,
            points: plan.rewardPointsOnPurchase,
            type: 'EARNED',
            source: 'MEMBERSHIP',
            description: `Earned for purchasing membership: ${plan.name}`
          }
        });
      }

      return membership;
    });

    // Send Membership Purchase Push Notification (non-blocking)
    sendMembershipPush(targetMemberId, plan.name, 'PURCHASED').catch((pushErr) => {
      logger.error('[Push Hook Error] Membership purchase push failed', pushErr);
    });

    // Send Wallet Deduction Push Notification if wallet was used (non-blocking)
    if (plan.price > 0) {
      sendWalletTransactionPush(
        targetMemberId,
        plan.price,
        'DEBIT',
        `Purchased membership: ${plan.name}`
      ).catch((pushErr) => {
        logger.error('[Push Hook Error] Membership purchase wallet deduction push failed', pushErr);
      });
    }

    await bumpSyncTimestamp('member');
    return jsonResponse({ success: true, membership: result });
  } catch (error: any) {
    logger.error('[API ERROR] POST /api/client/v1/memberships ->', error);
    return jsonResponse({ error: error.message || 'Failed to purchase membership' }, { status: 400 });
  }
}
