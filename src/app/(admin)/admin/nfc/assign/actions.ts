"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { bumpSyncTimestamp } from "@/lib/sync";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { NfcCardAssignmentPayload } from "@/types/nfc";

async function verifyAdminPermission() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please log in");
  }

  const admin = await prisma.admin.findFirst({
    where: { email: session.user.email },
  });

  if (!admin || !admin.isActive) {
    throw new Error("Unauthorized: Active admin account required");
  }

  if (admin.role !== "SUPERADMIN" && !hasPermission(admin, "manage:nfc")) {
    throw new Error("Forbidden: Missing manage:nfc permission");
  }

  return admin;
}

/**
 * Normalizes card UID by removing colons, dashes, spaces, and converting to uppercase hex.
 */
export async function normalizeCardUid(rawUid: string): Promise<string> {
  return rawUid.trim().replace(/[^a-fA-F0-9]/g, "").toUpperCase();
}

/**
 * Searches members by name or mobile number for card assignment.
 */
export async function searchMembers(query: string) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const members = await prisma.member.findMany({
    where: {
      OR: [
        { name: { contains: trimmed } },
        { mobile: { contains: trimmed } },
        { email: { contains: trimmed } },
      ],
    },
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
      walletBalance: true,
      nfcCards: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          cardUid: true,
          cardId: true,
          status: true,
          issuedAt: true,
        },
      },
    },
    take: 10,
    orderBy: { updatedAt: "desc" },
  });

  return members;
}

/**
 * Assigns or reassigns an NFC card to a member.
 */
export async function assignCard(data: NfcCardAssignmentPayload) {
  const admin = await verifyAdminPermission();

  const normalizedUid = await normalizeCardUid(data.cardUid);
  if (!normalizedUid || normalizedUid.length < 4) {
    throw new Error("Invalid Card UID. Must contain at least 4 alphanumeric hex characters.");
  }

  if (!data.memberId) {
    throw new Error("A valid member must be selected.");
  }

  const member = await prisma.member.findUnique({
    where: { id: data.memberId },
  });

  if (!member) {
    throw new Error("Target member not found.");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Check if this card UID is already registered
    const existingCard = await tx.nfcCard.findUnique({
      where: { cardUid: normalizedUid },
      include: { member: true },
    });

    let cardRecord;

    if (existingCard) {
      // Reassign or update card
      cardRecord = await tx.nfcCard.update({
        where: { id: existingCard.id },
        data: {
          memberId: data.memberId,
          cardId: data.cardId?.trim() || existingCard.cardId || null,
          status: "ACTIVE",
          notes: data.notes?.trim() || existingCard.notes || null,
          assignedBy: admin.name || admin.email,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new card
      cardRecord = await tx.nfcCard.create({
        data: {
          cardUid: normalizedUid,
          cardId: data.cardId?.trim() || null,
          memberId: data.memberId,
          status: "ACTIVE",
          notes: data.notes?.trim() || null,
          assignedBy: admin.name || admin.email,
        },
      });
    }

    // 2. Audit log creation
    await tx.auditLog.create({
      data: {
        action: existingCard ? "NFC_CARD_REASSIGN" : "NFC_CARD_ASSIGN",
        entity: "NfcCard",
        entityId: cardRecord.id,
        details: JSON.stringify({
          cardUid: normalizedUid,
          cardId: cardRecord.cardId,
          memberId: data.memberId,
          memberName: member.name,
          memberMobile: member.mobile,
          previousMemberId: existingCard?.memberId || null,
        }),
        adminId: admin.id,
        adminName: admin.name || admin.email,
      },
    });

    await bumpSyncTimestamp("nfc");
    revalidatePath("/admin/nfc/assign");
    revalidatePath("/admin/nfc/transactions");

    return { success: true, card: cardRecord };
  });
}

/**
 * Blocks an NFC card (e.g. lost, stolen, or suspicious activity).
 */
export async function blockCard(cardId: string, reason?: string) {
  const admin = await verifyAdminPermission();

  const card = await prisma.nfcCard.findUnique({
    where: { id: cardId },
    include: { member: true },
  });

  if (!card) throw new Error("Card not found");

  const updatedNotes = reason
    ? `${card.notes ? card.notes + " | " : ""}Blocked: ${reason}`
    : card.notes;

  const updatedCard = await prisma.nfcCard.update({
    where: { id: cardId },
    data: {
      status: "BLOCKED",
      notes: updatedNotes,
      updatedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "NFC_CARD_BLOCK",
      entity: "NfcCard",
      entityId: card.id,
      details: JSON.stringify({
        cardUid: card.cardUid,
        memberId: card.memberId,
        reason: reason || "Admin blocked card",
      }),
      adminId: admin.id,
      adminName: admin.name || admin.email,
    },
  });

  await bumpSyncTimestamp("nfc");
  revalidatePath("/admin/nfc/assign");
  return { success: true, card: updatedCard };
}

/**
 * Unblocks an NFC card and restores it to ACTIVE status.
 */
export async function unblockCard(cardId: string) {
  const admin = await verifyAdminPermission();

  const card = await prisma.nfcCard.findUnique({
    where: { id: cardId },
  });

  if (!card) throw new Error("Card not found");

  const updatedCard = await prisma.nfcCard.update({
    where: { id: cardId },
    data: {
      status: "ACTIVE",
      updatedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "NFC_CARD_UNBLOCK",
      entity: "NfcCard",
      entityId: card.id,
      details: JSON.stringify({ cardUid: card.cardUid, memberId: card.memberId }),
      adminId: admin.id,
      adminName: admin.name || admin.email,
    },
  });

  await bumpSyncTimestamp("nfc");
  revalidatePath("/admin/nfc/assign");
  return { success: true, card: updatedCard };
}

/**
 * Revokes / unassigns an NFC card from its member, marking it INACTIVE.
 */
export async function revokeCard(cardId: string, reason?: string) {
  const admin = await verifyAdminPermission();

  const card = await prisma.nfcCard.findUnique({
    where: { id: cardId },
  });

  if (!card) throw new Error("Card not found");

  const updatedNotes = reason
    ? `${card.notes ? card.notes + " | " : ""}Revoked: ${reason}`
    : card.notes;

  const updatedCard = await prisma.nfcCard.update({
    where: { id: cardId },
    data: {
      memberId: null,
      status: "INACTIVE",
      notes: updatedNotes,
      updatedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "NFC_CARD_REVOKE",
      entity: "NfcCard",
      entityId: card.id,
      details: JSON.stringify({
        cardUid: card.cardUid,
        previousMemberId: card.memberId,
        reason: reason || "Admin revoked card",
      }),
      adminId: admin.id,
      adminName: admin.name || admin.email,
    },
  });

  await bumpSyncTimestamp("nfc");
  revalidatePath("/admin/nfc/assign");
  return { success: true, card: updatedCard };
}

/**
 * Fetches the card inventory with optional query filter.
 */
export async function getCardInventory(filters?: { query?: string; status?: string }) {
  const where: any = {};

  if (filters?.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters?.query && filters.query.trim()) {
    const q = filters.query.trim();
    where.OR = [
      { cardUid: { contains: q } },
      { cardId: { contains: q } },
      { member: { name: { contains: q } } },
      { member: { mobile: { contains: q } } },
    ];
  }

  return await prisma.nfcCard.findMany({
    where,
    include: {
      member: {
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
          walletBalance: true,
        },
      },
      _count: {
        select: {
          transactions: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}
