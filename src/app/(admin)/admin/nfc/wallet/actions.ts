"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/client";
import { sendWalletTransactionPush } from "@/lib/notifications";
import { logger } from "@/lib/logger";

export async function lookupCardOwner(uid: string) {
  try {
    const card = await prisma.nfcCard.findUnique({
      where: { cardUid: uid },
      include: { member: true },
    });

    if (!card) {
      return { success: false, error: "Card not found in the system." };
    }

    if (!card.member) {
      return { success: false, error: "Card is not assigned to any member." };
    }

    if (card.status !== "ACTIVE") {
      return { success: false, error: `Card is ${card.status.toLowerCase()}.` };
    }

    return { 
      success: true, 
      member: {
        id: card.member.id,
        name: card.member.name,
        mobile: card.member.mobile,
        walletBalance: card.member.walletBalance
      },
      cardId: card.id,
      cardUid: card.cardUid
    };
  } catch (error: any) {
    console.error("lookupCardOwner error:", error);
    return { success: false, error: "Failed to lookup card owner." };
  }
}

export async function creditWallet(userId: string, amount: number, description: string, cardUid: string, cardId: string) {
  if (amount <= 0) return { success: false, error: "Amount must be positive." };

  const amountPaise = Math.round(amount * 100);

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.member.update({
        where: { id: userId },
        data: {
          walletBalance: { increment: amountPaise }
        }
      });

      await tx.walletTransaction.create({
        data: {
          memberId: userId,
          amount: amountPaise,
          type: "CREDIT",
          description: description || "NFC Wallet Top-up"
        }
      });

      await tx.nfcTransaction.create({
        data: {
          cardUid,
          cardId,
          memberId: userId,
          type: "TOPUP",
          status: "SUCCESS",
          amount
        }
      });
    });

    sendWalletTransactionPush(
      userId,
      amount,
      "CREDIT",
      description || "NFC Wallet Top-up"
    ).catch((pushErr) => {
      logger.error("[Push Hook Error] Failed to send NFC credit push notification", pushErr);
    });

    revalidatePath("/admin/nfc/wallet");
    return { success: true };
  } catch (error: any) {
    console.error("creditWallet error:", error);
    return { success: false, error: "Failed to credit wallet." };
  }
}

export async function deductWallet(userId: string, amount: number, description: string, cardUid: string, cardId: string) {
  if (amount <= 0) return { success: false, error: "Amount must be positive." };

  const amountPaise = Math.round(amount * 100);

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedMember = await tx.member.update({
        where: { id: userId },
        data: {
          walletBalance: { decrement: amountPaise }
        }
      });

      if (updatedMember.walletBalance < 0) {
        throw new Error("Insufficient wallet balance.");
      }

      await tx.walletTransaction.create({
        data: {
          memberId: userId,
          amount: amountPaise,
          type: "DEBIT",
          description: description || "NFC Wallet Deduction"
        }
      });

      await tx.nfcTransaction.create({
        data: {
          cardUid,
          cardId,
          memberId: userId,
          type: "PAYMENT",
          status: "SUCCESS",
          amount
        }
      });

      return { success: true };
    });

    sendWalletTransactionPush(
      userId,
      amount,
      "DEBIT",
      description || "NFC Wallet Deduction"
    ).catch((pushErr) => {
      logger.error("[Push Hook Error] Failed to send NFC debit push notification", pushErr);
    });

    revalidatePath("/admin/nfc/wallet");
    return result;
  } catch (error: any) {
    console.error("deductWallet error:", error);
    return { success: false, error: error.message || "Failed to deduct wallet." };
  }
}
