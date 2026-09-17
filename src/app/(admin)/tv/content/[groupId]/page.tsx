import { prisma } from "@/lib/prisma";
import ContentClient from "./ContentClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function TvContentPage({ params }: { params: { groupId: string } }) {
  const group = await prisma.tvScreenGroup.findUnique({
    where: { id: params.groupId },
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
