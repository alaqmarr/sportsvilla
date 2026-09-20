import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: "Invalid credentials or account inactive" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Sign a token valid for 30 days for the mobile app
    const token = jwt.sign(
      { email: admin.email, id: admin.id, role: admin.role },
      process.env.NEXTAUTH_SECRET || "fallback-secret",
      { expiresIn: "30d" }
    );

    // Filter out sensitive data before returning user object
    const userPayload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions ? admin.permissions.split(",").map(p => p.trim()) : [],
    };

    return NextResponse.json({ token, user: userPayload }, { status: 200 });

  } catch (error) {
    console.error("Admin Login Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
