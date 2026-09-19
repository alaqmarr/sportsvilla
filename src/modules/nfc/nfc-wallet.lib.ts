import { prisma } from "@/core/database/prisma";
import type { Prisma } from "@/generated/client";

export async function creditWalletCore(
  userId: string,
  amount: number,
  description: string,
  cardUid: string,
  cardId: string
) {
  if (amount <= 0) return { success: false as const, error: "Amount must be positive." };

  const amountPaise = Math.round(amount * 100);

  await prisma.$transaction(async (tx) => {
    await tx.member.update({
      where: { id: userId },
      data: {
        walletBalance: { increment: amountPaise },
      },
    });

    await tx.walletTransaction.create({
      data: {
        memberId: userId,
        amount: amountPaise,
        type: "CREDIT",
        description: description || "NFC Wallet Top-up",
      },
    });

    await tx.nfcTransaction.create({
      data: {
        cardUid,
        cardId,
        memberId: userId,
        type: "TOPUP",
        status: "SUCCESS",
        amount,
      },
    });
  });

  return { success: true as const };
}

export async function deductWalletCore(
  userId: string,
  amount: number,
  description: string,
  cardUid: string,
  cardId: string
) {
  if (amount <= 0) return { success: false as const, error: "Amount must be positive." };

  const amountPaise = Math.round(amount * 100);

  return await prisma.$transaction(async (tx) => {
    const updatedMember = await tx.member.update({
      where: { id: userId },
      data: {
        walletBalance: { decrement: amountPaise },
      },
    });

    if (updatedMember.walletBalance < 0) {
      throw new Error("Insufficient wallet balance.");
    }

    await tx.walletTransaction.create({
      data: {
        memberId: userId,
        amount: amountPaise,
        type: "DEBIT",
        description: description || "NFC Wallet Deduction",
      },
    });

    await tx.nfcTransaction.create({
      data: {
        cardUid,
        cardId,
        memberId: userId,
        type: "PAYMENT",
        status: "SUCCESS",
        amount,
      },
    });

    return { success: true as const };
  });
}
