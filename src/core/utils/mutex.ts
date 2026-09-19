export class Mutex {
  private static locks: Map<string, number> = new Map();
  private static DEFAULT_TTL_MS = 30000; // 30 seconds auto-expiration

  private static isLocked(key: string): boolean {
    const expiresAt = this.locks.get(key);
    if (expiresAt === undefined) return false;
    if (Date.now() >= expiresAt) {
      this.locks.delete(key);
      return false;
    }
    return true;
  }

  static async acquire(key: string, timeoutMs: number = 5000, ttlMs: number = Mutex.DEFAULT_TTL_MS): Promise<boolean> {
    const start = Date.now();
    while (this.isLocked(key)) {
      if (Date.now() - start > timeoutMs) {
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    this.locks.set(key, Date.now() + ttlMs);
    return true;
  }

  static release(key: string) {
    this.locks.delete(key);
  }
}
