import { addDays } from "date-fns";
import { getISTDateBounds } from "@/core/utils/dateUtils";
import { prisma } from "@/core/database/prisma";

export function calculateMembershipDateRange(startDate: string | Date, durationInDays: number) {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = addDays(start, durationInDays);
  return { start, end };
}

export function parseAllowedDays(allowedDays?: number[] | null): string | null {
  if (!allowedDays || allowedDays.length === 0 || allowedDays.length >= 7) {
    return null;
  }
  return allowedDays.join(",");
}

export function formatISTMembershipDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Generates a collision-safe member ID in the format `${mobile}_${n}`.
 * Guarantees uniqueness even if concurrent creations occur.
 */
export async function generateMemberId(mobile: string): Promise<string> {
  let idx = (await prisma.member.count({ where: { mobile } })) + 1;
  let candidate = `${mobile}_${idx}`;
  let existing = await prisma.member.findUnique({ where: { id: candidate } });
  while (existing) {
    idx++;
    candidate = `${mobile}_${idx}`;
    existing = await prisma.member.findUnique({ where: { id: candidate } });
  }
  return candidate;
}
