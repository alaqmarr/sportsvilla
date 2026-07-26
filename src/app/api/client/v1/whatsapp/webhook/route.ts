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

    // Log the raw webhook payload
    await whatsappDb.whatsAppWebhookLog.create({
      data: {
        event: body.object || "messages",
        payload: rawBody,
        processed: true,
      },
    });

    // Check if event is from WhatsApp API
    if (body.object === "whatsapp_business_account") {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value || {};

          // Handle delivery/read status updates
          const statuses = value.statuses || [];
          for (const statusObj of statuses) {
            const wamid = statusObj.id;
            const newStatus = statusObj.status?.toUpperCase() || "RECEIVED";
            if (wamid) {
              await whatsappDb.whatsAppMessage.updateMany({
                where: { wamid },
                data: { status: newStatus },
              });
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
              },
            });

            // Auto-Reply: If no outgoing reply was sent to this user in the last 10 minutes, send introduction & redirect
            try {
              const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
              const recentReply = await whatsappDb.whatsAppMessage.findFirst({
                where: {
                  phoneNumber: from,
                  direction: "OUTGOING",
                  createdAt: { gte: tenMinutesAgo },
                },
              });

              if (!recentReply) {
                const introText = `Welcome to *SportsVilla*! 🏆\nThank you for reaching out. Our automated sports booking & tournament platform is currently in active beta.\n\nFor immediate assistance, booking inquiries, or support, please contact Alaqmar directly:\n📞 *Phone / WhatsApp*: +91 9618443558\n🌐 *Website*: https://sportsvilla.co.in\n\nWe will get back to you shortly!`;

                await sendWhatsAppMessage({
                  to: from,
                  type: "text",
                  text: introText,
                  metadata: { purpose: "AUTO_REPLY", triggeredBy: wamid },
                });
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
