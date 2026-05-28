import { prisma } from "@/lib/prisma";
import SportsClient from "./SportsClient";

export default async function SportsPage() {
  const sports = await prisma.sport.findMany({ orderBy: { createdAt: "desc" } });
  return <SportsClient initialSports={sports} />;
}
