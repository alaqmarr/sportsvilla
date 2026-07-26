export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import CouponStatsClient from "./CouponStatsClient";
import { notFound } from "next/navigation";

export default async function CouponStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: {
      usages: {
        include: {
          member: true,
          booking: {
            include: {
              turf: true,
              sport: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!coupon) {
    notFound();
  }

  return <CouponStatsClient coupon={coupon} />;
}
