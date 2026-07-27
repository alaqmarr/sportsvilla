import LoginClient from "./LoginClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: { magic?: string, magic_verified?: string } }) {
  if (searchParams.magic) {
    redirect(`/api/client/v1/auth/magic/verify?token=${searchParams.magic}`);
  }

  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  // If absolutely no admins exist, redirect to setup
  const adminCount = await prisma.admin.count();
  if (adminCount === 0) {
    redirect("/setup");
  }

  return <LoginClient magicVerified={searchParams.magic_verified} />;
}
