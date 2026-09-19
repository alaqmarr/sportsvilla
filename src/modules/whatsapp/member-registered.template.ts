import { formatWhatsAppNumber, sendWhatsAppMessage } from "./whatsapp.service";

export async function sendWhatsAppMemberRegisteredTemplate(
  customerName: string,
  registeredPhone: string
) {
  const formattedPhone = formatWhatsAppNumber(registeredPhone);

  return await sendWhatsAppMessage({
    to: formattedPhone,
    type: "template",
    templateName: "sportsvilla_member_registered",
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
          { type: "text", text: registeredPhone },
        ],
      },
    ],
    metadata: { purpose: "MEMBER_REGISTERED" },
  });
}
