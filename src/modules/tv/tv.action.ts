"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import {
  deleteContentItemCore,
  reorderContentItemsCore,
  createScreenGroupCore,
  createScreenCore,
  deleteScreenCore,
  ReorderContentItemInput,
} from "./tv.lib";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Admin session required");
  }
  return session;
}

export async function deleteContentItem(id: string) {
  await requireAdminSession();
  return await deleteContentItemCore(id);
}

export async function reorderContentItems(items: ReorderContentItemInput[]) {
  await requireAdminSession();
  return await reorderContentItemsCore(items);
}

export async function createScreenGroup(name: string) {
  await requireAdminSession();
  return await createScreenGroupCore(name);
}

export async function createScreen(label: string, screenGroupId: string) {
  await requireAdminSession();
  return await createScreenCore(label, screenGroupId);
}

export async function deleteScreen(id: string) {
  await requireAdminSession();
  return await deleteScreenCore(id);
}
