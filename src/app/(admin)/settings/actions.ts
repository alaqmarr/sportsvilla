"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);
  
  return settingsMap;
}

export async function updateSettings(data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }
  revalidatePath("/", "layout");
}
