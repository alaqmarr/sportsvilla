/**
 * In-memory sliding window rate limiter for protecting API endpoints
 * against abuse and brute-force attempts.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function purgeExpiredRateLimits(): number {
  const now = Date.now();
  let purged = 0;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
      purged++;
    }
  }
  return purged;
}

export function getRateLimitStoreSize(): number {
  return rateLimitStore.size;
}

// Clean up expired entries every 5 minutes (unref'd to prevent process hangs)
const cleanupInterval = setInterval(() => {
  purgeExpiredRateLimits();
}, 5 * 60 * 1000);

if (typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

/**
 * Checks if a key (e.g. IP + endpoint) has exceeded its rate limit.
 * @param key Unique identifier for the rate limit subject
 * @param maxRequests Maximum number of requests allowed within the window
 * @param windowMs Time window in milliseconds
 * @returns boolean true if allowed, false if rate limited
 */
export function checkRateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count += 1;
  return true;
}
