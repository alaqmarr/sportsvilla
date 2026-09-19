export const dynamic = 'force-dynamic';
import { prisma } from "@/core/database/prisma";
import TurfsClient from "./TurfsClient";
import { getAvailableIcons } from "@/core/utils/icons";

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
