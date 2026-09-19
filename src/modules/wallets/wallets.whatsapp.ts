import { sendWhatsAppWalletCreditTemplate } from "@/modules/whatsapp/wallet-credit.template";
import { logger } from "@/core/logging/logger";

export async function dispatchWalletCreditWhatsApp(
  memberName: string,
  rechargeAmount: number,
  newBalance: number,
  mobile: string
) {
  try {
    await sendWhatsAppWalletCreditTemplate(
      memberName,
      rechargeAmount,
      newBalance,
      mobile
    );
  } catch (waErr) {
    logger.error("Failed to send wallet credit WhatsApp message", waErr);
  }
}
