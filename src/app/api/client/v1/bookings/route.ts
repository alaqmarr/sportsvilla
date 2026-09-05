import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { randomUUID } from 'crypto';
import { bumpSyncTimestamp } from '@/lib/sync';
import { whatsappDb } from '@/lib/whatsappDb';
import { sendWhatsAppBookingConfirmedTemplate } from '@/lib/whatsapp';
import { createBookingSchema } from '@/lib/validations/booking';
import { Mutex } from '@/lib/mutex';
export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/bookings called`);
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
      where: {
        OR: [
          { memberId: { in: familyIds } },
          { participants: { some: { memberId: { in: familyIds }, status: 'CONFIRMED' } } }
        ]
      },
      include: {
        turf: true,
        sport: true,
        tickets: true,
        member: { select: { name: true, id: true } },
        participants: {
          include: {
            member: { select: { id: true, name: true, mobile: true } },
          },
        },
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
  apiLog(`[API] POST /api/client/v1/bookings called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;
  
  let lockKey: string | null = null;

  try {
    const body = await request.json();
    const parseResult = createBookingSchema.safeParse(body);
    
    if (!parseResult.success) {
      return jsonResponse({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    const { turfId, sportId, startTime, endTime, participantCount, couponCode, walletAmountToUse = 0, walletOtp, pointsAmountToUse = 0, memberId: requestedMemberId, visibility, inviteMaxCount } = parseResult.data;

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
    
    // 1. Fetch related data concurrently
    const [turf, sport, turfSport, overlappingBookings] = await Promise.all([
      prisma.turf.findUnique({ where: { id: turfId } }),
      prisma.sport.findUnique({ where: { id: sportId } }),
      prisma.turfSport.findUnique({ where: { turfId_sportId: { turfId, sportId } } }),
      prisma.booking.findMany({
        where: {
          turfId,
          status: { not: 'CANCELLED' },
          startTime: { lt: end },
          endTime: { gt: start }
        }
      })
    ]);

    if (!turf) {
      return jsonResponse({ error: 'Turf not found' }, { status: 404 });
    }
    if (!sport) {
      return jsonResponse({ error: 'Sport not found' }, { status: 404 });
    }
    if (!turfSport) {
      return jsonResponse({ error: 'This sport is not available at the selected turf.' }, { status: 400 });
    }

    const usedCapacity = overlappingBookings.reduce((sum, b) => sum + b.participantCount, 0);
    const availableCourts = turf.capacityPerSlot - usedCapacity;

    if (participantCount > availableCourts) {
      return jsonResponse({ 
        error: 'Slot is no longer available or insufficient courts.' 
      }, { status: 409 });
    }

    // Bug #1: Server-side price calculation — do NOT trust client price (prorated by duration to match admin pricing #22)
    const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / (60 * 1000)));
    const baseSlotMinutes = turf.bookingDurationMinutes || 60;
    const price = Math.round(((turf.bookingPrice || 0) / baseSlotMinutes) * durationMinutes * participantCount);

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

    lockKey = `booking:${turfId}:${start.getTime()}:${end.getTime()}`;
    const acquired = await Mutex.acquire(lockKey, 3000);
    if (!acquired) {
      return jsonResponse({ error: 'Server busy processing another booking for this slot. Please try again.' }, { status: 409 });
    }

    // Fetch latest member wallet balance for logged-in member (they are the one paying)
    const memberData = await prisma.member.findUnique({ where: { id: member.id } });
    const currentWallet = memberData?.walletBalance || 0;
    const currentPoints = memberData?.loyaltyPoints || 0;
    
    // Validate Coupon if provided
    let discountAmount = 0;
    let validCouponId: string | null = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: String(couponCode).toUpperCase() },
        include: { assignments: true }
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
        isAllowed = coupon.assignments.some(a => a.memberId === member.id);
        if (!isAllowed) targetError = 'This coupon is not available for your account.';
      } else if (coupon.targetType === 'MILESTONE_ALL_TIME' || coupon.targetType === 'MILESTONE_FROM_CREATION') {
        // Bug #9: Count CONFIRMED + COMPLETED, not just COMPLETED
        const milestoneWhere: any = { 
          memberId: member.id, 
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
      if (coupon.maxUses !== null) {
        const totalUses = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
        if (totalUses >= coupon.maxUses) {
          isAllowed = false;
          targetError = 'This coupon has reached its maximum usage limit.';
        }
      }
      if (isAllowed && coupon.maxUsesPerUser !== null) {
        const userUses = await prisma.couponUsage.count({ where: { couponId: coupon.id, memberId: member.id } });
        if (userUses >= coupon.maxUsesPerUser) {
          isAllowed = false;
          targetError = 'You have already used this coupon the maximum number of times.';
        }
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
    // Note: currentWallet is in Paise. requestedWallet and subtotal are in Rupees.
    let advancePaid = 0;
    const requestedWallet = Number(walletAmountToUse) || 0;
    if (requestedWallet > 0) {
      advancePaid = Math.min(requestedWallet, currentWallet / 100, subtotal);
    }
    
    // Future-proofing: We will rename advancePaid to walletDeductionRupees for clarity
    const walletDeductionRupees = advancePaid;

    if (walletDeductionRupees > 0) {
      if (!walletOtp) {
        return jsonResponse({ error: 'Wallet OTP is required to use wallet balance.' }, { status: 400 });
      }

      const cleanMobile = member.mobile.replace('+91', '').replace(/[^0-9]/g, '');
      const otpRecord = await whatsappDb.whatsAppOtp.findFirst({
        where: {
          phoneNumber: { contains: cleanMobile },
          otp: walletOtp,
          purpose: 'WALLET_TXN',
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!otpRecord) {
        return jsonResponse({ error: 'Invalid or missing OTP for wallet transaction.' }, { status: 400 });
      }

      if (otpRecord.verified) {
        return jsonResponse({ error: 'This OTP has already been used.' }, { status: 400 });
      }

      if (new Date() > new Date(otpRecord.expiresAt)) {
        return jsonResponse({ error: 'This OTP has expired.' }, { status: 400 });
      }

      // Mark OTP as verified
      await whatsappDb.whatsAppOtp.update({
        where: { id: otpRecord.id },
        data: { verified: true }
      });
    }
    
    // Points deduction
    let pointsDeduction = 0;
    const requestedPoints = Number(pointsAmountToUse) || 0;
    if (requestedPoints > 0) {
      pointsDeduction = Math.min(requestedPoints, currentPoints, subtotal - walletDeductionRupees);
    }
    
    // If a payment gateway is added, gatewayAmount would add to advancePaid
    const amountDue = subtotal - walletDeductionRupees - pointsDeduction;

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
        const freshMember = await tx.member.findUnique({ where: { id: member.id } });
        if (!freshMember || freshMember.walletBalance < advancePaid * 100) {
          throw new Error('INSUFFICIENT_WALLET');
        }
      }

      // Create booking
      const inviteCode = (visibility === 'OPEN' || visibility === 'INVITE_ONLY')
        ? `SV-${randomUUID().slice(0, 6).toUpperCase()}`
        : null;

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
          amountDue,
          discountAmount, // Bug Fix: actually save the discountAmount to the booking!
          visibility: visibility || "PRIVATE",
          inviteMaxCount: inviteMaxCount ? parseInt(String(inviteMaxCount), 10) : null,
          inviteCode,
          participants: {
            create: {
              memberId: targetMemberId,
              status: "CONFIRMED"
            }
          }
        }
      });

      // Coupon usage
      if (validCouponId) {
        await tx.couponUsage.create({
          data: {
            couponId: validCouponId,
            memberId: member.id, // Save against the logged in user who paid, not targetMemberId
            bookingId: newBooking.id,
            discountAmount
          }
        });
      }

      // Wallet deduction
      if (walletDeductionRupees > 0) {
        const deductionPaise = Math.round(walletDeductionRupees * 100);
        
        const freshMember = await tx.member.findUnique({ where: { id: member.id } });
        if (!freshMember || freshMember.walletBalance < deductionPaise) {
          throw new Error('INSUFFICIENT_WALLET');
        }

        await tx.member.update({
          where: { id: member.id },
          data: { walletBalance: { decrement: deductionPaise } }
        });
        await tx.walletTransaction.create({
          data: {
            memberId: member.id,
            amount: deductionPaise,
            type: 'DEBIT',
            description: `Payment for booking ${newBooking.id}`
          }
        });
        await tx.payment.create({
          data: {
            bookingId: newBooking.id,
            amount: walletDeductionRupees,
            method: 'WALLET'
          }
        });
      }

      // Deduct points
      if (pointsDeduction > 0) {
        await tx.member.update({
          where: { id: member.id }, // Logged-in user pays
          data: { loyaltyPoints: { decrement: pointsDeduction } }
        });
        
        await tx.loyaltyHistory.create({
          data: {
            memberId: member.id,
            points: pointsDeduction,
            type: 'REDEEMED',
            source: 'BOOKING',
            description: `Redeemed for booking ${newBooking.id}`
          }
        });
      }

      // Add loyalty points to the logged-in user who paid
      if (pointsEarned > 0) {
        await tx.member.update({
          where: { id: member.id },
          data: { loyaltyPoints: { increment: pointsEarned } }
        });
        await tx.loyaltyHistory.create({
          data: {
            memberId: member.id,
            points: pointsEarned,
            type: 'EARNED',
            source: 'BOOKING',
            description: `Earned from booking ${newBooking.id}`
          }
        });
      }
      // Update UserSportStat
      await tx.userSportStat.upsert({
        where: {
          memberId_sportId: { memberId: targetMemberId, sportId: sportId }
        },
        update: { bookingCount: { increment: 1 } },
        create: { memberId: targetMemberId, sportId: sportId, bookingCount: 1 }
      });

      // Generate Tickets
      const tickets = ticketData.map(t => ({
        bookingId: newBooking.id,
        ...t
      }));
      await tx.ticket.createMany({ data: tickets });

      return newBooking;
    });

    // (WhatsApp Event Trigger legacy block removed to prevent double-firing. Handled via explicitly typed templates below.)

    // Evaluate Loyalty Triggers (outside main transaction — non-critical)
    try {
      const userBookings = await prisma.booking.count({
        where: {
          memberId: member.id,
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
            memberId: member.id,
            triggerId: { in: activeTriggers.map(t => t.id) }
          }
        });
        const achievedIds = new Set(existingAchievements.map(a => a.triggerId));
        const newAchievements = activeTriggers.filter(t => !achievedIds.has(t.id));
        
        if (newAchievements.length > 0) {
          const triggerQueries: any[] = [];
          for (const trigger of newAchievements) {
            triggerQueries.push(prisma.loyaltyAchievement.create({
              data: { triggerId: trigger.id, memberId: member.id }
            }));
            
            if (trigger.rewardAmount > 0) {
              triggerQueries.push(prisma.member.update({
                where: { id: member.id },
                data: { walletBalance: { increment: trigger.rewardAmount } }
              }));
              triggerQueries.push(prisma.walletTransaction.create({
                data: {
                  memberId: member.id,
                  amount: trigger.rewardAmount,
                  type: 'CREDIT',
                  description: `Reward for ${trigger.title}`
                }
              }));
            }

            if (trigger.rewardPoints > 0) {
              triggerQueries.push(prisma.member.update({
                where: { id: member.id },
                data: { loyaltyPoints: { increment: trigger.rewardPoints } }
              }));
              triggerQueries.push(prisma.loyaltyHistory.create({
                data: {
                  memberId: member.id,
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

    // Send Booking Confirmation via WhatsApp
    try {
      const targetMemberData = await prisma.member.findUnique({ where: { id: targetMemberId } });
      if (targetMemberData) {
        const formattedDate = start.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric' });
        const formattedTime = start.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
        const endFormatted = end.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
        const timeString = `${formattedDate}, ${formattedTime} - ${endFormatted}`;
        const priceStr = `₹${booking.price - booking.discountAmount}`;
        const paymentStr = booking.paymentStatus === 'UNPAID' ? `${priceStr} (DUE)` : `${priceStr} (${booking.paymentStatus})`;
        
        await sendWhatsAppBookingConfirmedTemplate(
          targetMemberData.name, 
          turf.name,
          sport.name,
          timeString,
          paymentStr,
          targetMemberData.mobile
        );
      }
    } catch (waError) {
      console.error('WhatsApp booking confirmed message failed', waError);
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
  } finally {
    if (lockKey) {
      Mutex.release(lockKey);
    }
  }
}
