"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import {
  createAdminCore,
  deleteAdminCore,
  fetchLogsCore,
  getAppVersionsCore,
  saveAppVersionCore,
  fetchAuditLogsCore,
  fetchServerStatsCore,
} from "./system.lib";
import type { CreateAdminInput, SaveAppVersionInput, AppLog, ServerStats } from "./system.lib";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Admin session required");
  }
  return session as typeof session & { user: { email: string } };
}

export async function createAdmin(data: CreateAdminInput) {
  await requireAdminSession();
  const admin = await createAdminCore(data);
  revalidatePath("/", "layout");
  return admin;
}

export async function deleteAdmin(id: string) {
  const session = await requireAdminSession();
  await deleteAdminCore(id, session.user.email);
  revalidatePath("/", "layout");
}

export async function fetchLogs(): Promise<AppLog[]> {
  return await fetchLogsCore();
}

export async function getAppVersions() {
  return await getAppVersionsCore();
}

export async function saveAppVersion(data: SaveAppVersionInput) {
  await requireAdminSession();
  await saveAppVersionCore(data);
  revalidatePath("/app-versions");
}

export async function fetchAuditLogs(limit: number = 100) {
  return await fetchAuditLogsCore(limit);
}

export async function fetchServerStats(): Promise<ServerStats> {
  return await fetchServerStatsCore();
}
