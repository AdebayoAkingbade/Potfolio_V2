import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export type RateLimitOperation =
  | "ai_rewrite"
  | "ai_suggest"
  | "resume_import"
  | "github_import"
  | "analytics_event"
  | "draft_publish"
  | "custom";

// Hash raw keys to avoid storing sensitive raw identifiers (IPs, tokens, user IDs) in plaintext
export function hashRateLimitKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex").slice(0, 32);
}

// In-memory fallback adapter for local dev, offline mode, and fast unit tests
const localBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = localBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    localBuckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, limit - 1), resetAt };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, remaining: Math.max(0, limit - bucket.count), resetAt: bucket.resetAt };
}

export function resetMemoryRateLimits(): void {
  localBuckets.clear();
}

/**
 * Distributed rate limiter backed by Supabase PostgreSQL check_rate_limit RPC.
 * Atomically creates/resets the window, increments usage, and evaluates quota.
 * Falls back to in-memory sliding window adapter if Supabase is unavailable (local/test).
 */
export async function checkDistributedRateLimit(
  supabase: SupabaseClient | null,
  rawKey: string,
  limit: number,
  windowMs: number,
  operation: RateLimitOperation = "custom",
): Promise<RateLimitResult> {
  const hashedKey = hashRateLimitKey(rawKey);
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  if (!supabase) {
    return checkMemoryRateLimit(`${operation}:${hashedKey}`, limit, windowMs);
  }

  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: hashedKey,
      p_operation: operation,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      // In local development or testing without the RPC installed, fall back to memory adapter
      return checkMemoryRateLimit(`${operation}:${hashedKey}`, limit, windowMs);
    }

    const row = Array.isArray(data) ? data[0] : data;
    const allowed = Boolean(row.allowed);
    const remaining = typeof row.remaining === "number" ? row.remaining : 0;
    const resetAt = row.reset_at ? new Date(row.reset_at).getTime() : Date.now() + windowMs;

    return {
      ok: allowed,
      remaining,
      resetAt,
    };
  } catch {
    return checkMemoryRateLimit(`${operation}:${hashedKey}`, limit, windowMs);
  }
}

// Backward-compatible alias
export const checkRateLimit = checkMemoryRateLimit;
