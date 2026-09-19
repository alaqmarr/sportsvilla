import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import { whatsappDb } from "@/core/database/whatsappDb";
import { jsonResponse } from "@/core/logging/api-logger";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return jsonResponse({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const events = await whatsappDb.whatsAppEventTrigger.findMany({
      orderBy: { eventName: "asc" }
    });
    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return jsonResponse({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { eventName, templateName, isActive } = await req.json();

    if (!eventName) {
      return NextResponse.json({ success: false, error: "eventName is required" }, { status: 400 });
    }

    const event = await whatsappDb.whatsAppEventTrigger.upsert({
      where: { eventName },
      update: {
        templateName,
        isActive: Boolean(isActive)
      },
      create: {
        eventName,
        templateName,
        isActive: Boolean(isActive)
      }
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
