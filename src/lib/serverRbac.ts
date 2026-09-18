import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { Permission } from "@/lib/rbac";

export async function checkPermission(requiredPermission: Permission): Promise<{ authorized: boolean; admin: any }> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { authorized: false, admin: null };
  }

  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
  });

  if (!admin || !admin.isActive) {
    return { authorized: false, admin: null };
  }

  if (admin.role === "SUPERADMIN") {
    return { authorized: true, admin };
  }

  const adminPermissions = (admin.permissions || "").split(",").map(p => p.trim());
  const authorized = adminPermissions.includes(requiredPermission);

  return { authorized, admin };
}

export async function requireApiPermission(requiredPermission: Permission) {
  const { authorized, admin } = await checkPermission(requiredPermission);
  
  if (!authorized) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: You do not have permission to perform this action." },
        { status: 403 }
      ),
      admin: null
    };
  }
  
  return { error: null, admin };
}

export async function requirePagePermission(requiredPermission: Permission) {
  const { authorized, admin } = await checkPermission(requiredPermission);
  
  if (!authorized) {
    redirect("/admin/unauthorized");
  }
  
  return admin;
}
