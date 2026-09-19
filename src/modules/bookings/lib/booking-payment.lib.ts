/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/core/database/prisma";
import {
  calculateNetPrice,
  calculatePaymentStatusAndDue,
} from "../bookings.helper";
import { AdminActorInfo } from "./booking-creation.lib";
import crypto from "crypto";

export async function updateBookingPaymentCore(
  tx: any,
  id: string,
  paymentStatus: "PAID" | "UNPAID",
  adminInfo?: AdminActorInfo,
) {
  const booking = await tx.booking.findUnique({
    where: { id },
    include: { payments: true },
  });
  if (!booking) throw new Error("Booking not found");

  let newAmountDue = booking.amountDue;
  if (paymentStatus === "PAID") {
    newAmountDue = 0;
  } else if (paymentStatus === "UNPAID") {
    const totalPaid = booking.payments.reduce(
      (sum: number, p: any) => sum + p.amount,
      0,
    );
    const netPrice = calculateNetPrice(
      booking.price,
      booking.discountAmount,
      booking.pointsRedeemed,
    );
    newAmountDue = Math.max(0, netPrice - totalPaid);
  }

  const updated = await tx.booking.update({
    where: { id },
    data: { paymentStatus, amountDue: newAmountDue },
  });

  await tx.auditLog.create({
    data: {
      action: "UPDATE_PAYMENT",
      entity: "Booking",
      entityId: id,
      details: JSON.stringify({ paymentStatus }),
      adminId: adminInfo?.adminId,
      adminName: adminInfo?.adminName || "System",
    },
  });

  return updated;
}

export async function addPaymentCore(
  tx: any,
  bookingId: string,
  amount: number,
  method: "CASH" | "ONLINE" | "SPORTSVILLA_CARD",
) {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
    include: { payments: true },
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "CANCELLED") {
    throw new Error("Cannot record payment for a cancelled booking");
  }

  await tx.payment.create({
    data: { bookingId, amount, method },
  });

  await tx.transaction.create({
    data: {
      bookingId,
      memberId: booking.memberId,
      gateway:
        method === "CASH"
          ? "MANUAL"
          : method === "ONLINE"
            ? "ONLINE"
            : "WALLET",
      amount,
      status: "SUCCESS",
      metadata: JSON.stringify({ method }),
    },
  });

  const totalPaid =
    booking.payments.reduce((sum: number, p: any) => sum + p.amount, 0) +
    amount;
  const netPrice = calculateNetPrice(
    booking.price,
    booking.discountAmount,
    booking.pointsRedeemed,
  );
  const { paymentStatus: newStatus, amountDue } = calculatePaymentStatusAndDue(
    netPrice,
    totalPaid,
  );

  await tx.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: newStatus,
      advancePaid: { increment: amount },
      amountDue,
    },
  });

  return {
    netPrice,
    totalPaid,
    paymentStatus: newStatus,
    amountDue,
  };
}

export async function upsertDisplaySession(data: {
  bookingId?: string;
  qrData?: string;
  amount?: number;
  memberName?: string;
  status: "IDLE" | "AWAITING_PAYMENT" | "PAID";
}) {
  await prisma.displaySession.upsert({
    where: { id: "MAIN_DISPLAY" },
    update: data,
    create: { id: "MAIN_DISPLAY", ...data },
  });
}

export async function fetchDisplaySession() {
  return await prisma.displaySession.findUnique({
    where: { id: "MAIN_DISPLAY" },
  });
}

export async function fetchUpiSettings() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["upiId", "businessName"] } },
  });
  const upiId = settings.find((s) => s.key === "upiId")?.value || "";
  const businessName =
    settings.find((s) => s.key === "businessName")?.value || "SportsVilla";
  return { upiId, businessName };
}

export async function generateRazorpayPaymentLinkCore(bookingIds: string[]) {
  const bookings = await prisma.booking.findMany({
    where: { id: { in: bookingIds } },
    include: { member: true },
  });

  if (bookings.length === 0) throw new Error("No bookings found");

  const totalDue = bookings.reduce((sum, b) => sum + (b.amountDue || 0), 0);
  if (totalDue <= 0) throw new Error("No amount due");

  const primaryMember = bookings[0].member;

  const { createPaymentLink } = await import("@/modules/payments/razorpay.services");
  const shortUrl = await createPaymentLink(
    totalDue,
    `Booking for ${bookings.length} slot(s)`,
    {
      name: primaryMember.name,
      contact: primaryMember.mobile ? `+91${primaryMember.mobile}` : "",
    },
    bookings.length === 1
      ? bookings[0].id
      : "BATCH_" +
          crypto
            .createHash("md5")
            .update(bookings.map((b) => b.id).join(","))
            .digest("hex")
            .substring(0, 34),
  );

  return shortUrl;
}

export async function createAdminPhonePeOrderCore(
  bookingIds: string[],
  origin: string,
) {
  const bookings = await prisma.booking.findMany({
    where: { id: { in: bookingIds } },
    include: { member: true },
  });
  if (bookings.length === 0) throw new Error("No bookings found");
  const totalDue = bookings.reduce((sum, b) => sum + (b.amountDue || 0), 0);
  if (totalDue <= 0) throw new Error("No amount due");

  const merchantId = await prisma.setting.findUnique({
    where: { key: "PHONEPE_MERCHANT_ID" },
  });
  const saltKey = await prisma.setting.findUnique({
    where: { key: "PHONEPE_SALT_KEY" },
  });
  const saltIndex = await prisma.setting.findUnique({
    where: { key: "PHONEPE_SALT_INDEX" },
  });
  const envSetting = await prisma.setting.findUnique({
    where: { key: "PHONEPE_ENV" },
  });

  if (!merchantId?.value || !saltKey?.value || !saltIndex?.value) {
    throw new Error("PhonePe is not configured");
  }

  const transactionId = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const baseUrl =
    origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  const payload = {
    merchantId: merchantId.value,
    merchantTransactionId: transactionId,
    merchantUserId: bookings[0].memberId,
    amount: Math.round(totalDue * 100),
    redirectUrl: `${baseUrl}/play/booking-success?multi=1`,
    redirectMode: "POST",
    callbackUrl: `${baseUrl}/api/client/v1/payments/webhook?gateway=PHONEPE`,
    mobileNumber: bookings[0].member.mobile,
    paymentInstrument: { type: "PAY_PAGE" },
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const stringToHash = payloadBase64 + "/pg/v1/pay" + saltKey.value;
  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
  const xVerify = `${sha256}###${saltIndex.value}`;

  const phonePeHost =
    envSetting?.value === "PROD"
      ? "https://api.phonepe.com/apis/hermes"
      : "https://api-preprod.phonepe.com/apis/hermes";

  const response = await fetch(`${phonePeHost}/pg/v1/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-VERIFY": xVerify },
    body: JSON.stringify({ request: payloadBase64 }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "PhonePe init failed");
  }

  await prisma.transaction.create({
    data: {
      gatewayOrderId: transactionId,
      bookingId: bookings[0].id,
      memberId: bookings[0].memberId,
      amount: totalDue,
      currency: "INR",
      gateway: "PHONEPE",
      status: "PENDING",
      metadata: JSON.stringify({
        bookingIds,
        platform: "WEB",
        initiatedAt: new Date().toISOString(),
      }),
    },
  });

  return {
    redirectUrl: data.data.instrumentResponse.redirectInfo.url,
    transactionId,
  };
}

export async function createAdminRazorpayOrderCore(bookingIds: string[]) {
  const bookings = await prisma.booking.findMany({
    where: { id: { in: bookingIds } },
    include: { member: true },
  });
  if (bookings.length === 0) throw new Error("No bookings found");
  const totalDue = bookings.reduce((sum, b) => sum + (b.amountDue || 0), 0);
  if (totalDue <= 0) throw new Error("No amount due");

  const rzpKey = await prisma.setting.findUnique({
    where: { key: "RAZORPAY_KEY_ID" },
  });
  const rzpSecret = await prisma.setting.findUnique({
    where: { key: "RAZORPAY_KEY_SECRET" },
  });
  if (!rzpKey?.value || !rzpSecret?.value)
    throw new Error("Razorpay not configured");

  const Razorpay = (await import("razorpay")).default;
  const razorpay = new Razorpay({
    key_id: rzpKey.value,
    key_secret: rzpSecret.value,
  });

  const order = await razorpay.orders.create({
    amount: Math.round(totalDue * 100),
    currency: "INR",
    receipt: "admin_rzp_" + Date.now(),
  });

  await prisma.transaction.create({
    data: {
      gatewayOrderId: order.id,
      amount: totalDue,
      currency: "INR",
      gateway: "RAZORPAY",
      status: "PENDING",
      metadata: JSON.stringify({ bookingIds }),
    },
  });

  return { keyId: rzpKey.value, orderId: order.id, amount: totalDue };
}

export async function verifyAdminRazorpayOrderCore(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const rzpSecret = await prisma.setting.findUnique({
    where: { key: "RAZORPAY_KEY_SECRET" },
  });
  const expected = crypto
    .createHmac("sha256", rzpSecret!.value)
    .update(orderId + "|" + paymentId)
    .digest("hex");
  if (expected !== signature) throw new Error("Invalid signature");

  const tx = await prisma.transaction.findFirst({
    where: { gatewayOrderId: orderId },
  });
  if (!tx || !tx.metadata) throw new Error("Transaction not found");

  const meta =
    typeof tx.metadata === "string" ? JSON.parse(tx.metadata) : tx.metadata;
  const bookingIds: string[] = (meta as any).bookingIds || [];

  const { settleSuccessfulPayment, sendConfirmationAndTickets } = await import(
    "@/modules/payments/payment-settlement.services"
  );

  await prisma.transaction.update({
    where: { id: tx.id },
    data: { status: "SUCCESS", gatewayPaymentId: paymentId },
  });

  let remainingAmount = tx.amount;
  for (const bid of bookingIds) {
    const booking = await prisma.booking.findUnique({ where: { id: bid } });
    if (booking && booking.paymentStatus !== "PAID") {
      const due = booking.amountDue || booking.price;
      const amountToApply = Math.min(due, remainingAmount);

      const settleResult = await settleSuccessfulPayment({
        bookingId: bid,
        gateway: "RAZORPAY",
        gatewayOrderId: orderId,
        gatewayPaymentId: paymentId,
        paidAmountRupees: amountToApply,
        metadata: { adminDirect: true },
      });
      if (settleResult.success && settleResult.status === "PAID") {
        await sendConfirmationAndTickets(settleResult.booking);
      }
      remainingAmount -= amountToApply;
      if (remainingAmount <= 0) break;
    }
  }
}
