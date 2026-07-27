import { NextRequest, NextResponse } from "next/server";
import { whatsappDb } from "@/lib/whatsappDb";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const DEFAULT_VERIFY_TOKEN = "sportsvilla_whatsapp_webhook_token_2026";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || DEFAULT_VERIFY_TOKEN;

  if (mode === "subscribe" && token === expectedToken) {
    console.log("WhatsApp Webhook verified successfully via Meta.");
    // Meta expects plain text response containing ONLY the hub.challenge string
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse("Forbidden - Token verification failed", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      body = { raw: rawBody };
    }

    // Log the raw webhook payload safely (won't crash if db push was forgotten)
    try {
      await whatsappDb.whatsAppWebhookLog.create({
        data: {
          event: body.object || "messages",
          payload: rawBody,
          processed: true,
        },
      });
    } catch (logErr) {
      console.error("[WEBHOOK RAW LOG CREATE ERROR - Run npx prisma db push --schema=prisma/whatsapp.prisma]", logErr);
    }

    // Check if event is from WhatsApp API
    if (body.object === "whatsapp_business_account") {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value || {};

          const field = change.field;

          // Account Health Metrics
          if (field === "phone_number_quality_update") {
            const displayPhoneNumber = value.display_phone_number;
            const event = value.event; // e.g. "FLAGGED", "RESTORED", "APPROVED"
            
            // Map event to quality rating roughly
            let quality = "YELLOW";
            if (event === "RESTORED" || event === "APPROVED") quality = "GREEN";
            if (event === "FLAGGED") quality = "RED";

            await whatsappDb.whatsAppAccountMetric.upsert({
              where: { id: "singleton" },
              update: { qualityRating: quality },
              create: { qualityRating: quality }
            });
            continue;
          }

          if (field === "business_capability_update") {
            const limit = value.max_daily_conversation_per_phone_number;
            let limitStr = "UNKNOWN";
            if (limit === 250) limitStr = "250";
            if (limit === 1000) limitStr = "1K";
            if (limit === 10000) limitStr = "10K";
            if (limit === 100000) limitStr = "100K";
            if (limit === "UNLIMITED") limitStr = "UNLIMITED";

            await whatsappDb.whatsAppAccountMetric.upsert({
              where: { id: "singleton" },
              update: { messagingLimit: limitStr },
              create: { messagingLimit: limitStr }
            });
            continue;
          }

          if (field === "message_template_status_update") {
            const templateName = value.message_template_name;
            const language = value.message_template_language;
            const event = value.event; // APPROVED, REJECTED, PAUSED

            if (templateName) {
              await whatsappDb.whatsAppTemplate.upsert({
                where: { name: templateName },
                update: { status: event, language: language || "en" },
                create: { name: templateName, status: event, language: language || "en" }
              });
            }
            continue;
          }

          // Handle delivery/read status updates
          const statuses = value.statuses || [];
          for (const statusObj of statuses) {
            const wamid = statusObj.id;
            const newStatus = statusObj.status?.toUpperCase() || "RECEIVED";
            if (wamid) {
              let isOptOut = false;
              if (newStatus === "FAILED" && statusObj.errors?.some((e: any) => e.code === 131047)) {
                // User blocked or opted out
                isOptOut = true;
              }

              await whatsappDb.whatsAppMessage.updateMany({
                where: { wamid },
                data: { status: newStatus, ...(isOptOut && { isOptOut }) },
              });
            }

            // Handle conversations for billing
            if (statusObj.conversation) {
              const convId = statusObj.conversation.id;
              const category = statusObj.pricing?.category || statusObj.conversation.origin?.type || "unknown";
              const expStr = statusObj.conversation.expiration_timestamp;
              
              if (convId && expStr) {
                const expiresAt = new Date(parseInt(expStr, 10) * 1000);
                
                await whatsappDb.whatsAppConversation.upsert({
                  where: { wacId: convId },
                  update: { expiresAt },
                  create: {
                    wacId: convId,
                    recipientMobile: statusObj.recipient_id || "",
                    category,
                    openedAt: new Date(),
                    expiresAt,
                    cost: 0.8 // Approx cost for INR, can be tuned
                  }
                });
              }
            }
          }

          // Handle incoming messages from users
          const messages = value.messages || [];
          for (const msg of messages) {
            const wamid = msg.id;
            const from = msg.from;
            const type = msg.type?.toUpperCase() || "TEXT";
            const content =
              msg.text?.body ||
              msg.button?.text ||
              JSON.stringify(msg[msg.type] || {});

            const isOptOutMsg = content.trim().toLowerCase() === "stop";

            await whatsappDb.whatsAppMessage.upsert({
              where: { wamid: wamid || "unknown_incoming_" + Date.now() },
              update: {},
              create: {
                wamid: wamid || null,
                phoneNumber: from,
                direction: "INCOMING",
                type,
                content: content || "",
                status: "RECEIVED",
                isOptOut: isOptOutMsg
              },
            });

            if (isOptOutMsg) {
              // No auto-reply for opt-outs
              continue;
            }

            // Auto-Reply: Customizable via WhatsAppConfig table
            try {
              const configs = await whatsappDb.whatsAppConfig.findMany();
              const configMap: Record<string, string> = {};
              for (const c of configs) configMap[c.key] = c.value;

              const isEnabled = configMap["AUTO_REPLY_ENABLED"] !== "false"; // Default true
              if (isEnabled) {
                const cooldownMins = parseInt(configMap["AUTO_REPLY_COOLDOWN_MINUTES"] || "10", 10) || 10;
                const cooldownTime = new Date(Date.now() - cooldownMins * 60 * 1000);

                const recentReply = await whatsappDb.whatsAppMessage.findFirst({
                  where: {
                    phoneNumber: from,
                    direction: "OUTGOING",
                    createdAt: { gte: cooldownTime },
                  },
                });

                if (!recentReply) {
                  const defaultIntro = `Welcome to *SportsVilla*! 🏆\nThank you for reaching out. Our automated sports booking & tournament platform is currently in active beta.\n\nFor immediate assistance, booking inquiries, or support, please contact Alaqmar directly:\n📞 *Phone / WhatsApp*: +91 9618443558\n🌐 *Website*: https://sportsvilla.co.in\n\nWe will get back to you shortly!`;
                  const replyText = configMap["AUTO_REPLY_MESSAGE"] || defaultIntro;

                  await sendWhatsAppMessage({
                    to: from,
                    type: "text",
                    text: replyText,
                    metadata: { purpose: "AUTO_REPLY", triggeredBy: wamid },
                  });
                }
              }
            } catch (replyErr) {
              console.error("[AUTO REPLY ERROR]", replyErr);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err: any) {
    console.error("WhatsApp Webhook error:", err);
    // Always return 200 to Meta so webhook does not get disabled
    return NextResponse.json({ status: "error", message: err?.message }, { status: 200 });
  }
}
