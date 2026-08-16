export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import TurfsClient from "./TurfsClient";
import { getAvailableIcons } from "@/lib/icons";

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

  const icons = getAvailableIcons();

  return <TurfsClient initialTurfs={turfs} sports={sports} availableIcons={icons} />;
}
