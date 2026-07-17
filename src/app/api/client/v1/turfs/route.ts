import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sportId = searchParams.get('sportId');

    if (!sportId) {
      return NextResponse.json({ error: 'sportId is required' }, { status: 400 });
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
    
    return NextResponse.json({ success: true, turfs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
