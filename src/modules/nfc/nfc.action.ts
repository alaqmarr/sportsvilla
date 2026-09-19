"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import { prisma } from "@/core/database/prisma";
import { hasPermission } from "@/core/auth/rbac";
import { NfcCardAssignmentPayload, NfcTransactionFilter, NfcTransactionStats } from "@/types/nfc";
import { normalizeCardUid as normalizeCardUidHelper } from "./nfc.helper";
import {
  searchMembersCore,
  assignCardCore,
  blockCardCore,
  unblockCardCore,
  revokeCardCore,
  getCardInventoryCore,
} from "./nfc-assign.lib";
import {
  getMemberDetailsByCardCore,
  lookupCardOwnerCore,
} from "./nfc-lookup.lib";
import {
  getNfcStatsCore,
  getNfcTransactionsCore,
} from "./nfc-transactions.lib";
import {
  creditWalletCore,
  deductWalletCore,
} from "./nfc-wallet.lib";
import {
  getKioskFacilitiesCore,
  fetchKioskAvailableSlotsCore,
  createKioskBookingCore,
  confirmKioskRazorpayPaymentCore,
  findMembersByMobileCore,
  type CreateKioskBookingInput,
} from "./nfc-kiosk.lib";
import { eventBus } from "@/core/events";
import { bumpSyncTimestamp } from "@/core/database/sync";

async function bumpNfcSync() {
  await bumpSyncTimestamp("nfc");
}

async function verifyNfcAdminPermission(permission: "manage:nfc" | "view:nfc" = "manage:nfc") {
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

  if (admin.role !== "SUPERADMIN" && !hasPermission(admin, permission)) {
    throw new Error(`Forbidden: Missing ${permission} permission`);
  }

  return admin;
}

export async function normalizeCardUid(rawUid: string): Promise<string> {
  return normalizeCardUidHelper(rawUid);
}

export async function searchMembers(query: string) {
  return await searchMembersCore(query);
}

export async function assignCard(data: NfcCardAssignmentPayload) {
  const admin = await verifyNfcAdminPermission("manage:nfc");
  const result = await assignCardCore(data, admin);

  await bumpNfcSync();
  revalidatePath("/admin/nfc/assign");
  revalidatePath("/admin/nfc/transactions");

  return result;
}

export async function blockCard(cardId: string, reason?: string) {
  const admin = await verifyNfcAdminPermission("manage:nfc");
  const result = await blockCardCore(cardId, reason, admin);

  await bumpNfcSync();
  revalidatePath("/admin/nfc/assign");
  return result;
}

export async function unblockCard(cardId: string) {
  const admin = await verifyNfcAdminPermission("manage:nfc");
  const result = await unblockCardCore(cardId, admin);

  await bumpNfcSync();
  revalidatePath("/admin/nfc/assign");
  return result;
}

export async function revokeCard(cardId: string, reason?: string) {
  const admin = await verifyNfcAdminPermission("manage:nfc");
  const result = await revokeCardCore(cardId, reason, admin);

  await bumpNfcSync();
  revalidatePath("/admin/nfc/assign");
  return result;
}

export async function getCardInventory(filters?: { query?: string; status?: string }) {
  return await getCardInventoryCore(filters);
}

export async function getMemberDetailsByCard(uid: string) {
  return await getMemberDetailsByCardCore(uid);
}

export async function getNfcStats(): Promise<NfcTransactionStats> {
  return await getNfcStatsCore();
}

export async function getNfcTransactions(filters: NfcTransactionFilter = {}) {
  await verifyNfcAdminPermission("view:nfc");
  return await getNfcTransactionsCore(filters);
}

export async function lookupCardOwner(uid: string) {
  try {
    return await lookupCardOwnerCore(uid);
  } catch (error: any) {
    console.error("lookupCardOwner error:", error);
    return { success: false as const, error: "Failed to lookup card owner." };
  }
}

export async function creditWallet(
  userId: string,
  amount: number,
  description: string,
  cardUid: string,
  cardId: string
) {
  try {
    const result = await creditWalletCore(userId, amount, description, cardUid, cardId);
    if (!result.success) return result;

    eventBus.emit("wallet.credited", {
      memberId: userId,
      rechargeAmount: amount,
      description: description || "NFC Wallet Top-up",
      reason: "ADMIN_TOPUP",
    });

    revalidatePath("/admin/nfc/wallet");
    return { success: true };
  } catch (error: any) {
    console.error("creditWallet error:", error);
    return { success: false, error: "Failed to credit wallet." };
  }
}

export async function deductWallet(
  userId: string,
  amount: number,
  description: string,
  cardUid: string,
  cardId: string
) {
  try {
    const result = await deductWalletCore(userId, amount, description, cardUid, cardId);
    if (!result.success) return result;

    eventBus.emit("wallet.debited", {
      memberId: userId,
      amount,
      description: description || "NFC Wallet Deduction",
    });

    revalidatePath("/admin/nfc/wallet");
    return result;
  } catch (error: any) {
    console.error("deductWallet error:", error);
    return { success: false, error: error.message || "Failed to deduct wallet." };
  }
}

export async function getKioskFacilities() {
  return await getKioskFacilitiesCore();
}

export async function fetchKioskAvailableSlots(turfId?: string, durationMin: number = 60) {
  return await fetchKioskAvailableSlotsCore(turfId, durationMin);
}

export async function createKioskBooking(data: CreateKioskBookingInput) {
  const result = await createKioskBookingCore(data);

  if (result.type === "WALLET") {
    const member = await prisma.member.findUnique({
      where: { id: data.memberId },
      select: { name: true, mobile: true },
    });

    eventBus.emit("wallet.debited", {
      memberId: data.memberId,
      amount: result.validatedPrice,
      description: `Kiosk booking for ${new Date(data.startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
      bookingId: result.booking.id,
    });

    eventBus.emit("booking.confirmed", {
      bookingId: result.booking.id,
      memberId: result.booking.memberId,
      customerName: member?.name || "",
      turfName: result.turfName,
      sportName: result.sportName,
      startTime: result.booking.startTime,
      endTime: result.booking.endTime,
      price: result.validatedPrice,
      paymentStatus: "PAID",
      mobile: member?.mobile || null,
      isKiosk: true,
    });

    return {
      success: true,
      booking: JSON.parse(JSON.stringify(result.booking)),
      paymentMethod: "WALLET" as const,
    };
  }

  if (result.type === "PHONEPE") {
    return {
      success: true,
      booking: JSON.parse(JSON.stringify(result.booking)),
      paymentMethod: "PHONEPE" as const,
      orderData: result.orderData,
    };
  }

  if (result.type === "RAZORPAY") {
    return {
      success: true,
      booking: JSON.parse(JSON.stringify(result.booking)),
      paymentMethod: "RAZORPAY" as const,
      orderData: result.orderData,
    };
  }

  throw new Error("Invalid payment method");
}

export async function confirmKioskRazorpayPayment(
  bookingId: string,
  memberId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  return await confirmKioskRazorpayPaymentCore(
    bookingId,
    memberId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );
}

export async function findMembersByMobile(mobile: string) {
  return await findMembersByMobileCore(mobile);
}
