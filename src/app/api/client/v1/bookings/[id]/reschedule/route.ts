import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;
  const params = await context.params;

  try {
    const body = await request.json();
    const { newStartTime, newEndTime } = body;
    
    if (!newStartTime || !newEndTime) {
      return NextResponse.json({ success: false, error: "Missing new time fields" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (booking.memberId !== member.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ success: false, error: "Cannot reschedule a cancelled booking" }, { status: 400 });
    }

    // Check global settings
    const globalSettings = await prisma.setting.findMany();
    const settingsMap = globalSettings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
    
    const allowRescheduling = settingsMap.ALLOW_RESCHEDULING !== "false";
    if (!allowRescheduling) {
      return NextResponse.json({ success: false, error: 'Rescheduling is currently disabled by the administrator.' }, { status: 403 });
    }
    
    const limitHours = parseInt(settingsMap.CLIENT_CANCELLATION_LIMIT_HOURS || "3", 10);
    
    if (limitHours > 0) {
      const now = new Date();
      const diffMs = booking.startTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours < limitHours) {
        return NextResponse.json({ success: false, error: `You can only reschedule bookings at least ${limitHours} hours before the start time.` }, { status: 400 });
      }
    }

    const start = new Date(newStartTime);
    const end = new Date(newEndTime);

    // Verify duration hasn't changed (optional but good for security to prevent extending for free)
    const oldDuration = booking.endTime.getTime() - booking.startTime.getTime();
    const newDuration = end.getTime() - start.getTime();
    if (oldDuration !== newDuration) {
      return NextResponse.json({ success: false, error: "Duration must remain the same." }, { status: 400 });
    }

    // Check for conflicts
    const conflict = await prisma.booking.findFirst({
      where: {
        id: { not: booking.id },
        turfId: booking.turfId,
        status: { not: "CANCELLED" },
        startTime: { lt: end },
        endTime: { gt: start }
      }
    });

    if (conflict) {
      return NextResponse.json({ success: false, error: "The selected time slot is already booked." }, { status: 400 });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        startTime: start,
        endTime: end
      }
    });

    return NextResponse.json({ success: true, message: "Booking rescheduled successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
