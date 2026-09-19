/**
 * Normalizes card UID by removing colons, dashes, spaces, and converting to uppercase hex.
 */
export function normalizeCardUid(rawUid: string): string {
  return rawUid.trim().replace(/[^a-fA-F0-9]/g, "").toUpperCase();
}
