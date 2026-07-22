'use server'

import { prisma } from "@/lib/prisma";

export async function fetchAuditLogs(limit = 100) {
  return await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}
