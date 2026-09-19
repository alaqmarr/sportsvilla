import { prisma } from "@/core/database/prisma";

export interface ReorderContentItemInput {
  id: string;
  sortOrder: number;
}

export async function deleteContentItemCore(id: string) {
  await prisma.tvContentItem.delete({ where: { id } });
  return { success: true };
}

export async function reorderContentItemsCore(items: ReorderContentItemInput[]) {
  // In a real app we'd use a transaction
  for (const item of items) {
    await prisma.tvContentItem.update({
      where: { id: item.id },
      data: { sortOrder: item.sortOrder },
    });
  }
  return { success: true };
}

export async function createScreenGroupCore(name: string) {
  return await prisma.tvScreenGroup.create({
    data: { name },
  });
}

export async function createScreenCore(label: string, screenGroupId: string) {
  return await prisma.tvScreen.create({
    data: { label, screenGroupId },
  });
}

export async function deleteScreenCore(id: string) {
  await prisma.tvScreen.delete({ where: { id } });
  return { success: true };
}
