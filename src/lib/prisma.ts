import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/client/client';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL?.replace('file:', '') || './dev.db' });

const globalForPrisma = globalThis as unknown as {
  prisma_v3: PrismaClient| undefined;
};

export const prisma =
  globalForPrisma.prisma_v3 ??
  new PrismaClient({ adapter, log: ["query"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v3 = prisma;