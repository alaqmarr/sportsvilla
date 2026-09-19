import { formatWhatsAppNumber, sendWhatsAppMessage } from "./whatsapp.service";
import { generateQRTicketBuffer } from "@/modules/bookings/qr-ticket.lib";
import { uploadTempQRToR2, deleteTempQRFromR2 } from "@/core/storage/r2-storage";
import { logger } from "@/core/logging/logger";

export async function sendWhatsAppBookingConfirmedTemplate(
  bookingId: string,
  customerName: string,
  venueName: string,
  sportName: string,
  dateTimeString: string,
  paymentStatusString: string,
  registeredPhone: string
) {
  const formattedPhone = formatWhatsAppNumber(registeredPhone);

  // Generate and Upload ephemeral QR Ticket
  let qrUrl = "https://sportsvilla.co.in/short-logo.png"; // Fallback image
  let r2Key = "";
  
  try {
    // Parse dateTimeString to pass to QR (e.g. "Sep 18, 5:00 PM - 6:00 PM")
    // For simplicity, we just pass the whole string as date/time.
    const qrBuffer = await generateQRTicketBuffer({
      bookingId,
      turfName: venueName,
      date: dateTimeString.split(',')[0] || dateTimeString,
      time: dateTimeString.split(',')[1] || ''
    });

    r2Key = `temp-qr/${bookingId}-${Date.now()}.png`;
    const uploadedUrl = await uploadTempQRToR2(qrBuffer, r2Key);
    if (uploadedUrl) {
      qrUrl = uploadedUrl;
    }
    logger.info(`[WhatsApp QR] Successfully generated QR URL: ${qrUrl}`);
  } catch (err) {
    logger.error("[WhatsApp QR Error] Failed to generate/upload QR ticket for WhatsApp:", err);
  }

  const response = await sendWhatsAppMessage({
    to: formattedPhone,
    type: "template",
    templateName: "sportsvilla_booking_confirmed_v1",
    languageCode: "en",
    templateComponents: [
      {
        type: "header",
        parameters: [
          {
            type: "image",
            image: { link: qrUrl }
          }
        ]
      },
      {
        type: "body",
        parameters: [
          { type: "text", text: customerName },
          { type: "text", text: venueName },
          { type: "text", text: sportName },
          { type: "text", text: dateTimeString },
          { type: "text", text: paymentStatusString },
          { type: "text", text: registeredPhone }
        ]
      }
    ],
    metadata: { purpose: "BOOKING_CONFIRMED" },
  });

  // Schedule deletion of the temp QR image after a short delay (30 seconds)
  // to ensure WhatsApp/Meta's servers have time to fetch the image URL.
  if (r2Key) {
    setTimeout(async () => {
      try {
        await deleteTempQRFromR2(r2Key);
      } catch (e) {
        console.error("Failed to delete temp QR ticket:", e);
      }
    }, 30000); // 30 second delay
  }

  return response;
}
