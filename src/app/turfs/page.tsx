export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import TurfsClient from "./TurfsClient";

export default async function TurfsPage() {
  const turfs = await prisma.turf.findMany({
    include: {
      parentTurf: true,
      childTurfs: true,
    },
    orderBy: { createdAt: "desc" }
  });
  return <TurfsClient initialTurfs={turfs} />;
}
