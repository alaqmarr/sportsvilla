import { NextResponse, NextRequest } from 'next/server';
import { whatsappDb } from '@/lib/whatsappDb';
import { jsonResponse } from '@/lib/api-logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: templateName } = await params;
    const { headerImageUrl } = await req.json();

    if (!templateName) {
      return jsonResponse({ success: false, error: "Template name is required" }, { status: 400 });
    }

    const updatedTemplate = await whatsappDb.whatsAppTemplate.upsert({
      where: { name: templateName },
      update: { headerImageUrl },
      create: {
        name: templateName,
        headerImageUrl,
        category: "MARKETING",
        language: "en",
        status: "APPROVED"
      }
    });

    return jsonResponse({
      success: true,
      template: updatedTemplate
    });
  } catch (error: any) {
    console.error("[TEMPLATE UPDATE ERROR]", error);
    return jsonResponse({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message || "Failed to update template config"
    }, { status: 500 });
  }
}
