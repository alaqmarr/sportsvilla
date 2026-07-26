"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createAdmin(data: { name: string; email: string; password: string }) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const admin = await prisma.admin.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
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
