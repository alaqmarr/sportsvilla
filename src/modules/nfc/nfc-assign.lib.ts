import { prisma } from "@/core/database/prisma";
import { NfcCardAssignmentPayload } from "@/types/nfc";
import { normalizeCardUid } from "./nfc.helper";

export interface AdminActor {
  id: string;
  name?: string | null;
  email: string;
}

export async function searchMembersCore(query: string) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  return await prisma.member.findMany({
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
}

export async function assignCardCore(data: NfcCardAssignmentPayload, admin: AdminActor) {
  const normalizedUid = normalizeCardUid(data.cardUid);
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
    const existingCard = await tx.nfcCard.findUnique({
      where: { cardUid: normalizedUid },
      include: { member: true },
    });

    let cardRecord;

    if (existingCard) {
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

    return { success: true, card: cardRecord };
  });
}

export async function blockCardCore(cardId: string, reason: string | undefined, admin: AdminActor) {
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

  return { success: true, card: updatedCard };
}

export async function unblockCardCore(cardId: string, admin: AdminActor) {
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

  return { success: true, card: updatedCard };
}

export async function revokeCardCore(cardId: string, reason: string | undefined, admin: AdminActor) {
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

  return { success: true, card: updatedCard };
}

export async function getCardInventoryCore(filters?: { query?: string; status?: string }) {
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
