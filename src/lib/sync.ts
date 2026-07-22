import { prisma } from '@/lib/prisma';

/**
 * Bumps the LastUpdate singleton row to notify all polling admin clients
 * that data has changed and they should refresh.
 * Call this after any create/update/delete operation on important tables.
 */
export async function bumpSyncTimestamp(source: string = 'unknown') {
  try {
    await prisma.lastUpdate.upsert({
      where: { id: 'singleton' },
      update: { timestamp: new Date(), source },
      create: { id: 'singleton', timestamp: new Date(), source }
    });
  } catch (e) {
    // Non-critical — don't let sync failures break the main operation
    console.error('[Sync] Failed to bump LastUpdate:', e);
  }
}
