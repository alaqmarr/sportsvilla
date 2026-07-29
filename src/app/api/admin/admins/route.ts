import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const callingAdmin = await prisma.admin.findFirst({
      where: { email: session.user.email },
    });

    if (!hasPermission(callingAdmin, "manage:admins")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ admins });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const callingAdmin = await prisma.admin.findFirst({
      where: { email: session.user.email },
    });

    if (!hasPermission(callingAdmin, "manage:admins")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role = "ADMIN", permissions = "" } = body;

    if (role === "SUPERADMIN" && callingAdmin?.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Only a SUPERADMIN can create another SUPERADMIN" }, { status: 403 });
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.admin.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An admin account with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "ADMIN",
        permissions: permissions || "",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_ADMIN",
        entity: "Admin",
        entityId: newAdmin.id,
        details: JSON.stringify({ email: newAdmin.email, role: newAdmin.role }),
        adminId: callingAdmin?.id,
        adminName: callingAdmin?.name || callingAdmin?.email || "System",
      }
    });

    return NextResponse.json({ admin: newAdmin }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const callingAdmin = await prisma.admin.findFirst({
      where: { email: session.user.email },
    });

    if (!hasPermission(callingAdmin, "manage:admins")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, role, permissions, isActive, password } = body;

    if (!id) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    
    if (role !== undefined) {
      if (role === "SUPERADMIN" && callingAdmin?.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Only a SUPERADMIN can assign the SUPERADMIN role" }, { status: 403 });
      }
      dataToUpdate.role = role;
    }
    
    if (permissions !== undefined) dataToUpdate.permissions = permissions;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (password && password.trim().length > 0) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_ADMIN",
        entity: "Admin",
        entityId: updatedAdmin.id,
        details: JSON.stringify({ updatedFields: Object.keys(dataToUpdate) }),
        adminId: callingAdmin?.id,
        adminName: callingAdmin?.name || callingAdmin?.email || "System",
      }
    });

    return NextResponse.json({ admin: updatedAdmin });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const callingAdmin = await prisma.admin.findFirst({
      where: { email: session.user.email },
    });

    if (!hasPermission(callingAdmin, "manage:admins")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

    if (id === callingAdmin?.id) {
      return NextResponse.json(
        { error: "You cannot delete your own active admin account" },
        { status: 400 }
      );
    }

    // We must fetch the admin being deleted to log their email/name before deleting
    const adminToDelete = await prisma.admin.findFirst({ where: { id } });
    
    await prisma.admin.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_ADMIN",
        entity: "Admin",
        entityId: id,
        details: JSON.stringify({ deletedEmail: adminToDelete?.email }),
        adminId: callingAdmin?.id,
        adminName: callingAdmin?.name || callingAdmin?.email || "System",
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
