import { NextRequest, NextResponse } from "next/server";
import { requireApiPermission } from "@/core/auth/serverRbac";
import { PERMISSIONS } from "../permissions";
import { prisma } from "@/core/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireApiPermission(PERMISSIONS.VIEW_WHATSAPP);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phoneNumber") || searchParams.get("phone") || "";
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    if (!cleanPhone || cleanPhone.length < 5) {
      return NextResponse.json(
        {
          success: false,
          status: "error",
          message: "Invalid phone number",
          found: false,
          count: 0,
          members: [],
        },
        { status: 400 }
      );
    }

    // Find all members (including family accounts) matching this mobile number
    const members = await prisma.member.findMany({
      where: {
        mobile: {
          contains: cleanPhone,
        },
      },
      include: {
        memberships: {
          where: {
            status: "ACTIVE",
          },
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
      success: true,
      status: "ok",
      found: members.length > 0,
      count: members.length,
      members,
      member: members[0] || null,
    });
  } catch (err: any) {
    console.error("[API ERROR] GET /api/admin/whatsapp/member-context ->", err);
    return NextResponse.json(
      {
        success: false,
        status: "error",
        message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
        found: false,
        count: 0,
        members: [],
      },
      { status: 500 }
    );
  }
}
