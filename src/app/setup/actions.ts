"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createInitialAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    return { error: "All fields are required" };
  }

  // Double check in server action
  const count = await prisma.admin.count();
  if (count > 0) {
    return { error: "Setup already complete. Admin exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
