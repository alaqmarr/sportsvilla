import { prisma } from "@/lib/prisma";
import ContentClient from "./ContentClient";
import { notFound } from "next/navigation";
import { PERMISSIONS } from "@/lib/rbac";
import { requirePagePermission } from "@/lib/serverRbac";


export const dynamic = 'force-dynamic';

export default async function TvContentPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  await requirePagePermission(PERMISSIONS.MANAGE_TV);

  const group = await prisma.tvScreenGroup.findUnique({
    where: { id: groupId },
    include: {
      contentItems: {
        orderBy: { sortOrder: "asc" }
      }
    }
  });

  if (!group) return notFound();

  const publicUrlBase = process.env.R2_PUBLIC_URL || "";

  return <ContentClient group={group} initialItems={group.contentItems} publicUrlBase={publicUrlBase} />;
}
