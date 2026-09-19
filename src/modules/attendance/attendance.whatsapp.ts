import { sendWhatsAppCheckinTemplate } from "@/modules/whatsapp/checkin.template";
import { logger } from "@/core/logging/logger";

export async function dispatchAttendanceWhatsApp(
  name: string,
  sportName: string,
  mobile: string
) {
  try {
    const formattedTime = new Date().toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });

    await sendWhatsAppCheckinTemplate(
      name,
      sportName,
      formattedTime,
      mobile
    );
  } catch (waError) {
    logger.error("Failed to send attendance check-in WhatsApp message", waError);
  }
}
