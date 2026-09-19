import { sendWhatsAppMessage } from "./whatsapp.service";
import { whatsappDb } from "@/core/database/whatsappDb";

export async function sendEventMessage(eventName: string, phoneNumber: string, dataPayload: Record<string, any>) {
  const trigger = await whatsappDb.whatsAppEventTrigger.findUnique({
    where: { eventName }
  });

  if (!trigger || !trigger.isActive || !trigger.templateName) {
    return { success: false, reason: "Event trigger is disabled or has no template configured." };
  }

  let templateComponents: any[] = [];
  
  switch (eventName) {
    case "BOOKING_CONFIRMED":
      templateComponents = [
        { 
          type: "body", 
          parameters: [
            { type: "text", text: dataPayload.member.name },
            { type: "text", text: dataPayload.turf.name },
            { type: "text", text: String(dataPayload.booking.startTime) }
          ]
        }
      ];
      break;
    
    case "MEMBERSHIP_EXPIRED":
      templateComponents = [
        { 
          type: "body", 
          parameters: [
            { type: "text", text: dataPayload.member.name },
            { type: "text", text: dataPayload.membership.planName }
          ]
        }
      ];
      break;
      
    case "ADMIN_MANUAL_BOOKING":
      templateComponents = [
        { 
          type: "body", 
          parameters: [
            { type: "text", text: dataPayload.member.name || "Customer" },
            { type: "text", text: dataPayload.turf.name },
            { type: "text", text: String(dataPayload.booking.startTime) }
          ]
        }
      ];
      break;
      
    case "ADMIN_CHECKIN":
      templateComponents = [
        { 
          type: "body", 
          parameters: [
            { type: "text", text: dataPayload.member.name || "Customer" },
            { type: "text", text: dataPayload.booking.id }
          ]
        }
      ];
      break;
  }

  return await sendWhatsAppMessage({
    to: phoneNumber,
    type: "template",
    templateName: trigger.templateName,
    languageCode: "en",
    templateComponents,
    metadata: { eventName, purpose: "EVENT_TRIGGER" }
  });
}
