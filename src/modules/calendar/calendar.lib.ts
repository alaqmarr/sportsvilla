import { prisma } from "@/core/database/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function fetchCalendarDataCore(dateStr: string) {
  const date = new Date(dateStr);
  const start = startOfDay(date);
  const end = endOfDay(date);

  const turfs = await prisma.turf.findMany({
    orderBy: { name: "asc" },
  });

  const bookings = await prisma.booking.findMany({
    where: {
      startTime: {
        gte: start,
        lte: end,
      },
      status: "CONFIRMED",
    },
    include: {
      member: {
        select: { name: true, mobile: true },
      },
    },
  });

  return { turfs, bookings };
}
