import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function authenticateClient(request: Request) {
  let token = null;

  // 1. Check Authorization header (used by mobile app)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split("Bearer ")[1];
  }

  // 2. Fallback to HttpOnly cookie (used by web app)
  if (!token) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/sv_session=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }

  if (!token) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

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

    let member = null;

    if (decodedToken.memberId) {
      member = await prisma.member.findUnique({
        where: { id: decodedToken.memberId },
      });
    }

    if (!member) {
      // Fallback for older tokens that don't have memberId
      let lookupMobile = "";
      if (phoneNumber) {
        let cleanMobile = phoneNumber.replace(/^\+91/, "");
        if (cleanMobile.startsWith("+")) cleanMobile = cleanMobile.substring(1);
        lookupMobile = cleanMobile;
      } else if (email) {
        lookupMobile = email.split("@")[0];
      }
  
      member = await prisma.member.findFirst({
        where: { mobile: lookupMobile },
      });
    }

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
