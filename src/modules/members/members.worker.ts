import { sendMembershipPush, sendWalletTransactionPush } from "@/modules/notifications/notifications.services";
import { bumpSyncTimestamp } from "@/core/database/sync";
import { logger } from "@/core/logging/logger";

export async function dispatchMembershipAssignedPush(memberId: string, planName: string) {
  sendMembershipPush(memberId, planName, "ASSIGNED").catch((pushError) => {
    logger.error("[Push Hook Error] Membership push notification failed", pushError);
  });
}

export async function dispatchWalletResetPush(memberId: string, balanceInRupees: number) {
  sendWalletTransactionPush(
    memberId,
    balanceInRupees,
    "DEBIT",
    "Wallet reset by admin"
  ).catch((pushErr) => {
    logger.error("[Push Hook Error] Admin resetWallet push failed", pushErr);
  });
}

export async function bumpMemberSync() {
  await bumpSyncTimestamp("member");
}
