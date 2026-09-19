import { whatsappDb } from "@/core/database/whatsappDb";

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
export function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return "91" + digits;
  }
  return digits;
}

export async function sendWhatsAppMessage(options: SendWhatsAppOptions) {
  const { to, type, text, templateName, languageCode = "en", templateComponents, metadata, contextMessageId } = options;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Format recipient phone number
  const formattedTo = formatWhatsAppNumber(to);

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
  } else if (type === "template" && templateName) {
    let finalComponents = templateComponents || [];
    
    // Check if we have a locally configured header image for this template
    try {
      const tplConfig = await whatsappDb.whatsAppTemplate.findUnique({ where: { name: templateName }});

      if (tplConfig?.headerImageUrl) {
        const headerIdx = finalComponents.findIndex(c => c.type === 'header' || c.type === 'HEADER');
        if (headerIdx !== -1) {
          if (finalComponents[headerIdx].parameters?.[0]?.image) {
            // ONLY override if the caller didn't explicitly provide a dynamic link (or provided the fallback)
            if (!finalComponents[headerIdx].parameters[0].image.link || finalComponents[headerIdx].parameters[0].image.link === "https://sportsvilla.co.in/short-logo.png") {
              finalComponents[headerIdx].parameters[0].image.link = tplConfig.headerImageUrl;
            }
          }
        } else {
          finalComponents = [
            {
              type: "header",
              parameters: [{ type: "image", image: { link: tplConfig.headerImageUrl } }]
            },
            ...finalComponents
          ];
        }
      }
    } catch (dbErr) {
      console.warn("Failed to lookup template config", dbErr);
    }

    payload.template = {
      name: templateName,
      language: { code: languageCode },
      components: finalComponents,
    };
  }

  // Record outgoing message in SQLite database as PENDING
  let dbMsgId: string | undefined;
  try {
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
    dbMsgId = dbMsg.id;
  } catch (dbErr) {
    console.error("Failed to save pending WhatsApp message to local SQLite DB, but will attempt to send via Meta API anyway", dbErr);
  }

  if (!token || !phoneNumberId) {
    console.warn("Meta WhatsApp API credentials missing (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID). Logged message locally.");
    return { success: false, id: dbMsgId, error: "Missing Meta credentials" };
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
      
      if (dbMsgId) {
        try {
          await whatsappDb.whatsAppMessage.update({
            where: { id: dbMsgId },
            data: {
              status: "FAILED",
              errorCode: errCode,
              errorMessage: errMsg,
            },
          });
        } catch (updateErr) {
           console.error("Failed to update WhatsApp message status to FAILED in local DB", updateErr);
        }
      }
      return { success: false, id: dbMsgId, error: errMsg, code: errCode };
    }

    const wamid = data.messages?.[0]?.id;
    if (dbMsgId) {
      try {
        await whatsappDb.whatsAppMessage.update({
          where: { id: dbMsgId },
          data: {
            status: "SENT",
            wamid: wamid || null,
          },
        });
      } catch (updateErr) {
         console.error("Failed to update WhatsApp message status to SENT in local DB", updateErr);
      }
    }

    return { success: true, id: dbMsgId, wamid };
  } catch (err: any) {
    if (dbMsgId) {
      try {
        await whatsappDb.whatsAppMessage.update({
          where: { id: dbMsgId },
          data: {
            status: "FAILED",
            errorMessage: err?.message || String(err),
          },
        });
      } catch (updateErr) {
         console.error("Failed to update WhatsApp message status to FAILED (exception) in local DB", updateErr);
      }
    }
    return { success: false, id: dbMsgId, error: err?.message };
  }
}
