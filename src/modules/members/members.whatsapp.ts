import { sendWhatsAppMemberRegisteredTemplate } from "@/modules/whatsapp/member-registered.template";
import { sendWhatsAppMembershipPurchasedTemplate } from "@/modules/whatsapp/membership-purchased.template";
import { sendWhatsAppMembershipExpiringTemplate } from "@/modules/whatsapp/membership-expiring.template";
import { logger } from "@/core/logging/logger";

export async function dispatchMemberRegisteredWhatsApp(name: string, mobile: string) {
  try {
    await sendWhatsAppMemberRegisteredTemplate(name, mobile);
  } catch (waError) {
    logger.error("WhatsApp welcome message failed", waError);
  }
}

export async function dispatchFamilyRegisteredWhatsApp(members: { name: string; mobile: string }[]) {
  return Promise.allSettled(
    members.map((m) => sendWhatsAppMemberRegisteredTemplate(m.name, m.mobile))
  ).catch((waError) => {
    logger.error("WhatsApp welcome message failed for family member", waError);
  });
}

export async function dispatchMembershipPurchasedWhatsApp(params: {
  memberName: string;
  planName: string;
  turfName: string;
  eligibleSlot: string;
  validUntil: string;
  mobile: string;
}) {
  try {
    await sendWhatsAppMembershipPurchasedTemplate(
      params.memberName,
      params.planName,
      params.turfName,
      params.eligibleSlot,
      params.validUntil,
      params.mobile
    );
  } catch (waError) {
    logger.error("WhatsApp membership purchased message failed", waError);
  }
}

export async function dispatchMembershipExpiringWhatsApp(params: {
  mobile: string;
  customerName: string;
  planName: string;
  expirationDate: string;
  registeredPhone: string;
}) {
  try {
    await sendWhatsAppMembershipExpiringTemplate(params.mobile, {
      customerName: params.customerName,
      planName: params.planName,
      expirationDate: params.expirationDate,
      registeredPhone: params.registeredPhone,
    });
  } catch (e) {
    logger.error("Failed to send WhatsApp membership expiring event", e);
  }
}
