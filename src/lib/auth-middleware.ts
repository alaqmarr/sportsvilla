import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function authenticateClient(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('FATAL: NEXTAUTH_SECRET environment variable is not set!');
      return { error: NextResponse.json({ error: 'Server configuration error' }, { status: 500 }) };
    }

    const decodedToken = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET!
    ) as any;

    const phoneNumber = decodedToken.uid;
    const email = decodedToken.email;

    if (!phoneNumber && !email) {
      return {
        error: NextResponse.json(
          { error: "No phone or email linked" },
          { status: 401 },
        ),
      };
    }

    let lookupMobile = "";
    if (phoneNumber) {
      let cleanMobile = phoneNumber.replace(/^\+91/, "");
      if (cleanMobile.startsWith("+")) cleanMobile = cleanMobile.substring(1);
      lookupMobile = cleanMobile;
    } else if (email) {
      lookupMobile = email.split("@")[0];
    }

    const member = await prisma.member.findFirst({
      where: { mobile: lookupMobile },
    });

    if (!member) {
      return {
        error: NextResponse.json(
          { error: "Member not found" },
          { status: 404 },
        ),
      };
    }

    return { member, decodedToken };
  } catch (error: any) {
    console.error("JWT Verification Error:", error.message, "Token:", token.substring(0, 20) + "...");
    return {
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }
}
