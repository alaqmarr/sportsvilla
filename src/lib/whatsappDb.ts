import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/whatsapp-client/client';

const url = (process.env.WHATSAPP_DB_URL || process.env.WHATSAPP_DB_UL || 'file:./whatsapp.db').replace('file:', '');
const adapter = new PrismaBetterSqlite3({ url });

const globalForPrisma = globalThis as unknown as {
  whatsapp_prisma_v1: PrismaClient | undefined;
};

export const whatsappDb =
  globalForPrisma.whatsapp_prisma_v1 ??
  new PrismaClient({ adapter, log: ["warn", "error"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.whatsapp_prisma_v1 = whatsappDb;
}
