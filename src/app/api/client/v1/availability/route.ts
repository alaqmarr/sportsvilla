import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { formatIST } from '@/lib/dateUtils';

export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/availability called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  const sportId = searchParams.get('sportId');

  if (!dateStr || !sportId) {
    return jsonResponse({ error: 'date and sportId are required' }, { status: 400 });
  }

  try {
    // 1. Fetch turfs that support this sport
    const turfs = await prisma.turf.findMany({
      where: {
        sports: {
          some: { sportId }
        }
      }
    });

    if (turfs.length === 0) {
      return jsonResponse({ success: true, turfs: [] });
    }

    // 2. Define Time Boundaries for the given date (local time assumption)
    // We assume dateStr is 'YYYY-MM-DD'
    const startOfDay = new Date(`${dateStr}T00:00:00.000+05:30`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999+05:30`);

    // 3. Fetch all active bookings for these turfs on this date
    const turfIds = turfs.map(t => t.id);
    const activeBookings = await prisma.booking.findMany({
      where: {
        turfId: { in: turfIds },
        status: { not: 'CANCELLED' },
        startTime: { gte: startOfDay, lte: endOfDay }
      }
    });

    // 4. Generate Slots (Default 6 AM to 11 PM)
    const OPEN_HOUR = 6;
    const CLOSE_HOUR = 23;

    const result = turfs.map(turf => {
      const duration = turf.bookingDurationMinutes || 60;
      const price = turf.bookingPrice || 600;
      const capacity = turf.capacityPerSlot || 1;
      
      const slots = [];
      let currentHour = OPEN_HOUR;
      let currentMin = 0;

      while (currentHour < CLOSE_HOUR) {
        // Safe cross-timezone construction
        const slotStart = new Date(`${dateStr}T${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}:00+05:30`);
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);

        // Calculate used capacity based on time overlap intersection
        const overlappingBookings = activeBookings.filter(b => 
          b.turfId === turf.id && 
          b.startTime.getTime() < slotEnd.getTime() &&
          b.endTime.getTime() > slotStart.getTime()
        );

        const usedCapacity = overlappingBookings.reduce((sum, b) => sum + (b.participantCount || 1), 0);
        const availableCourts = Math.max(0, capacity - usedCapacity);
        const isAvailable = availableCourts > 0;

        if (slotStart.getTime() > Date.now()) {
          slots.push({
            time: formatIST(slotStart, 'hh:mm a'),
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            price,
            availableCourts,
            available: isAvailable
          });
        }

        // Increment time
        currentMin += duration;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
      }

      return {
        id: turf.id,
        name: turf.name,
        iconPath: turf.iconPath,
        capacityPerSlot: capacity,
        slots
      };
    });

    return jsonResponse({ success: true, turfs: result });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/availability ->`, error);
    console.error('Availability fetch error:', error);
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
