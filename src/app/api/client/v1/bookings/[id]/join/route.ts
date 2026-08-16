import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { whatsappDb } from '@/lib/whatsappDb';
import { sendWhatsAppPlayerJoinedNotification } from '@/lib/whatsapp';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  apiLog(`[API] POST /api/client/v1/bookings/[id]/join called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { member } = authRes;
  const params = await context.params;
  const bookingId = params.id;

  try {
    const body = await request.json().catch(() => ({}));
    const { walletAmountToUse = 0, walletOtp, pointsAmountToUse = 0, couponCode } = body;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        participants: true,
        turf: true,
      },
    });

    if (!booking) {
      return jsonResponse({ error: 'Game not found' }, { status: 404 });
    }

    if (booking.status === 'CANCELLED') {
      return jsonResponse({ error: 'This game has been cancelled.' }, { status: 400 });
    }

    if (new Date(booking.startTime) < new Date()) {
      return jsonResponse({ error: 'Cannot join a game in the past.' }, { status: 400 });
    }

    const alreadyJoined = booking.participants.some((p) => p.memberId === member.id);
    if (alreadyJoined) {
      return jsonResponse({ error: 'You have already joined this game.' }, { status: 400 });
    }

    const maxPlayers = booking.inviteMaxCount || (booking.turf?.capacityPerSlot || 1) * 2;
    if (booking.participantCount >= maxPlayers) {
      return jsonResponse({ error: 'Game is full. Maximum player limit reached.' }, { status: 409 });
    }

    // --- Payment Calculation ---
    // Joiner pays a fraction of the total price
    const joinerPrice = booking.price / maxPlayers;

    // Validate Coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: String(couponCode).toUpperCase() }
      });
      if (coupon && coupon.isActive) {
        if (coupon.discountAmount !== null && coupon.discountAmount > 0) {
          discountAmount = coupon.discountAmount;
        } else if (coupon.discountPercentage !== null && coupon.discountPercentage > 0) {
          discountAmount = (joinerPrice * coupon.discountPercentage) / 100;
        }
        if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
        if (discountAmount > joinerPrice) discountAmount = joinerPrice;
        discountAmount = Math.floor(discountAmount);
      }
    }

    const subtotal = joinerPrice - discountAmount;
    
    const memberData = await prisma.member.findUnique({ where: { id: member.id } });
    const currentWallet = memberData?.walletBalance || 0;
    const currentPoints = memberData?.loyaltyPoints || 0;

    let walletDeductionRupees = 0;
    const requestedWallet = Number(walletAmountToUse) || 0;
    if (requestedWallet > 0) {
      walletDeductionRupees = Math.min(requestedWallet, currentWallet / 100, subtotal);
    }
    
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
    
    let pointsDeduction = 0;
    const requestedPoints = Number(pointsAmountToUse) || 0;
    if (requestedPoints > 0) {
      pointsDeduction = Math.min(requestedPoints, currentPoints, subtotal - walletDeductionRupees);
    }

    // Calculate SV Points Earned on subtotal (net amount)
    const pointsEarned = Math.floor(subtotal * 0.01);

    await prisma.$transaction(async (tx) => {
      // Create participant
      await tx.bookingParticipant.create({
        data: {
          bookingId: booking.id,
          memberId: member.id,
          status: 'CONFIRMED',
        },
      });

      // Update booking count
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          participantCount: {
            increment: 1,
          },
        },
      });

      // Deduct Wallet
      if (walletDeductionRupees > 0) {
        await tx.member.update({
          where: { id: member.id },
          data: { walletBalance: { decrement: Math.floor(walletDeductionRupees * 100) } }
        });
        
        await tx.walletTransaction.create({
          data: {
            amount: Math.floor(walletDeductionRupees * 100),
            type: 'DEBIT',
            memberId: member.id,
            description: `Used wallet to join game: ${booking.turf?.name}`
          }
        });
      }

      // Deduct Points
      if (pointsDeduction > 0) {
        await tx.member.update({
          where: { id: member.id },
          data: { loyaltyPoints: { decrement: pointsDeduction } }
        });
        
        await tx.loyaltyHistory.create({
          data: {
            memberId: member.id,
            points: pointsDeduction,
            type: 'REDEEMED',
            source: 'BOOKING',
            description: `Redeemed to join game ${booking.id}`
          }
        });
      }

      // Earn Points
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
            description: `Points earned for joining game ${booking.id}`
          }
        });
      }
    });

    const updatedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        turf: true,
        sport: true,
        member: { select: { id: true, name: true, mobile: true } },
        participants: {
          include: {
            member: { select: { id: true, name: true, mobile: true } },
          },
        },
      },
    });

    // Notify host via WhatsApp when someone joins their game
    if (updatedBooking && updatedBooking.member && updatedBooking.memberId !== member.id) {
      const hostPhone = updatedBooking.member.mobile || (updatedBooking.member as any).phone;
      if (hostPhone) {
        const hostName = updatedBooking.member.name || "Host";
        const playerName = member.name || "A Player";
        const sportName = updatedBooking.sport?.name || "Sports";
        const courtName = updatedBooking.turf?.name || "SportsVilla Court";
        const dateStr = new Date(updatedBooking.startTime).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        });
        const spotsLeft = Math.max(0, (updatedBooking.inviteMaxCount || 4) - updatedBooking.participantCount);

        // Run non-blocking so API returns fast
        sendWhatsAppPlayerJoinedNotification(
          hostPhone,
          hostName,
          playerName,
          sportName,
          courtName,
          dateStr,
          spotsLeft
        ).catch(e => console.error("Failed to notify host via WhatsApp:", e));
      }
    }

    return jsonResponse({
      success: true,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/bookings/[id]/join ->`, error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  apiLog(`[API] DELETE /api/client/v1/bookings/[id]/join called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { member } = authRes;
  const params = await context.params;
  const bookingId = params.id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { participants: true },
    });

    if (!booking) {
      return jsonResponse({ error: 'Game not found' }, { status: 404 });
    }

    const url = new URL(request.url);
    const targetMemberId = url.searchParams.get('targetMemberId');
    const memberToRemoveId = targetMemberId || member.id;

    if (targetMemberId) {
      if (booking.memberId !== member.id) {
        return jsonResponse({ error: 'Only the host can remove players.' }, { status: 403 });
      }
      if (targetMemberId === booking.memberId) {
        return jsonResponse({ error: 'Host cannot be removed from the game.' }, { status: 400 });
      }
    } else if (booking.memberId === member.id) {
      return jsonResponse({ error: 'Host cannot leave their own game. Please cancel the booking instead.' }, { status: 400 });
    }

    const participant = booking.participants.find((p) => p.memberId === memberToRemoveId);
    if (!participant) {
      return jsonResponse({ error: 'Player is not a participant in this game.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.bookingParticipant.deleteMany({
        where: {
          bookingId: booking.id,
          memberId: memberToRemoveId,
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          participantCount: {
            decrement: 1,
          },
        },
      });
    });

    return jsonResponse({
      success: true,
      message: 'Successfully left the game',
    });
  } catch (error: any) {
    console.error(`[API ERROR] DELETE /api/client/v1/bookings/[id]/join ->`, error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
