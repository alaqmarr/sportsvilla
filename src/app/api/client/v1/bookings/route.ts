import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';

export async function GET(request: Request) {
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

    return NextResponse.json({ 
      success: true, 
      bookings, 
      cancellationLimitHours,
      allowRescheduling,
      allowCancellation,
      allowOnlineBooking
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;

  try {
    const body = await request.json();
    const { turfId, sportId, startTime, endTime, price, participantCount, couponCode, walletAmountToUse = 0 } = body;

    // STRICT AVAILABILITY CHECK
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Check global settings for online booking
    const globalSettings = await prisma.setting.findMany();
    const settingsMap = globalSettings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
    const allowOnlineBooking = settingsMap.ALLOW_ONLINE_BOOKING !== "false";
    
    if (!allowOnlineBooking) {
      return NextResponse.json({ error: 'Online booking is currently disabled by the administrator.' }, { status: 403 });
    }
    
    // 1. Get turf capacity
    const turf = await prisma.turf.findUnique({ where: { id: turfId } });
    if (!turf) {
      return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
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
      return NextResponse.json({ 
        error: 'Slot is no longer available or insufficient courts.' 
      }, { status: 409 });
    }

    // Calculate SV Points Earned (e.g. 1% of total price as points)
    const pointsEarned = Math.floor(price * 0.01);

    // Fetch latest member wallet balance
    const memberData = await prisma.member.findUnique({ where: { id: member.id } });
    const currentWallet = memberData?.walletBalance || 0;
    
    // Validate Coupon if provided
    let discountAmount = 0;
    let validCouponId = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
        include: { usages: true, assignments: true }
      });
      
      if (coupon && coupon.isActive && (!coupon.expiryDate || new Date() <= coupon.expiryDate)) {
        // Evaluate target constraints
        let isAllowed = true;
        if (coupon.targetType === 'SPECIFIC_MEMBERS') {
          isAllowed = coupon.assignments.some(a => a.memberId === member.id);
        } else if (coupon.targetType === 'MILESTONE_ALL_TIME') {
          const userBookingsCount = await prisma.booking.count({ where: { memberId: member.id, status: 'COMPLETED' } });
          if (userBookingsCount < (coupon.milestoneBookingsCount || 0)) isAllowed = false;
        }

        // Global and per user limits
        if (coupon.maxUses !== null && coupon.usages.length >= coupon.maxUses) isAllowed = false;
        if (coupon.maxUsesPerUser !== null && coupon.usages.filter(u => u.memberId === member.id).length >= coupon.maxUsesPerUser) isAllowed = false;

        if (isAllowed) {
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
      }
    }

    const subtotal = price - discountAmount;
    
    // Wallet deduction rules
    let advancePaid = 0;
    if (walletAmountToUse > 0) {
      if (walletAmountToUse >= 100 || subtotal < 100) { // Enforce min 100 Rs cap, unless subtotal is < 100
        advancePaid = Math.min(walletAmountToUse, currentWallet, subtotal);
      }
    }
    
    const amountDue = subtotal - advancePaid;

    const queries: any[] = [];
    const bookingIdString = `cm${Date.now()}${Math.floor(Math.random()*1000)}`;

    let paymentStatus = "Due";
    if (amountDue === 0) {
      paymentStatus = advancePaid > 0 ? "Paid using Wallet" : "Paid"; // e.g. 100% coupon -> "Paid", Wallet -> "Paid using Wallet"
    } else if (advancePaid > 0) {
      paymentStatus = "Advance Paid";
    }

    // Create Booking
    const booking = await prisma.booking.create({
      data: {
        turfId,
        sportId,
        memberId: member.id,
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

    if (validCouponId) {
      queries.push(prisma.couponUsage.create({
        data: {
          couponId: validCouponId,
          memberId: member.id,
          bookingId: booking.id,
          discountAmount
        }
      }));
    }

    if (advancePaid > 0) {
      queries.push(
        prisma.member.update({
          where: { id: member.id },
          data: { walletBalance: { decrement: advancePaid } }
        })
      );
      queries.push(
        prisma.walletTransaction.create({
          data: {
            memberId: member.id,
            amount: advancePaid,
            type: 'DEBIT',
            description: `Payment for booking ${booking.id}`
          }
        })
      );
      queries.push(
        prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: advancePaid,
            method: 'WALLET'
          }
        })
      );
    }

    // Add points to Member
    if (pointsEarned > 0) {
      queries.push(
        prisma.member.update({
          where: { id: member.id },
          data: { loyaltyPoints: { increment: pointsEarned } }
        })
      );
      // Add History
      queries.push(
        prisma.loyaltyHistory.create({
          data: {
            memberId: member.id,
            points: pointsEarned,
            type: 'EARNED',
            source: 'BOOKING',
            description: `Earned from booking ${booking.id}`
          }
        })
      );
    }

    // Generate Tickets
    const tickets = [];
    for(let i = 0; i < participantCount; i++) {
      tickets.push({
        bookingId: booking.id,
        qrCode: `TICKET-${booking.id}-${i}-${Date.now()}`,
        guestName: body.guests && body.guests[i] ? body.guests[i].name : null
      });
    }

    queries.push(prisma.ticket.createMany({ data: tickets }));

    await prisma.$transaction(queries);

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
