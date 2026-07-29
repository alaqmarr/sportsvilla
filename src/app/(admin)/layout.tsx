import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const currentAdmin = await prisma.admin.findFirst({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      permissions: true,
      isActive: true,
    },
  });

  if (!currentAdmin || currentAdmin.isActive === false) {
    redirect("/login");
  }

  return <Navigation admin={currentAdmin}>{children}</Navigation>;
}
