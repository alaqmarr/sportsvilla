'use server'

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function fetchCalendarData(dateStr: string) {
  const date = new Date(dateStr);
  const start = startOfDay(date);
  const end = endOfDay(date);

  const turfs = await prisma.turf.findMany({
    orderBy: { name: 'asc' }
  });

  const bookings = await prisma.booking.findMany({
    where: {
      startTime: {
        gte: start,
        lte: end
      },
      status: 'CONFIRMED'
    },
    include: {
      member: {
        select: { name: true, mobile: true }
      }
    }
  });

  return { turfs, bookings };
}
