import { prisma } from "@/lib/prisma";
import PlansClient from "./PlansClient";

export default async function PlansPage() {
  const [plans, sports] = await Promise.all([
    prisma.membershipPlan.findMany({
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
    }),
    prisma.sport.findMany({
      orderBy: { name: "asc" }
    })
  ]);
  return <PlansClient initialPlans={plans} sports={sports} />;
}
