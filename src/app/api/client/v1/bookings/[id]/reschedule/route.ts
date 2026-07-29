import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { bumpSyncTimestamp } from '@/lib/sync';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  apiLog(`[API] POST /api/client/v1/bookings/[id]/reschedule called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;
  const params = await context.params;

  try {
    const body = await request.json();
    const { newStartTime, newEndTime } = body;
    
    if (!newStartTime || !newEndTime) {
      return jsonResponse({ success: false, error: "Missing new time fields" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { turf: true }
    });

    if (!booking) {
      return jsonResponse({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Allow family members to reschedule each other's bookings
    const familyMembers = await prisma.member.findMany({
      where: { mobile: member.mobile },
      select: { id: true }
    });
    const familyIds = familyMembers.map(m => m.id);
    if (!familyIds.includes(booking.memberId)) {
      return jsonResponse({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status === "CANCELLED") {
      return jsonResponse({ success: false, error: "Cannot reschedule a cancelled booking" }, { status: 400 });
    }

    // Bug #13: Block rescheduling of past/started bookings regardless of limitHours
    const now = new Date();
    if (booking.startTime <= now) {
      return jsonResponse({ success: false, error: "Cannot reschedule a booking that has already started or is in the past." }, { status: 400 });
    }

    // Check global settings
    const globalSettings = await prisma.setting.findMany();
    const settingsMap = globalSettings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
    
    const allowRescheduling = settingsMap.ALLOW_RESCHEDULING !== "false";
    if (!allowRescheduling) {
      return jsonResponse({ success: false, error: 'Rescheduling is currently disabled by the administrator.' }, { status: 403 });
    }
    
    const limitHours = parseInt(settingsMap.CLIENT_CANCELLATION_LIMIT_HOURS || "3", 10);
    
    if (limitHours > 0) {
      const diffMs = booking.startTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours < limitHours) {
        return jsonResponse({ success: false, error: `You can only reschedule bookings at least ${limitHours} hours before the start time.` }, { status: 400 });
      }
    }

    const start = new Date(newStartTime);
    const end = new Date(newEndTime);

    // Block rescheduling to a past time
    if (start < now) {
      return jsonResponse({ success: false, error: "Cannot reschedule to a past time slot." }, { status: 400 });
    }

    // Verify duration hasn't changed
    const oldDuration = booking.endTime.getTime() - booking.startTime.getTime();
    const newDuration = end.getTime() - start.getTime();
    if (oldDuration !== newDuration) {
      return jsonResponse({ success: false, error: "Duration must remain the same." }, { status: 400 });
    }

    // Bug fix: Wrap availability check + update in transaction to prevent race conditions
    await prisma.$transaction(async (tx) => {
      const overlappingBookings = await tx.booking.findMany({
        where: {
          id: { not: booking.id },
          turfId: booking.turfId,
          status: { not: "CANCELLED" },
          startTime: { lt: end },
          endTime: { gt: start }
        }
      });

      const usedCapacity = overlappingBookings.reduce((sum, b) => sum + b.participantCount, 0);
      const turf = booking.turf;
      const availableCourts = (turf?.capacityPerSlot || 1) - usedCapacity;

      if (booking.participantCount > availableCourts) {
        throw new Error("SLOT_UNAVAILABLE");
      }

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          startTime: start,
          endTime: end
        }
      });
    });

    await bumpSyncTimestamp('booking_reschedule');
    return jsonResponse({ success: true, message: "Booking rescheduled successfully." });
  } catch (error: any) {
    if (error.message === 'SLOT_UNAVAILABLE') {
      return jsonResponse({ success: false, error: "The selected time slot does not have enough capacity." }, { status: 400 });
    }
    console.error(`[API ERROR] POST /api/client/v1/bookings/[id]/reschedule ->`, error);
    return jsonResponse({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
