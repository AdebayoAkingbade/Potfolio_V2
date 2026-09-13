const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { ok: false as const, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true as const, remaining: limit - bucket.count };
}
