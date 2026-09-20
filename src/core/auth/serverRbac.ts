import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import { prisma } from "@/core/database/prisma";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { Permission } from "./rbac-definitions";

export async function checkPermission(requiredPermission: Permission): Promise<{ authorized: boolean; admin: any }> {
  const session = await getServerSession(authOptions);
  let userEmail = session?.user?.email;

  if (!userEmail) {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as jwt.JwtPayload;
        if (decoded && typeof decoded !== 'string' && decoded.email) userEmail = decoded.email;
      } catch (e) {
        console.error('JWT error:', e);
      }
    }
  }
  
  if (!userEmail) {
    return { authorized: false, admin: null };
  }

  const admin = await prisma.admin.findUnique({
    where: { email: userEmail },
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
