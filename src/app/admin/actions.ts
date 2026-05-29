"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAdmin(data: { name: string; email: string; password: string }) {
  // In production, password should be hashed with bcrypt. For this MVP, we store as-is.
  const admin = await prisma.admin.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password, // IMPORTANT: hash this in production
    },
    select: { id: true, name: true, email: true, createdAt: true }
  });
  revalidatePath("/", "layout");
  return admin;
}

export async function deleteAdmin(id: string) {
  await prisma.admin.delete({ where: { id } });
  revalidatePath("/", "layout");
}
