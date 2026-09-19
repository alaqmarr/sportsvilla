import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/client/client';

const dbPath = (process.env.DATABASE_URL || 'file:./dev.db').replace('file:', '').replace('./', '');

// Configure SQLite for concurrent access (app + web hitting same DB)
const rawDb = new Database(dbPath);
rawDb.pragma('journal_mode = WAL');
rawDb.pragma('busy_timeout = 5000');
rawDb.pragma('synchronous = NORMAL');
rawDb.pragma('foreign_keys = ON');

const adapter = new PrismaBetterSqlite3({ url: dbPath });

const globalForPrisma = globalThis as unknown as {
  prisma_v3: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma_v3 ??
  new PrismaClient({ adapter, log: ["warn", "error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v3 = prisma;