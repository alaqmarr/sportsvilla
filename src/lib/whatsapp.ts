import { whatsappDb } from "./whatsappDb";

export interface SendWhatsAppOptions {
  to: string; // Recipient mobile number with country code (e.g. "919876543210")
  type: "text" | "template";
  text?: string;
  templateName?: string;
  languageCode?: string;
  templateComponents?: any[];
  metadata?: Record<string, any>;
  contextMessageId?: string; // Meta WAMID of message to quote/reply to
}

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

export async function sendWhatsAppMessage(options: SendWhatsAppOptions) {
  const { to, type, text, templateName, languageCode = "en", templateComponents, metadata, contextMessageId } = options;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Format recipient phone number (remove non-digits)
  const formattedTo = to.replace(/\D/g, "");

  let payload: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: formattedTo,
    type,
  };

  if (contextMessageId) {
    payload.context = {
      message_id: contextMessageId,
    };
  }

  if (type === "text") {
    payload.text = { preview_url: false, body: text };
  } else if (type === "template") {
    payload.template = {
      name: templateName,
      language: { code: languageCode },
      components: templateComponents || [],
    };
  }

  // Record outgoing message in SQLite database as PENDING
  const dbMsg = await whatsappDb.whatsAppMessage.create({
    data: {
      phoneNumber: formattedTo,
      direction: "OUTGOING",
      type: type.toUpperCase(),
      content: type === "text" ? (text || "") : JSON.stringify(payload.template),
      status: "PENDING",
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  if (!token || !phoneNumberId) {
    console.warn("Meta WhatsApp API credentials missing (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID). Logged message locally.");
    return { success: false, id: dbMsg.id, error: "Missing Meta credentials" };
  }

  try {
    const res = await fetch(`${META_GRAPH_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const errCode = String(data.error?.code || res.status);
      const errMsg = data.error?.message || "WhatsApp Meta API Error";
      await whatsappDb.whatsAppMessage.update({
        where: { id: dbMsg.id },
        data: {
          status: "FAILED",
          errorCode: errCode,
          errorMessage: errMsg,
        },
      });
      return { success: false, id: dbMsg.id, error: errMsg, code: errCode };
    }

    const wamid = data.messages?.[0]?.id;
    await whatsappDb.whatsAppMessage.update({
      where: { id: dbMsg.id },
      data: {
        status: "SENT",
        wamid: wamid || null,
      },
    });

    return { success: true, id: dbMsg.id, wamid };
  } catch (err: any) {
    await whatsappDb.whatsAppMessage.update({
      where: { id: dbMsg.id },
      data: {
        status: "FAILED",
        errorMessage: err?.message || String(err),
      },
    });
    return { success: false, id: dbMsg.id, error: err?.message };
  }
}

export async function sendWhatsAppOtp(phoneNumber: string, otp: string, purpose: string = "LOGIN") {
  const formattedPhone = phoneNumber.replace(/\D/g, "");
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

  // Send message
  const textBody = `Your Sportsvilla verification code is: *${otp}*\n\nDo not share this code with anyone. Valid for 10 minutes.`;
  return await sendWhatsAppMessage({
    to: formattedPhone,
    type: "text",
    text: textBody,
    metadata: { purpose, otpSent: true },
  });
}

export async function sendWhatsAppMagicLogin(phoneNumber: string, magicToken: string, purpose: string = "MAGIC_LOGIN") {
  const formattedPhone = phoneNumber.replace(/\D/g, "");
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
