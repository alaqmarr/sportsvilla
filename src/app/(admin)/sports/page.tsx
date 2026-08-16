export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import SportsClient from "./SportsClient";
import { getAvailableIcons } from "@/lib/icons";

export default async function SportsPage() {
  const sports = await prisma.sport.findMany({ orderBy: { createdAt: "desc" } });
  const icons = getAvailableIcons();
  
  return <SportsClient initialSports={sports} availableIcons={icons} />;
}
