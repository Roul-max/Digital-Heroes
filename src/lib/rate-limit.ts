// Simple in-memory rate limiter. Replace with Redis (Upstash) for multi-instance deploys.
const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count++;
  return { allowed: true };
}

export function clearRateLimit(key: string) {
  attempts.delete(key);
}
