import { formatWhatsAppNumber, sendWhatsAppMessage } from "./whatsapp.service";
import { whatsappDb } from "@/core/database/whatsappDb";

export async function sendWhatsAppMagicLogin(
  phoneNumber: string,
  magicToken: string,
  purpose: string = "MAGIC_LOGIN"
) {
  const formattedPhone = formatWhatsAppNumber(phoneNumber);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins validity

  // Save Magic Token to WhatsApp DB
  await whatsappDb.whatsAppOtp.create({
    data: {
      phoneNumber: formattedPhone,
      otp: magicToken,
      purpose,
      expiresAt,
    },
  });

  // Send WhatsApp Template with Dynamic Login URL Button
  return await sendWhatsAppMessage({
    to: formattedPhone,
    type: "template",
    templateName: "sportsvilla_magic_login",
    languageCode: "en",
    templateComponents: [
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [
          {
            type: "text",
            text: magicToken,
          },
        ],
      },
    ],
    metadata: { purpose, magicLogin: true, token: magicToken },
  });
}
