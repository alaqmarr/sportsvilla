import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { jsonResponse } from '@/lib/api-logger';

export async function POST(request: Request) {
  try {
    const { mobile, templateName, languageCode, parameters, buttonUrlParam } = await request.json();

    if (!mobile || !templateName) {
      return jsonResponse({ error: "Mobile number and Template Name are required" }, { status: 400 });
    }

    const cleanMobile = mobile.replace(/^\+91/, "").replace(/[^0-9]/g, "");

    let templateComponents: any[] = [];

    // If there is a button URL parameter (like magic token), add it to components
    if (buttonUrlParam) {
      templateComponents.push({
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [
          {
            type: "text",
            text: buttonUrlParam
          }
        ]
      });
    }

    // If there are body text parameters (like {{1}}, {{2}}), add them
    if (parameters && Array.isArray(parameters) && parameters.length > 0) {
      templateComponents.push({
        type: "body",
        parameters: parameters.map((val: string) => ({
          type: "text",
          text: val
        }))
      });
    }

    const res = await sendWhatsAppMessage({
      to: cleanMobile,
      type: "template",
      templateName: templateName,
      languageCode: languageCode || "en",
      templateComponents: templateComponents.length > 0 ? templateComponents : undefined,
      metadata: { purpose: "TEST_TEMPLATE", templateName }
    });

    if (!res.success) {
      return jsonResponse({ success: false, error: res.error, details: res.error }, { status: 400 });
    }

    return jsonResponse({
      success: true,
      message: `Template "${templateName}" sent successfully!`,
      wamid: (res as any).wamid,
      id: res.id
    });
  } catch (err: any) {
    console.error("[TEST TEMPLATE ERROR]", err);
    return jsonResponse({ success: false, error: err.message }, { status: 500 });
  }
}
