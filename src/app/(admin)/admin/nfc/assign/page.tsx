export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import AssignClient from "./AssignClient";

export default async function AssignNfcPage() {
  const initialCards = await prisma.nfcCard.findMany({
    include: {
      member: {
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
          walletBalance: true,
        },
      },
      _count: {
        select: {
          transactions: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return <AssignClient initialCards={initialCards} />;
}
