import { formatWhatsAppNumber, sendWhatsAppMessage } from "./whatsapp.service";

export async function sendWhatsAppCheckinTemplate(
  customerName: string,
  sportName: string,
  timeString: string,
  registeredPhone: string
) {
  const formattedPhone = formatWhatsAppNumber(registeredPhone);

  return await sendWhatsAppMessage({
    to: formattedPhone,
    type: "template",
    templateName: "checkin_v1",
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
          { type: "text", text: sportName },
          { type: "text", text: timeString },
        ],
      },
    ],
    metadata: { purpose: "CHECKIN_CONFIRMED" },
  });
}
