import { prisma } from "@/core/database/prisma";
import { whatsappDb } from "@/core/database/whatsappDb";

export interface AddWalletTransactionInput {
  memberId: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  description?: string;
  otp?: string;
}

export interface AdminSessionInfo {
  id: string;
  name?: string | null;
  email: string;
}

export async function verifyWalletOtp(mobile: string, otp: string) {
  const cleanMobile = mobile.replace("+91", "").replace(/[^0-9]/g, "");
  if (!cleanMobile) throw new Error("Member has no phone number");

  const otpRecord = await whatsappDb.whatsAppOtp.findFirst({
    where: {
      phoneNumber: { contains: cleanMobile },
      otp,
      purpose: "WALLET_TXN",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) throw new Error("Invalid or missing OTP for wallet transaction");
  if (otpRecord.verified) throw new Error("This OTP has already been used");
  if (new Date() > new Date(otpRecord.expiresAt)) throw new Error("This OTP has expired");

  await whatsappDb.whatsAppOtp.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  return otpRecord;
}

export async function addWalletTransactionCore(
  data: AddWalletTransactionInput,
  admin?: AdminSessionInfo | null
) {
  if (!data.memberId || !data.amount || data.amount <= 0 || !data.otp) {
    throw new Error("Invalid input data or missing OTP");
  }

  const member = await prisma.member.findUnique({ where: { id: data.memberId } });
  if (!member) throw new Error("Member not found");

  await verifyWalletOtp(member.mobile, data.otp);

  const amountInPaise = Math.round(data.amount * 100);

  if (data.type === "DEBIT" && member.walletBalance < amountInPaise) {
    throw new Error("Insufficient wallet balance");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Create the transaction record
    await tx.walletTransaction.create({
      data: {
        memberId: data.memberId,
        amount: amountInPaise,
        type: data.type,
        description: data.description,
      },
    });

    // 2. Update the member's wallet balance
    await tx.member.update({
      where: { id: data.memberId },
      data: {
        walletBalance: {
          [data.type === "CREDIT" ? "increment" : "decrement"]: amountInPaise,
        },
      },
    });

    // 3. Create the audit log
    if (admin) {
      await tx.auditLog.create({
        data: {
          action: data.type === "CREDIT" ? "WALLET_CREDIT" : "WALLET_DEBIT",
          entity: "Member",
          entityId: data.memberId,
          details: JSON.stringify({ amount: data.amount, description: data.description }),
          adminId: admin.id,
          adminName: admin.name || admin.email,
        },
      });
    }
  });

  return { member, amountInPaise };
}
