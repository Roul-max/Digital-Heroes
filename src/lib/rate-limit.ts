import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory fallback for local dev when Upstash env vars aren't set
const inMemory = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function inMemoryCheck(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = inMemory.get(key);
  if (!record || now > record.resetAt) {
    inMemory.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }
  record.count++;
  return { allowed: true };
}

// Build Upstash limiter lazily — only when env vars are present
let upstashLimiter: Ratelimit | null = null;

function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter) return upstashLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    upstashLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      // Sliding window: 5 requests per 15 minutes per key
      limiter: Ratelimit.slidingWindow(MAX_ATTEMPTS, "15 m"),
      analytics: false,
    });
    return upstashLimiter;
  } catch (e) {
    console.warn("[rate-limit] Failed to initialise Upstash — falling back to in-memory:", e);
    return null;
  }
}

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const limiter = getUpstashLimiter();
  if (!limiter) return inMemoryCheck(key);

  try {
    const result = await limiter.limit(key);
    return {
      allowed: result.success,
      retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
    };
  } catch (e) {
    console.warn("[rate-limit] Upstash request failed — falling back to in-memory:", e);
    return inMemoryCheck(key);
  }
}

// Kept for test compatibility; no-op when using Upstash
export function clearRateLimit(key: string) {
  inMemory.delete(key);
}
