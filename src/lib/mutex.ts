export class Mutex {
  private static locks: Set<string> = new Set();

  static async acquire(key: string, timeoutMs: number = 5000): Promise<boolean> {
    const start = Date.now();
    while (this.locks.has(key)) {
      if (Date.now() - start > timeoutMs) {
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    this.locks.add(key);
    return true;
  }

  static release(key: string) {
    this.locks.delete(key);
  }
}
