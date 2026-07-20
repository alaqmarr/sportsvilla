import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse } from '@/lib/api-logger';

export async function GET(request: Request) {
  console.log(`[API] GET /api/client/v1/turfs called`);
  try {
    const { searchParams } = new URL(request.url);
    const sportId = searchParams.get('sportId');

    if (!sportId) {
      return jsonResponse({ error: 'sportId is required' }, { status: 400 });
    }

    const turfs = await prisma.turf.findMany({
      where: {
        sports: {
          some: {
            sportId
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return jsonResponse({ success: true, turfs });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/turfs ->`, error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
