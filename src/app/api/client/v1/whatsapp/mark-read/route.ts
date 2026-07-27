import { NextResponse } from 'next/server';
import { whatsappDb } from '@/lib/whatsappDb';
import { jsonResponse } from '@/lib/api-logger';

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return jsonResponse({ success: false, error: 'phoneNumber is required' }, { status: 400 });
    }

    // Mark all incoming unread messages for this phone number as READ
    await whatsappDb.whatsAppMessage.updateMany({
      where: {
        phoneNumber,
        direction: 'INCOMING',
        status: {
          in: ['RECEIVED', ''],
        }
      },
      data: {
        status: 'READ'
      }
    });

    return jsonResponse({ success: true });
  } catch (err: any) {
    console.error("[WHATSAPP MARK-READ API ERROR]", err);
    return jsonResponse({
      success: false,
      error: err.message || "Failed to mark messages as read"
    }, { status: 500 });
  }
}
