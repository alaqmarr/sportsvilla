"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { bumpSyncTimestamp } from '@/lib/sync';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { whatsappDb } from '@/lib/whatsappDb';
import { sendWhatsAppWalletCreditTemplate } from '@/lib/whatsapp';

export async function addWalletTransaction(data: { memberId: string; amount: number; type: "CREDIT" | "DEBIT"; description?: string; otp?: string }) {
  if (!data.memberId || !data.amount || data.amount <= 0 || !data.otp) {
    throw new Error("Invalid input data or missing OTP");
  }

  const member = await prisma.member.findUnique({ where: { id: data.memberId } });
  if (!member) throw new Error("Member not found");

  const cleanMobile = member.mobile?.replace('+91', '').replace(/[^0-9]/g, '');
  if (!cleanMobile) throw new Error("Member has no phone number");

  const otpRecord = await whatsappDb.whatsAppOtp.findFirst({
    where: {
      phoneNumber: { contains: cleanMobile },
      otp: data.otp,
      purpose: 'WALLET_TXN',
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!otpRecord) throw new Error("Invalid or missing OTP for wallet transaction");
  if (otpRecord.verified) throw new Error("This OTP has already been used");
  if (new Date() > new Date(otpRecord.expiresAt)) throw new Error("This OTP has expired");

  await whatsappDb.whatsAppOtp.update({
    where: { id: otpRecord.id },
    data: { verified: true }
  });

  const amountInPaise = Math.round(data.amount * 100);

  if (data.type === "DEBIT" && member.walletBalance < amountInPaise) {
    throw new Error("Insufficient wallet balance");
  }

  // Use a transaction to ensure both the wallet balance update and transaction record are created together
  await prisma.$transaction(async (tx) => {
    // 1. Create the transaction record
    await tx.walletTransaction.create({
      data: {
        memberId: data.memberId,
        amount: amountInPaise,
        type: data.type,
        description: data.description,
      }
    });

    // 2. Update the member's wallet balance
    await tx.member.update({
      where: { id: data.memberId },
      data: {
        walletBalance: {
          [data.type === "CREDIT" ? "increment" : "decrement"]: amountInPaise
        }
      }
    });

    // 3. Create the audit log
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const admin = await tx.admin.findFirst({ where: { email: session.user.email } });
      if (admin) {
        await tx.auditLog.create({
          data: {
            action: data.type === "CREDIT" ? "WALLET_CREDIT" : "WALLET_DEBIT",
            entity: "Member",
            entityId: data.memberId,
            details: JSON.stringify({ amount: data.amount, description: data.description }),
            adminId: admin.id,
            adminName: admin.name || admin.email,
          }
        });
      }
    }
  });

  if (data.type === "CREDIT" && member.mobile) {
    try {
      const rechargeAmount = data.amount;
      const newBalance = (member.walletBalance + amountInPaise) / 100;
      await sendWhatsAppWalletCreditTemplate(
        member.name,
        rechargeAmount,
        newBalance,
        member.mobile
      );
    } catch (waErr) {
      console.error("Failed to send wallet credit WhatsApp message", waErr);
    }
  }

  await bumpSyncTimestamp('wallet');
  revalidatePath("/", "layout");
  return { success: true };
}
