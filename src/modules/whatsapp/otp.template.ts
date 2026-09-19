import { formatWhatsAppNumber, sendWhatsAppMessage } from "./whatsapp.service";
import { whatsappDb } from "@/core/database/whatsappDb";

export async function sendWhatsAppOtp(
  phoneNumber: string,
  otp: string,
  purpose: string = "LOGIN"
) {
  const formattedPhone = formatWhatsAppNumber(phoneNumber);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins validity

  // Save OTP to DB
  await whatsappDb.whatsAppOtp.create({
    data: {
      phoneNumber: formattedPhone,
      otp,
      purpose,
      expiresAt,
    },
  });

  // Try sending the authwebsite template first
  const templateRes = await sendWhatsAppMessage({
    to: formattedPhone,
    type: "template",
    templateName: "authwebsite",
    languageCode: "en",
    templateComponents: [
      {
        type: "body",
        parameters: [
          { type: "text", text: otp }
        ]
      },
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [
          { type: "text", text: otp }
        ]
      }
    ],
    metadata: { purpose, otpSent: true },
  });

  if (!templateRes.success) {
    console.log("Template authwebsite failed, fallback to text for phone:", formattedPhone);
    // Send fallback text message
    const textBody = `Your Sportsvilla verification code is: *${otp}*\n\nDo not share this code with anyone. Valid for 10 minutes.`;
    return await sendWhatsAppMessage({
      to: formattedPhone,
      type: "text",
      text: textBody,
      metadata: { purpose, otpSent: true, fallback: true },
    });
  }

  return templateRes;
}
