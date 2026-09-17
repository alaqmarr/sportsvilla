"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createScreenGroup(name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const group = await prisma.tvScreenGroup.create({
    data: { name }
  });
  return group;
}

export async function createScreen(label: string, screenGroupId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const screen = await prisma.tvScreen.create({
    data: { label, screenGroupId }
  });
  return screen;
}

export async function deleteScreen(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  await prisma.tvScreen.delete({ where: { id } });
  return { success: true };
}
