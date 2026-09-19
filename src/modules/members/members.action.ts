"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import { prisma } from "@/core/database/prisma";
import {
  createMemberCore,
  createFamilyCore,
  updateMemberCore,
  deleteMemberCore,
  assignPlanCore,
  updateMemberMembershipCore,
  deleteMemberMembershipCore,
  resetWalletCore,
  CreateMemberInput,
  CreateFamilyInput,
  UpdateMemberInput,
  AssignPlanInput,
  UpdateMemberMembershipInput,
} from "./members.lib";
import { eventBus } from "@/core/events";
import { bumpSyncTimestamp } from "@/core/database/sync";
import { formatISTMembershipDate } from "./members.helper";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Admin session required");
  }
  return session;
}

export async function createMember(data: CreateMemberInput) {
  await requireAdminSession();
  const member = await createMemberCore(data);

  eventBus.emit("member.registered", {
    memberId: member.id,
    name: member.name,
    mobile: member.mobile,
  });

  await bumpSyncTimestamp("member");
  revalidatePath("/", "layout");
  return member;
}

export async function createFamily(data: CreateFamilyInput) {
  await requireAdminSession();
  const createdMembers = await createFamilyCore(data);

  for (const m of createdMembers) {
    eventBus.emit("member.registered", {
      memberId: m.id,
      name: m.name,
      mobile: m.mobile,
      isFamily: true,
    });
  }

  await bumpSyncTimestamp("member");
  revalidatePath("/", "layout");
  return createdMembers;
}

export async function updateMember(id: string, data: UpdateMemberInput) {
  await requireAdminSession();
  const member = await updateMemberCore(id, data);
  await bumpSyncTimestamp("member");
  revalidatePath("/", "layout");
  return member;
}

export async function deleteMember(id: string) {
  await requireAdminSession();
  await deleteMemberCore(id);
  await bumpSyncTimestamp("member");
  revalidatePath("/", "layout");
}

export async function assignPlan(data: AssignPlanInput) {
  await requireAdminSession();
  const { plan, createdMemberships } = await assignPlanCore(data);

  for (const mm of createdMemberships) {
    let turfName = "Sports Villa";
    if (data.turfId) {
      const turf = await prisma.turf.findUnique({ where: { id: data.turfId } });
      if (turf) turfName = turf.name;
    }
    const eligibleSlot = data.timeSlot || "Any open slot";
    const validUntil = formatISTMembershipDate(mm.endDate);

    eventBus.emit("membership.assigned", {
      memberId: mm.memberId,
      memberName: mm.member.name,
      mobile: mm.member.mobile,
      planName: plan.name,
      turfName,
      eligibleSlot,
      validUntil,
      actionType: "ASSIGNED",
    });
  }

  await bumpSyncTimestamp("member");
  revalidatePath("/", "layout");
  return createdMemberships;
}

export async function updateMemberMembership(id: string, data: UpdateMemberMembershipInput) {
  await requireAdminSession();
  const updated = await updateMemberMembershipCore(id, data);

  if (data.status === "EXPIRED") {
    const formattedDate = formatISTMembershipDate(updated.endDate);
    eventBus.emit("membership.expired", {
      memberId: updated.memberId,
      customerName: updated.member?.name || "Customer",
      mobile: updated.member?.mobile,
      planName: updated.membershipPlan?.name || "",
      expirationDate: formattedDate,
      registeredPhone: updated.member?.mobile,
    });
  }

  await bumpSyncTimestamp("member");
  revalidatePath("/", "layout");
  return updated;
}

export async function deleteMemberMembership(id: string) {
  await requireAdminSession();
  await deleteMemberMembershipCore(id);
  await bumpSyncTimestamp("member");
  revalidatePath("/", "layout");
}

export async function resetWallet(id: string) {
  await requireAdminSession();
  const { member, previousBalance } = await resetWalletCore(id);

  if (previousBalance > 0) {
    eventBus.emit("wallet.debited", {
      memberId: id,
      amount: previousBalance / 100,
      description: "Wallet reset by admin",
    });
  }

  await bumpSyncTimestamp("member");
  revalidatePath("/", "layout");
  return member;
}
