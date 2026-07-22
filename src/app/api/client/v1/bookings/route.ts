import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse } from '@/lib/api-logger';
import { randomUUID } from 'crypto';
import { bumpSyncTimestamp } from '@/lib/sync';

export async function GET(request: Request) {
  console.log(`[API] GET /api/client/v1/bookings called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;

  try {
    const familyMembers = await prisma.member.findMany({
      where: { mobile: member.mobile },
      select: { id: true }
    });
    const familyIds = familyMembers.map(m => m.id);

    const bookings = await prisma.booking.findMany({
      where: { memberId: { in: familyIds } },
      include: {
        turf: true,
        sport: true,
        tickets: true,
        member: { select: { name: true, id: true } }
      },
      orderBy: { startTime: 'desc' }
    });
    
    // Get global settings
    const globalSettings = await prisma.setting.findMany();
    const settingsMap = globalSettings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
    const cancellationLimitHours = parseInt(settingsMap.CLIENT_CANCELLATION_LIMIT_HOURS || "3", 10);
    const allowRescheduling = settingsMap.ALLOW_RESCHEDULING !== "false";
    const allowCancellation = settingsMap.ALLOW_CANCELLATION !== "false";
    const allowOnlineBooking = settingsMap.ALLOW_ONLINE_BOOKING !== "false";

    return jsonResponse({ 
      success: true, 
      bookings, 
      cancellationLimitHours,
      allowRescheduling,
      allowCancellation,
      allowOnlineBooking
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/bookings ->`, error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log(`[API] POST /api/client/v1/bookings called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;

  try {
    const body = await request.json();
    const { turfId, sportId, startTime, endTime, participantCount, couponCode, walletAmountToUse = 0, memberId: requestedMemberId } = body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Bug #6: Block past-date bookings
    if (start < new Date()) {
      return jsonResponse({ error: 'Cannot book a slot in the past.' }, { status: 400 });
    }

    // Bug #15: Validate participantCount
    if (!participantCount || participantCount < 1 || !Number.isInteger(participantCount)) {
      return jsonResponse({ error: 'Invalid participant count.' }, { status: 400 });
    }
    
    // Check global settings for online booking
    const globalSettings = await prisma.setting.findMany();
    const settingsMap = globalSettings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
    const allowOnlineBooking = settingsMap.ALLOW_ONLINE_BOOKING !== "false";
    
    if (!allowOnlineBooking) {
      return jsonResponse({ error: 'Online booking is currently disabled by the administrator.' }, { status: 403 });
    }
    
    // 1. Get turf and validate
    const turf = await prisma.turf.findUnique({ where: { id: turfId } });
    if (!turf) {
      return jsonResponse({ error: 'Turf not found' }, { status: 404 });
    }

    // Bug #16: Validate sportId exists and belongs to turf
    const sport = await prisma.sport.findUnique({ where: { id: sportId } });
    if (!sport) {
      return jsonResponse({ error: 'Sport not found' }, { status: 404 });
    }
    const turfSport = await prisma.turfSport.findUnique({ 
      where: { turfId_sportId: { turfId, sportId } } 
    });
    if (!turfSport) {
      return jsonResponse({ error: 'This sport is not available at the selected turf.' }, { status: 400 });
    }

    // 2. Count overlapping bookings for this exact slot
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        turfId,
        status: { not: 'CANCELLED' },
        startTime: { lt: end },
        endTime: { gt: start }
      }
    });

    const usedCapacity = overlappingBookings.reduce((sum, b) => sum + b.participantCount, 0);
    const availableCourts = turf.capacityPerSlot - usedCapacity;

    if (participantCount > availableCourts) {
      return jsonResponse({ 
        error: 'Slot is no longer available or insufficient courts.' 
      }, { status: 409 });
    }

    // Bug #1: Server-side price calculation — do NOT trust client price
    const durationMs = end.getTime() - start.getTime();
    const slotDurationMs = (turf.bookingDurationMinutes || 60) * 60 * 1000;
    const numberOfSlots = Math.max(1, Math.round(durationMs / slotDurationMs));
    const price = (turf.bookingPrice || 0) * numberOfSlots * participantCount;

    // Profile and Wallet Logic
    let targetMemberId = member.id;
    if (requestedMemberId && requestedMemberId !== member.id) {
      const familyCheck = await prisma.member.findFirst({
        where: { id: requestedMemberId, mobile: member.mobile }
      });
      if (familyCheck) {
        targetMemberId = requestedMemberId;
      } else {
        return jsonResponse({ error: 'Invalid profile selection.' }, { status: 403 });
      }
    }

    // Fetch latest member wallet balance for target member
    const memberData = await prisma.member.findUnique({ where: { id: targetMemberId } });
    const currentWallet = memberData?.walletBalance || 0;
    
    // Validate Coupon if provided
    let discountAmount = 0;
    let validCouponId: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: String(couponCode).toUpperCase() },
        include: { usages: true, assignments: true }
      });
      
      // Bug #11: Return error if coupon is invalid instead of silently ignoring
      if (!coupon) {
        return jsonResponse({ error: 'Invalid coupon code.' }, { status: 400 });
      }
      if (!coupon.isActive) {
        return jsonResponse({ error: 'This coupon is no longer active.' }, { status: 400 });
      }
      if (coupon.expiryDate && new Date() > coupon.expiryDate) {
        return jsonResponse({ error: 'This coupon has expired.' }, { status: 400 });
      }

      // Evaluate target constraints
      let isAllowed = true;
      let targetError = '';
      if (coupon.targetType === 'SPECIFIC_MEMBERS') {
        isAllowed = coupon.assignments.some(a => a.memberId === targetMemberId);
        if (!isAllowed) targetError = 'This coupon is not available for your account.';
      } else if (coupon.targetType === 'MILESTONE_ALL_TIME' || coupon.targetType === 'MILESTONE_FROM_CREATION') {
        // Bug #9: Count CONFIRMED + COMPLETED, not just COMPLETED
        const milestoneWhere: any = { 
          memberId: targetMemberId, 
          status: { in: ['CONFIRMED', 'COMPLETED'] } 
        };
        // Bug #8: Handle MILESTONE_FROM_CREATION — count bookings since member joined
        if (coupon.targetType === 'MILESTONE_FROM_CREATION' && memberData?.joinDate) {
          milestoneWhere.createdAt = { gte: memberData.joinDate };
        }
        const userBookingsCount = await prisma.booking.count({ where: milestoneWhere });
        if (userBookingsCount < (coupon.milestoneBookingsCount || 0)) {
          isAllowed = false;
          targetError = `You need at least ${coupon.milestoneBookingsCount} bookings to use this coupon.`;
        }
      }

      // Global and per user limits
      if (coupon.maxUses !== null && coupon.usages.length >= coupon.maxUses) {
        isAllowed = false;
        targetError = 'This coupon has reached its maximum usage limit.';
      }
      if (coupon.maxUsesPerUser !== null && coupon.usages.filter(u => u.memberId === targetMemberId).length >= coupon.maxUsesPerUser) {
        isAllowed = false;
        targetError = 'You have already used this coupon the maximum number of times.';
      }

      if (!isAllowed) {
        return jsonResponse({ error: targetError || 'Coupon not applicable.' }, { status: 400 });
      }

      validCouponId = coupon.id;
      if (coupon.discountAmount !== null && coupon.discountAmount > 0) {
        discountAmount = coupon.discountAmount;
      } else if (coupon.discountPercentage !== null && coupon.discountPercentage > 0) {
        discountAmount = (price * coupon.discountPercentage) / 100;
      }
      if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
      if (discountAmount > price) discountAmount = price;
      discountAmount = Math.floor(discountAmount);
    }

    const subtotal = price - discountAmount;
    
    // Wallet deduction - allow any amount up to balance and subtotal
    let advancePaid = 0;
    if (walletAmountToUse > 0) {
      advancePaid = Math.min(walletAmountToUse, currentWallet, subtotal);
    }
    
    const amountDue = subtotal - advancePaid;

    // Calculate SV Points Earned on subtotal (net amount), not gross price
    const pointsEarned = Math.floor(subtotal * 0.01);

    let paymentStatus = "Due";
    if (amountDue === 0) {
      paymentStatus = advancePaid > 0 ? "Paid using Wallet" : "Paid";
    } else if (advancePaid > 0) {
      paymentStatus = "Advance Paid";
    }

    // Generate ticket data ahead of time
    const ticketData: { qrCode: string; guestName: string | null }[] = [];
    for (let i = 0; i < participantCount; i++) {
      ticketData.push({
        qrCode: `TICKET-${randomUUID()}`,
        guestName: body.guests && body.guests[i] ? body.guests[i].name : null
      });
    }

    // Bug #2: Use interactive transaction so everything is atomic
    const booking = await prisma.$transaction(async (tx) => {
      // Re-check availability inside transaction to reduce race window
      const txOverlapping = await tx.booking.findMany({
        where: {
          turfId,
          status: { not: 'CANCELLED' },
          startTime: { lt: end },
          endTime: { gt: start }
        }
      });
      const txUsed = txOverlapping.reduce((sum, b) => sum + b.participantCount, 0);
      if (participantCount > (turf.capacityPerSlot - txUsed)) {
        throw new Error('SLOT_UNAVAILABLE');
      }

      // Re-check wallet balance inside transaction to prevent double-spending
      if (advancePaid > 0) {
        const freshMember = await tx.member.findUnique({ where: { id: targetMemberId } });
        if (!freshMember || freshMember.walletBalance < advancePaid) {
          throw new Error('INSUFFICIENT_WALLET');
        }
      }

      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          turfId,
          sportId,
          memberId: targetMemberId,
          startTime: start,
          endTime: end,
          price,
          participantCount,
          status: "CONFIRMED",
          paymentStatus,
          advancePaid,
          amountDue
        }
      });

      // Coupon usage
      if (validCouponId) {
        await tx.couponUsage.create({
          data: {
            couponId: validCouponId,
            memberId: targetMemberId,
            bookingId: newBooking.id,
            discountAmount
          }
        });
      }

      // Wallet deduction
      if (advancePaid > 0) {
        await tx.member.update({
          where: { id: targetMemberId },
          data: { walletBalance: { decrement: advancePaid } }
        });
        await tx.walletTransaction.create({
          data: {
            memberId: targetMemberId,
            amount: advancePaid,
            type: 'DEBIT',
            description: `Payment for booking ${newBooking.id}`
          }
        });
        await tx.payment.create({
          data: {
            bookingId: newBooking.id,
            amount: advancePaid,
            method: 'WALLET'
          }
        });
      }

      // Add loyalty points
      if (pointsEarned > 0) {
        await tx.member.update({
          where: { id: targetMemberId },
          data: { loyaltyPoints: { increment: pointsEarned } }
        });
        await tx.loyaltyHistory.create({
          data: {
            memberId: targetMemberId,
            points: pointsEarned,
            type: 'EARNED',
            source: 'BOOKING',
            description: `Earned from booking ${newBooking.id}`
          }
        });
      }

      // Generate Tickets
      const tickets = ticketData.map(t => ({
        bookingId: newBooking.id,
        ...t
      }));
      await tx.ticket.createMany({ data: tickets });

      return newBooking;
    });

    // Evaluate Loyalty Triggers (outside main transaction — non-critical)
    try {
      const userBookings = await prisma.booking.count({
        where: {
          memberId: targetMemberId,
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      });

      const activeTriggers = await prisma.loyaltyTrigger.findMany({
        where: {
          isActive: true,
          targetBookingsCount: { lte: userBookings }
        }
      });

      if (activeTriggers.length > 0) {
        const existingAchievements = await prisma.loyaltyAchievement.findMany({
          where: {
            memberId: targetMemberId,
            triggerId: { in: activeTriggers.map(t => t.id) }
          }
        });
        const achievedIds = new Set(existingAchievements.map(a => a.triggerId));
        const newAchievements = activeTriggers.filter(t => !achievedIds.has(t.id));
        
        if (newAchievements.length > 0) {
          const triggerQueries: any[] = [];
          for (const trigger of newAchievements) {
            triggerQueries.push(prisma.loyaltyAchievement.create({
              data: { triggerId: trigger.id, memberId: targetMemberId }
            }));
            
            if (trigger.rewardAmount > 0) {
              triggerQueries.push(prisma.member.update({
                where: { id: targetMemberId },
                data: { walletBalance: { increment: trigger.rewardAmount } }
              }));
              triggerQueries.push(prisma.walletTransaction.create({
                data: {
                  memberId: targetMemberId,
                  amount: trigger.rewardAmount,
                  type: 'CREDIT',
                  description: `Reward for ${trigger.title}`
                }
              }));
            }

            if (trigger.rewardPoints > 0) {
              triggerQueries.push(prisma.member.update({
                where: { id: targetMemberId },
                data: { loyaltyPoints: { increment: trigger.rewardPoints } }
              }));
              triggerQueries.push(prisma.loyaltyHistory.create({
                data: {
                  memberId: targetMemberId,
                  points: trigger.rewardPoints,
                  type: 'EARNED',
                  source: 'MANUAL',
                  description: `Reward for ${trigger.title}`
                }
              }));
            }
          }
          await prisma.$transaction(triggerQueries);
        }
      }
    } catch (triggerError) {
      console.error(`[API ERROR] POST /api/client/v1/bookings -> Loyalty triggers:`, triggerError);
    }

    await bumpSyncTimestamp('booking');
    return jsonResponse({ success: true, booking });
  } catch (error: any) {
    if (error.message === 'SLOT_UNAVAILABLE') {
      return jsonResponse({ error: 'Slot is no longer available or insufficient courts.' }, { status: 409 });
    }
    if (error.message === 'INSUFFICIENT_WALLET') {
      return jsonResponse({ error: 'Insufficient wallet balance.' }, { status: 400 });
    }
    console.error(`[API ERROR] POST /api/client/v1/bookings ->`, error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
