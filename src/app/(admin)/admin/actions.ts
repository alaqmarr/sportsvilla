"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Admin session required");
  }
  return session as typeof session & { user: { email: string } };
}


export async function createAdmin(data: { name: string; email: string; password: string }) {
  await requireAdminSession();
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
  const session = await requireAdminSession();
  const currentAdmin = await prisma.admin.findFirst({ where: { email: session.user.email } });
  if (currentAdmin?.id === id) {
    throw new Error("Cannot delete your own admin account");
  }

  await prisma.admin.delete({ where: { id } });
  revalidatePath("/", "layout");
}

