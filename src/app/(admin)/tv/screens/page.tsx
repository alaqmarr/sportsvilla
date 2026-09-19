import { prisma } from "@/core/database/prisma";
import ScreensClient from "./ScreensClient";

export const dynamic = 'force-dynamic';

export default async function TvScreensPage() {
  const screens = await prisma.tvScreen.findMany({
    orderBy: { createdAt: "desc" },
    include: { screenGroup: true }
  });

  const screenGroups = await prisma.tvScreenGroup.findMany({
    orderBy: { name: "asc" }
  });

  return <ScreensClient initialScreens={screens} screenGroups={screenGroups} />;
}
