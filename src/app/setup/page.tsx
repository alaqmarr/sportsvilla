import SetupClient from "./SetupClient";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  const adminCount = await prisma.admin.count();
  
  if (adminCount > 0) {
    redirect("/login");
  }

  return <SetupClient />;
}
