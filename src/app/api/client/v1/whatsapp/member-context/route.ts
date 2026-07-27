import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone") || "";
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    if (!cleanPhone || cleanPhone.length < 5) {
      return NextResponse.json({ status: "error", message: "Invalid phone number" }, { status: 400 });
    }

    // Find all members (including family accounts) sharing this mobile number
    const members = await prisma.member.findMany({
      where: {
        mobile: {
          contains: cleanPhone,
        },
      },
      include: {
        memberships: {
          include: {
            membershipPlan: {
              include: {
                sport: true,
              },
            },
          },
          orderBy: {
            endDate: "desc",
          },
        },
        bookings: {
          take: 3,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            turf: true,
            sport: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      status: "ok",
      found: members.length > 0,
      count: members.length,
      members,
    });
  } catch (err: any) {
    console.error("Error fetching CRM member context:", err);
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
