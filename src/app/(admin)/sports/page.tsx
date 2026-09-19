export const dynamic = 'force-dynamic';
import { prisma } from "@/core/database/prisma";
import SportsClient from "./SportsClient";
import { getAvailableIcons } from "@/core/utils/icons";

export default async function SportsPage() {
  const sports = await prisma.sport.findMany({ 
    orderBy: { createdAt: "desc" },
    include: {
      turfs: {
        include: {
          turf: true
        }
      }
    }
  });
  const turfs = await prisma.turf.findMany({ orderBy: { name: "asc" } });
  const icons = getAvailableIcons();
  
  return <SportsClient initialSports={sports} availableIcons={icons} allTurfs={turfs} />;
}
