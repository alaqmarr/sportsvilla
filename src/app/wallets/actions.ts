"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { bumpSyncTimestamp } from '@/lib/sync';

export async function addWalletTransaction(data: { memberId: string; amount: number; type: "CREDIT" | "DEBIT"; description?: string }) {
  if (!data.memberId || !data.amount || data.amount <= 0) {
    throw new Error("Invalid input data");
  }

  const member = await prisma.member.findUnique({ where: { id: data.memberId } });
  if (!member) throw new Error("Member not found");

  if (data.type === "DEBIT" && member.walletBalance < data.amount) {
    throw new Error("Insufficient wallet balance");
  }

  // Use a transaction to ensure both the wallet balance update and transaction record are created together
  await prisma.$transaction(async (tx) => {
    // 1. Create the transaction record
    await tx.walletTransaction.create({
      data: {
        memberId: data.memberId,
        amount: data.amount,
        type: data.type,
        description: data.description,
      }
    });

    // 2. Update the member's wallet balance
    await tx.member.update({
      where: { id: data.memberId },
      data: {
        walletBalance: {
          [data.type === "CREDIT" ? "increment" : "decrement"]: data.amount
        }
      }
    });
  });

  await bumpSyncTimestamp('wallet');
  revalidatePath("/", "layout");
  return { success: true };
}
