export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PortalClient from "./PortalClient";

export default async function MemberPortal({ params }: { params: Promise<{ mobile: string }> }) {
  const { mobile } = await params;

  const member = await prisma.member.findUnique({
    where: { mobile },
    include: {
      memberships: {
        include: {
          membershipPlan: {
            include: { sport: true }
          }
        }
      },
      attendances: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { sport: true, membershipPlan: true }
      }
    }
  });

  if (!member) {
    return notFound();
  }

  // Filter active and expired plans
  const now = new Date();
  const activePlans = member.memberships.filter(m => new Date(m.endDate) >= now && m.status === "ACTIVE");
  const expiredPlans = member.memberships.filter(m => new Date(m.endDate) < now || m.status !== "ACTIVE");

  return <PortalClient member={member} activePlans={activePlans} expiredPlans={expiredPlans} attendances={member.attendances} />;
}
