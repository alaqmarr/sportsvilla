import { formatWhatsAppNumber, sendWhatsAppMessage } from "./whatsapp.service";

export interface MembershipExpiringPayload {
  customerName: string;
  planName: string;
  expirationDate: string; // e.g. "15 Aug 2026"
  registeredPhone: string;
}

export async function sendWhatsAppMembershipExpiringTemplate(
  phoneNumber: string,
  payload: MembershipExpiringPayload
) {
  const formattedPhone = formatWhatsAppNumber(phoneNumber);

  return await sendWhatsAppMessage({
    to: formattedPhone,
    type: "template",
    templateName: "sportsvilla_membership_expiring_v1",
    languageCode: "en",
    templateComponents: [
      {
        type: "header",
        parameters: [
          {
            type: "image",
            image: { link: "https://sportsvilla.co.in/short-logo.png" }
          }
        ]
      },
      {
        type: "body",
        parameters: [
          { type: "text", text: payload.customerName },
          { type: "text", text: payload.planName },
          { type: "text", text: payload.expirationDate },
          { type: "text", text: payload.registeredPhone },
        ],
      },
    ],
    metadata: { purpose: "MEMBERSHIP_EXPIRING", ...payload },
  });
}
