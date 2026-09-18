import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import { sendMembershipPush } from "@/lib/notifications";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.admin.findFirst({ where: { email: session.user.email } });
    if (!admin || (!hasPermission(admin, "manage:whatsapp") && !hasPermission(admin, "manage:members"))) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { action, phone, memberId, name, email, planId, discountAmount } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone is required" }, { status: 400 });
    }

    if (action === "REGISTER") {
      const existing = await prisma.member.findFirst({ where: { mobile: phone, name: name } });
      if (existing) {
        return NextResponse.json({ success: false, error: "Member already exists with this name and mobile" }, { status: 400 });
      }

      // Check if there's already a member to inherit family
      const primary = await prisma.member.findFirst({ where: { mobile: phone } });
      
      const member = await prisma.member.create({
        data: {
          mobile: phone,
          name: name || "WhatsApp Lead",
          email: email || null,
          walletBalance: 0,
          familyId: primary?.familyId || null,
        },
      });
      return NextResponse.json({ success: true, member });
    }

    if (action === "ASSIGN_MEMBERSHIP") {
      let member;
      if (memberId) {
        member = await prisma.member.findUnique({ where: { id: memberId } });
      } else {
        member = await prisma.member.findFirst({ where: { mobile: phone } });
      }

      if (!member) {
        return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
      }
      if (!planId) {
        return NextResponse.json({ success: false, error: "Plan ID is required" }, { status: 400 });
      }

      const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
      if (!plan) {
        return NextResponse.json({ success: false, error: "Plan not found" }, { status: 404 });
      }

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.durationInDays);

      const membership = await prisma.memberMembership.create({
        data: {
          memberId: member.id,
          membershipPlanId: plan.id,
          status: "ACTIVE",
          startDate: new Date(),
          endDate,
        },
      });

      sendMembershipPush(member.id, plan.name, 'ASSIGNED').catch((pushErr) => {
        logger.error('[Push Hook Error] WhatsApp CRM membership push failed', pushErr);
      });

      return NextResponse.json({ success: true, membership });
    }

    if (action === "GENERATE_COUPON") {
      // Find the member
      let member;
      if (memberId) {
        member = await prisma.member.findUnique({ where: { id: memberId } });
      } else {
        member = await prisma.member.findFirst({ where: { mobile: phone } });
      }
      
      const code = `VIP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${phone.substring(6)}`;
      
      const coupon = await prisma.coupon.create({
        data: {
          code,
          discountAmount: discountAmount || 100,
          type: "DISCOUNT",
          isActive: true,
          maxUses: 1, // one-time use
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // valid for 7 days
          appOnly: false,
          isPublic: false,
          targetType: "SPECIFIC_MEMBERS",
        },
      });

      if (member) {
        await prisma.couponAssignment.create({
          data: {
            couponId: coupon.id,
            memberId: member.id,
          }
        });
      }

      return NextResponse.json({ success: true, coupon });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("WhatsApp CRM API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const plans = await prisma.membershipPlan.findMany();

    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
