import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { jsonResponse } from '@/lib/api-logger';

export async function POST(request: Request) {
  console.log(`[API] POST /api/client/v1/auth/check called`);
  try {
    const { mobile } = await request.json();
    
    // Clean mobile number (remove +91 if present)
    const cleanMobile = mobile ? mobile.replace('+91', '').replace(/[^0-9]/g, '') : '';
    
    if (!cleanMobile || cleanMobile.length < 10) {
      return jsonResponse({ error: "Invalid mobile number" }, { status: 400 });
    }

    const member = await prisma.member.findFirst({
      where: { mobile: cleanMobile }
    });

    return jsonResponse({ 
      success: true, 
      exists: !!member,
      memberId: member?.id
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/auth/check ->`, error);
    logger.error('Auth Check failed', { error: error.message });
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
