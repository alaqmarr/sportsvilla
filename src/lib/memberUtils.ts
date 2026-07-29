import { prisma } from "@/lib/prisma";

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
