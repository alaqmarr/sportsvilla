"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function deleteContentItem(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  await prisma.tvContentItem.delete({ where: { id } });
  return { success: true };
}

export async function reorderContentItems(items: { id: string, sortOrder: number }[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  // In a real app we'd use a transaction
  for (const item of items) {
    await prisma.tvContentItem.update({
      where: { id: item.id },
      data: { sortOrder: item.sortOrder }
    });
  }
  return { success: true };
}
