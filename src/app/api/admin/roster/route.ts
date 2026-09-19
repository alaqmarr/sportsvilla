import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/core/auth/rbac-definitions";
import { requireApiPermission } from "@/core/auth/serverRbac";
import { prisma } from "@/core/database/prisma";
import { formatIST, getISTDateBounds, todayIST } from "@/core/utils/dateUtils";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireApiPermission(PERMISSIONS.VIEW_BOOKINGS);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const turfIdParam = searchParams.get("turfId");

    let dateStr = todayIST();
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      dateStr = dateParam;
    }

    const { start: dayStart, end: dayEnd } = getISTDateBounds(dateStr);

    const [bookings, allTurfs] = await Promise.all([
      prisma.booking.findMany({
        where: {
          startTime: { gte: dayStart, lte: dayEnd },
          status: { not: "CANCELLED" },
          ...(turfIdParam ? { turfId: turfIdParam } : {}),
        },
        include: {
          turf: true,
          sport: true,
          member: {
            select: { id: true, name: true, mobile: true },
          },
          tickets: true,
          payments: true,
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.turf.findMany({
        include: {
          sports: {
            include: {
              sport: true,
            },
          },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const filteredTurfs = turfIdParam
      ? allTurfs.filter((t) => t.id === turfIdParam)
      : allTurfs;

    const turfsData = filteredTurfs.map((turf) => {
      const turfBookings = bookings.filter((b) => b.turfId === turf.id);
      const primarySport = turf.sports?.[0]?.sport?.name || "Turf Sport";

      const slots = turfBookings.map((b) => {
        const startFormatted = formatIST(b.startTime, "HH:mm");
        const endFormatted = formatIST(b.endTime, "HH:mm");
        return {
          id: b.id,
          bookingId: b.id,
          startTime: startFormatted,
          endTime: endFormatted,
          startDateTime: b.startTime.toISOString(),
          endDateTime: b.endTime.toISOString(),
          customerName: b.member?.name || "Guest Customer",
          customerPhone: b.member?.mobile || "",
          sport: b.sport?.name || primarySport,
          status: b.status,
          paymentStatus: b.paymentStatus,
          amount: b.price,
          amountDue: b.amountDue,
          advancePaid: b.advancePaid,
          ticketsCount: b.tickets?.length || 0,
          checkedInCount: b.tickets?.filter((t) => t.status === "CHECKED_IN").length || 0,
        };
      });

      return {
        id: turf.id,
        name: turf.name,
        sport: primarySport,
        location: turf.location || "",
        capacityPerSlot: turf.capacityPerSlot,
        slots,
      };
    });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const confirmedSlots = bookings.filter((b) => b.status === "CONFIRMED").length;
    const pendingSlots = bookings.filter((b) => b.status === "PAYMENT_PENDING").length;

    return NextResponse.json({
      success: true,
      date: dateStr,
      turfs: turfsData,
      summary: {
        totalBookings,
        totalRevenue,
        confirmedSlots,
        pendingSlots,
      },
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/admin/roster ->`, error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message },
      { status: 500 }
    );
  }
}
