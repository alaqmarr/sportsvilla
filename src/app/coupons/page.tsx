export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import CouponsClient from "./CouponsClient";

export default async function CouponsPage() {
  const [coupons, members] = await Promise.all([
    prisma.coupon.findMany({
      include: {
        usages: true,
        assignments: {
          include: { member: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.member.findMany({
      select: { id: true, name: true, mobile: true },
      orderBy: { name: "asc" }
    })
  ]);
  
  return <CouponsClient initialCoupons={coupons} members={members} />;
}
