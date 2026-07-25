export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import MembersClient from "./MembersClient";

export default async function MembersPage() {
  const [members, plans, turfs] = await Promise.all([
    prisma.member.findMany({
      include: {
        memberships: {
          include: { 
            membershipPlan: { include: { sport: true } },
            turf: true 
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.membershipPlan.findMany({
      include: { sport: true },
      orderBy: { name: "asc" }
    }),
    prisma.turf.findMany({
      include: { sports: true },
      orderBy: { name: "asc" }
    })
  ]);
  
  return <MembersClient initialMembers={members} plans={plans} turfs={turfs} />;
}
