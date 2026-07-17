import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sports = await prisma.sport.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ success: true, sports });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
