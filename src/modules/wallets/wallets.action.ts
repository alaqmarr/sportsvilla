"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import { prisma } from "@/core/database/prisma";
import { addWalletTransactionCore, AddWalletTransactionInput, AdminSessionInfo } from "./wallets.lib";
import { eventBus } from "@/core/events";
import { bumpSyncTimestamp } from "@/core/database/sync";

export async function addWalletTransaction(data: AddWalletTransactionInput) {
  const session = await getServerSession(authOptions);
  let adminInfo: AdminSessionInfo | null = null;
  if (session?.user?.email) {
    const admin = await prisma.admin.findFirst({ where: { email: session.user.email } });
    if (admin) {
      adminInfo = {
        id: admin.id,
        name: admin.name || admin.email,
        email: admin.email,
      };
    }
  }

  const { member, amountInPaise } = await addWalletTransactionCore(data, adminInfo);

  if (data.type === "CREDIT") {
    const rechargeAmount = data.amount;
    const newBalance = (member.walletBalance + amountInPaise) / 100;
    eventBus.emit("wallet.credited", {
      memberId: data.memberId,
      memberName: member.name,
      rechargeAmount,
      newBalance,
      mobile: member.mobile,
      description: data.description,
      reason: "RECHARGE",
    });
  } else if (data.type === "DEBIT") {
    const newBalance = (member.walletBalance - amountInPaise) / 100;
    eventBus.emit("wallet.debited", {
      memberId: data.memberId,
      amount: data.amount,
      newBalance,
      description: data.description,
    });
  }

  await bumpSyncTimestamp("wallet");
  revalidatePath("/", "layout");
  return { success: true };
}
