import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function authenticateTvDevice(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const screen = await prisma.tvScreen.findFirst({
    where: { deviceToken: hashedToken }
  });

  return screen;
}
