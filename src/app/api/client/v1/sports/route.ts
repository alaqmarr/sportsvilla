import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse } from '@/lib/api-logger';

export async function GET() {
  try {
    const sports = await prisma.sport.findMany({
      orderBy: { name: 'asc' }
    });
    return jsonResponse({ success: true, sports });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/sports ->`, error);
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
