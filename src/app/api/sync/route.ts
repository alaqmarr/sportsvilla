import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Single-row lookup — O(1) instead of 5 full-table scans
    const lastUpdate = await prisma.lastUpdate.findUnique({
      where: { id: 'singleton' }
    });

    const latest = lastUpdate?.timestamp?.getTime() || 0;
    
    return NextResponse.json({ latest });
  } catch (error) {
    return NextResponse.json({ latest: 0 }, { status: 500 });
  }
}
