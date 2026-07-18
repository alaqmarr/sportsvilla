import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { mobile } = await request.json();
    
    // Clean mobile number (remove +91 if present)
    const cleanMobile = mobile ? mobile.replace('+91', '').replace(/[^0-9]/g, '') : '';
    
    if (!cleanMobile || cleanMobile.length < 10) {
      return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
    }

    const member = await prisma.member.findFirst({
      where: { mobile: cleanMobile }
    });

    return NextResponse.json({ 
      success: true, 
      exists: !!member,
      memberId: member?.id
    });
  } catch (error: any) {
    logger.error('Auth Check failed', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
