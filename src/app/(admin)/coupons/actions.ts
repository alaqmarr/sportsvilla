"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCoupon(data: {
  code: string;
  discountAmount?: number | null;
  discountPercentage?: number | null;
  maxDiscount?: number | null;
  maxUses?: number | null;
  maxUsesPerUser?: number | null;
  expiryDate?: string | null;
  appOnly: boolean;
  targetType: string; // EVERYONE, SPECIFIC_MEMBERS, MILESTONE_ALL_TIME, MILESTONE_FROM_CREATION
  milestoneBookingsCount?: number | null;
  assignedMemberIds?: string[];
  isPublic: boolean;
}) {
  const existing = await prisma.coupon.findUnique({ where: { code: data.code.toUpperCase() } });
  if (existing) {
    throw new Error("A coupon with this code already exists.");
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      discountAmount: data.discountAmount || null,
      discountPercentage: data.discountPercentage || null,
      maxDiscount: data.maxDiscount || null,
      maxUses: data.maxUses || null,
      maxUsesPerUser: data.maxUsesPerUser || null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      appOnly: data.appOnly,
      isPublic: data.isPublic,
      targetType: data.targetType,
      milestoneBookingsCount: data.milestoneBookingsCount || null,
      assignments: data.targetType === "SPECIFIC_MEMBERS" && data.assignedMemberIds?.length
        ? {
            create: data.assignedMemberIds.map(id => ({ memberId: id }))
          }
        : undefined
    }
  });

  revalidatePath("/", "layout");
  return coupon;
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  await prisma.coupon.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath("/", "layout");
}
