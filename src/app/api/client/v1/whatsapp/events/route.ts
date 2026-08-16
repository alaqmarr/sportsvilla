import { NextResponse } from "next/server";
import { whatsappDb } from "@/lib/whatsappDb";

export async function GET() {
  try {
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
