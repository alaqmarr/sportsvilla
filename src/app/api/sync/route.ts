import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [member, attendance, plan, sport, turf] = await Promise.all([
      prisma.member.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.attendance.findFirst({ orderBy: { scannedAt: 'desc' }, select: { scannedAt: true } }),
      prisma.plan.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.sport.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.turf.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    ]);

    const times = [
      member?.updatedAt?.getTime() || 0,
      attendance?.scannedAt?.getTime() || 0,
      plan?.updatedAt?.getTime() || 0,
      sport?.updatedAt?.getTime() || 0,
      turf?.updatedAt?.getTime() || 0,
    ];

    const latest = Math.max(...times);
    
    return NextResponse.json({ latest });
  } catch (error) {
    return NextResponse.json({ latest: 0 }, { status: 500 });
  }
}
