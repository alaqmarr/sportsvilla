import { prisma } from "@/lib/prisma";
import MembersClient from "./MembersClient";

export default async function MembersPage() {
  const [members, plans] = await Promise.all([
    prisma.member.findMany({
      include: {
        memberships: {
          include: { membershipPlan: { include: { sport: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.membershipPlan.findMany({
      include: { sport: true },
      orderBy: { name: "asc" }
    })
  ]);
  
  return <MembersClient initialMembers={members} plans={plans} />;
}
