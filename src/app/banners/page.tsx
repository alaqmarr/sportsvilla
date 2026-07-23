import { prisma } from "@/lib/prisma";
import BannersClient from "./BannersClient";

export const dynamic = 'force-dynamic';

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: "desc" },
    include: { targetSport: true }
  });

  const sports = await prisma.sport.findMany({
    orderBy: { name: "asc" }
  });

  return <BannersClient initialBanners={banners} sports={sports} />;
}
