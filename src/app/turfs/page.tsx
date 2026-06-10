export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import TurfsClient from "./TurfsClient";

export default async function TurfsPage() {
  const turfs = await prisma.turf.findMany({
    include: {
      parentTurf: true,
      childTurfs: true,
      sports: { include: { sport: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  
  const sports = await prisma.sport.findMany({
    orderBy: { name: "asc" }
  });

  return <TurfsClient initialTurfs={turfs} sports={sports} />;
}
