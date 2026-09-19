import { formatWhatsAppNumber, sendWhatsAppMessage } from "./whatsapp.service";

export async function sendWhatsAppBookingCancelledTemplate(
  customerName: string,
  turfName: string,
  timeString: string,
  refundAmount: number,
  registeredPhone: string
) {
  const formattedPhone = formatWhatsAppNumber(registeredPhone);

  return await sendWhatsAppMessage({
    to: formattedPhone,
    type: "template",
    templateName: "booking_cancelled_v1",
    languageCode: "en",
    templateComponents: [
      {
        type: "body",
        parameters: [
          { type: "text", text: customerName },
          { type: "text", text: turfName },
          { type: "text", text: timeString },
          { type: "text", text: String(refundAmount) },
        ],
      },
    ],
    metadata: { purpose: "BOOKING_CANCELLED" },
  });
}
