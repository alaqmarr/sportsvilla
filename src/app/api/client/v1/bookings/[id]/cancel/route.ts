import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;
  const params = await context.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { payments: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.memberId !== member.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ success: false, error: "Booking is already cancelled" }, { status: 400 });
    }

    // Check global settings
    const globalSettings = await prisma.setting.findMany();
    const settingsMap = globalSettings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
    
    const allowCancellation = settingsMap.ALLOW_CANCELLATION !== "false";
    if (!allowCancellation) {
      return NextResponse.json({ success: false, error: 'Cancellation is currently disabled by the administrator.' }, { status: 403 });
    }
    
    const limitHours = parseInt(settingsMap.CLIENT_CANCELLATION_LIMIT_HOURS || "3", 10);
    
    if (limitHours > 0) {
      const now = new Date();
      const diffMs = booking.startTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours < limitHours) {
        return NextResponse.json({ success: false, error: `You can only cancel bookings at least ${limitHours} hours before the start time.` }, { status: 400 });
      }
    }

    // Calculate total paid to refund to wallet
    const totalPaid = booking.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

    const queries: any[] = [
      prisma.booking.update({
        where: { id: params.id },
        data: { status: "CANCELLED" }
      })
    ];

    let updateData: any = {};
    if (booking.pointsRedeemed > 0) {
      updateData.loyaltyPoints = { increment: booking.pointsRedeemed };
      queries.push(
        prisma.loyaltyHistory.create({
          data: {
            memberId: booking.memberId,
            points: booking.pointsRedeemed,
            type: "EARNED",
            source: "MANUAL",
            description: "Refund for cancelled booking"
          }
        })
      );
    }

    if (totalPaid > 0) {
      updateData.walletBalance = { increment: totalPaid };
      queries.push(
        prisma.walletTransaction.create({
          data: {
            memberId: booking.memberId,
            amount: totalPaid,
            type: 'CREDIT',
            description: `Refund for cancelled booking ${booking.id}`
          }
        })
      );
    }

    if (Object.keys(updateData).length > 0) {
      queries.push(
        prisma.member.update({
          where: { id: booking.memberId },
          data: updateData
        })
      );
    }
    
    await prisma.$transaction(queries);

    return NextResponse.json({ success: true, message: "Booking cancelled successfully and amount refunded to wallet." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
