export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import WalletsClient from "./WalletsClient";

export default async function WalletsPage() {
  const members = await prisma.member.findMany({
    include: {
      walletTransactions: {
        orderBy: { createdAt: "desc" },
        take: 50 // Limit to latest 50 for initial load
      }
    },
    orderBy: { createdAt: "desc" }
  });
  
  return <WalletsClient initialMembers={members} />;
}
