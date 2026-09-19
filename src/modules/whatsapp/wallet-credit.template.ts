import { formatWhatsAppNumber, sendWhatsAppMessage } from "./whatsapp.service";

export async function sendWhatsAppWalletCreditTemplate(
  customerName: string,
  rechargeAmount: number,
  newBalance: number,
  registeredPhone: string
) {
  const formattedPhone = formatWhatsAppNumber(registeredPhone);

  return await sendWhatsAppMessage({
    to: formattedPhone,
    type: "template",
    templateName: "wallet_credit_v1",
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
          { type: "text", text: String(rechargeAmount) },
          { type: "text", text: String(newBalance) },
        ],
      },
    ],
    metadata: { purpose: "WALLET_CREDITED" },
  });
}
