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
    const decodedToken = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev",
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
  } catch (error) {
    return {
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }
}
