import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/whatsapp-client/client';

const dbPath = (process.env.WHATSAPP_DB_URL || process.env.WHATSAPP_DB_UL || 'file:./whatsapp.db').replace('file:', '').replace('./', '');

// Configure SQLite WAL for concurrent access
const rawWaDb = new Database(dbPath);
rawWaDb.pragma('journal_mode = WAL');
rawWaDb.pragma('busy_timeout = 5000');
rawWaDb.pragma('synchronous = NORMAL');
rawWaDb.pragma('foreign_keys = ON');

const adapter = new PrismaBetterSqlite3({ url: dbPath });

const globalForPrisma = globalThis as unknown as {
  whatsapp_prisma_v1: PrismaClient | undefined;
};

export const whatsappDb =
  globalForPrisma.whatsapp_prisma_v1 ??
  new PrismaClient({ adapter, log: ["warn", "error"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.whatsapp_prisma_v1 = whatsappDb;
}
