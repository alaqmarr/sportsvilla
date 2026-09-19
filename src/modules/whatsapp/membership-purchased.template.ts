import { formatWhatsAppNumber, sendWhatsAppMessage } from "./whatsapp.service";

export async function sendWhatsAppMembershipPurchasedTemplate(
  customerName: string,
  planName: string,
  venueName: string,
  eligibleSlot: string, // e.g. "9-10PM"
  validUntil: string, // e.g. "31st August 2027"
  registeredPhone: string
) {
  const formattedPhone = formatWhatsAppNumber(registeredPhone);

  return await sendWhatsAppMessage({
    to: formattedPhone,
    type: "template",
    templateName: "sportsvilla_membership_purchased_v1",
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
          { type: "text", text: customerName },
          { type: "text", text: planName },
          { type: "text", text: venueName },
          { type: "text", text: eligibleSlot },
          { type: "text", text: validUntil },
          { type: "text", text: registeredPhone },
        ],
      },
    ],
    metadata: { purpose: "MEMBERSHIP_PURCHASED" },
  });
}
