import { sendWalletTransactionPush } from "@/modules/notifications/notifications.services";
import { bumpSyncTimestamp } from "@/core/database/sync";
import { logger } from "@/core/logging/logger";

export async function dispatchWalletPushNotification(
  memberId: string,
  amount: number,
  type: "CREDIT" | "DEBIT",
  description?: string
) {
  await sendWalletTransactionPush(
    memberId,
    amount,
    type,
    description
  ).catch((pushErr) => {
    logger.error("[Push Hook Error] Admin addWalletTransaction push failed", pushErr);
  });
}

export async function bumpWalletSync() {
  await bumpSyncTimestamp("wallet");
}
