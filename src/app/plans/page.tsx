import { prisma } from "@/lib/prisma";
import PlansClient from "./PlansClient";

export default async function PlansPage() {
  const plans = await prisma.membershipPlan.findMany({
    include: {
      sport: true,
      _count: {
        select: {
          memberships: {
            where: {
              status: "ACTIVE",
              endDate: { gte: new Date() }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  const sports = await prisma.sport.findMany({
    orderBy: { name: "asc" }
  });
  return <PlansClient initialPlans={plans} sports={sports} />;
}
